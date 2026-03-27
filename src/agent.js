const { GoogleGenerativeAI } = require('@google/generative-ai')
const { GoogleAICacheManager } = require('@google/generative-ai/server')
const fs = require('fs')
const path = require('path')

// Clientes por chave de API (cache em memória para não recriar a cada chamada)
const clientCache = {}

function getApiKey() {
  try {
    const db = require('./db')
    const key = db.getUserGeminiKey()
    if (key) return key
  } catch (_) {}
  return process.env.GEMINI_API_KEY
}

function getClients() {
  const apiKey = getApiKey()
  if (!clientCache[apiKey]) {
    clientCache[apiKey] = {
      genAI: new GoogleGenerativeAI(apiKey),
      cacheManager: new GoogleAICacheManager(apiKey)
    }
  }
  return clientCache[apiKey]
}

// Preços por 1M tokens em USD (input / output / cached_read / cache_storage por hora)
const MODEL_PRICING = {
  'gemini-2.5-flash':              { input: 0.15,   output: 1.25,  cached: 0.03,   storage: 1.00  },
  'gemini-2.5-pro':                { input: 0.625,  output: 5.00,  cached: 0.125,  storage: 4.50  },
  'gemini-2.5-flash-lite':         { input: 0.05,   output: 0.20,  cached: 0.01,   storage: 0.25  },
  'gemini-3-flash-preview':        { input: 0.25,   output: 1.50,  cached: 0.05,   storage: 1.00  },
  'gemini-3.1-pro-preview':        { input: 1.00,   output: 6.00,  cached: 0.20,   storage: 4.50  },
  'gemini-3.1-flash-lite-preview': { input: 0.125,  output: 0.75,  cached: 0.0125, storage: 0.25  },
}

function getPricing(modelId) {
  return MODEL_PRICING[modelId] || { input: 0.15, output: 1.25, cached: 0.03, storage: 1.00 }
}

function calcCostUSD(inputTokens, outputTokens, cachedTokens, modelId) {
  const p = getPricing(modelId)
  const freshInput = Math.max(0, inputTokens - cachedTokens)
  return (freshInput      / 1_000_000) * p.input
       + (cachedTokens    / 1_000_000) * p.cached
       + (outputTokens    / 1_000_000) * p.output
}

// Calcula custo de criação/storage do cache
// TTL em horas, tokens = tamanho do cache
function calcCacheStorageCostUSD(tokens, modelId, ttlSeconds) {
  const p = getPricing(modelId)
  const hours = ttlSeconds / 3600
  return (tokens / 1_000_000) * p.storage * hours
}

const CACHE_TTL_SECONDS = 86400 // 24 horas
const CACHE_STORE_PATH = path.join(__dirname, '../data/cache.json')

// Carrega cache persistido do disco
function loadCacheStore() {
  try {
    if (fs.existsSync(CACHE_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_STORE_PATH, 'utf-8'))
    }
  } catch (_) {}
  return {}
}

function saveCacheStore(store) {
  try {
    fs.writeFileSync(CACHE_STORE_PATH, JSON.stringify(store, null, 2))
  } catch (_) {}
}

// Cache: modelId -> { name, expiresAt }
const cacheStore = loadCacheStore()

function loadSystemPrompt() {
  return fs.readFileSync(path.join(__dirname, '../prompts/system.md'), 'utf-8')
}

function loadStaticKnowledge() {
  const dir = path.join(__dirname, '../knowledge')
  const files = ['playbooks.md', 'warmup.md', 'meta.md', 'google.md', 'tiktok.md', 'copywriting.md', 'tracking.md']
  let ctx = ''
  // compliance geral (nichos de risco, documentação) — sempre no cache
  const geralCompliance = path.join(dir, 'compliance/geral.md')
  if (fs.existsSync(geralCompliance)) {
    ctx += `\n\n---\n## COMPLIANCE GERAL\n` + fs.readFileSync(geralCompliance, 'utf-8')
  }
  for (const file of files) {
    const p = path.join(dir, file)
    if (fs.existsSync(p)) {
      ctx += `\n\n---\n## ${file.replace('.md', '').toUpperCase()}\n` + fs.readFileSync(p, 'utf-8')
    }
  }
  return ctx
}

function loadPlatformCompliance(platform) {
  if (!platform || platform === 'geral') return ''
  const p = path.join(__dirname, '../knowledge/compliance', `${platform}.md`)
  if (!fs.existsSync(p)) return ''
  return `\n\n## COMPLIANCE DA PLATAFORMA ATIVA (${platform.toUpperCase()})\n` + fs.readFileSync(p, 'utf-8')
}

async function getOrCreateCache(modelId) {
  const cached = cacheStore[modelId]
  if (cached && cached.expiresAt > Date.now()) {
    console.log('[cache] Reutilizando cache:', cached.name)
    return { name: cached.name, isNew: false }
  }

  console.log('[cache] Criando novo cache para modelo:', modelId)
  const systemPrompt = loadSystemPrompt()
  const staticKnowledge = loadStaticKnowledge()
  const fullContent = systemPrompt + '\n\n' + staticKnowledge

  const { cacheManager: cm } = getClients()
  const result = await cm.create({
    model: modelId,
    contents: [{ role: 'user', parts: [{ text: fullContent }] },
               { role: 'model', parts: [{ text: 'Entendido. Estou pronto para responder sobre tráfego pago.' }] }],
    ttlSeconds: CACHE_TTL_SECONDS,
  })

  cacheStore[modelId] = {
    name: result.name,
    expiresAt: Date.now() + (CACHE_TTL_SECONDS - 60) * 1000,
    tokenCount: result.usageMetadata?.totalTokenCount || 0
  }
  saveCacheStore(cacheStore)

  console.log('[cache] Cache criado:', result.name, '| tokens:', cacheStore[modelId].tokenCount)
  return { name: result.name, isNew: true, tokenCount: cacheStore[modelId].tokenCount }
}

async function chat(userMessage, history, platform, operation, modelId, onChunk) {
  const mid = modelId || 'gemini-2.5-flash'
  console.log('[agent] chat | model:', mid, '| platform:', platform, '| operation:', operation)

  let model
  let usingCache = false
  let cacheStorageCostUSD = 0

  try {
    const { name: cacheName, isNew, tokenCount } = await getOrCreateCache(mid)
    const { genAI, cacheManager } = getClients()
    const cachedContent = await cacheManager.get(cacheName)
    model = genAI.getGenerativeModelFromCachedContent(cachedContent, {
      generationConfig: { maxOutputTokens: 4096 }
    })
    usingCache = true
    // Se o cache foi criado agora, contabiliza o custo de storage
    if (isNew && tokenCount) {
      cacheStorageCostUSD = calcCacheStorageCostUSD(tokenCount, mid, CACHE_TTL_SECONDS)
      console.log(`[cache] Custo de storage: $${cacheStorageCostUSD.toFixed(6)}`)
    }
    console.log('[cache] Modelo carregado com cache')
  } catch (err) {
    console.warn('[cache] Falha ao usar cache, usando modo normal:', err.message)
    const systemPrompt = loadSystemPrompt()
    const staticKnowledge = loadStaticKnowledge()
    const { genAI: g } = getClients()
    model = g.getGenerativeModel({
      model: mid,
      systemInstruction: { parts: [{ text: systemPrompt + '\n\n' + staticKnowledge }] },
      generationConfig: { maxOutputTokens: 4096 }
    })
  }

  // Operação e compliance da plataforma são sempre dinâmicos (fora do cache)
  let operationCtx = ''
  if (operation) {
    try {
      const db = require('./db')
      const op = await db.getOperationById(operation)
      if (op && op.content) {
        operationCtx = `\n\n## OPERAÇÃO ATIVA: ${op.name}\n${op.content}`
      }
    } catch (err) {
      console.warn('[agent] Erro ao carregar operação:', err.message)
    }
  }
  
  const platformCtx = loadPlatformCompliance(platform)
  const dynamicCtx = [platformCtx, operationCtx].filter(Boolean).join('\n\n')
  const finalMessage = dynamicCtx
    ? `${dynamicCtx}\n\n[PERGUNTA DO USUÁRIO]\n${userMessage}`
    : userMessage

  const contents = [
    ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
    { role: 'user', parts: [{ text: finalMessage }] }
  ]

  let fullResponse = ''
  const result = await model.generateContentStream({ contents })

  let usageMeta = null
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) { fullResponse += text; onChunk(text) }
    if (chunk.usageMetadata) usageMeta = chunk.usageMetadata
  }

  if (!usageMeta) {
    try { usageMeta = (await result.response).usageMetadata } catch (_) {}
  }

  const inputTokens  = usageMeta?.promptTokenCount          || 0
  const outputTokens = usageMeta?.candidatesTokenCount      || 0
  const cachedTokens = usageMeta?.cachedContentTokenCount   || 0
  const costUSD      = calcCostUSD(inputTokens, outputTokens, cachedTokens, mid) + cacheStorageCostUSD

  console.log(`[agent] tokens: in=${inputTokens} cached=${cachedTokens} out=${outputTokens} storage=$${cacheStorageCostUSD.toFixed(6)} total=$${costUSD.toFixed(6)} cache=${usingCache}`)

  return {
    text: fullResponse,
    usage: { inputTokens, outputTokens, cachedTokens, costUSD, modelId: mid, usingCache }
  }
}

module.exports = { chat }
