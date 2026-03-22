const { GoogleGenerativeAI } = require('@google/generative-ai')
const { GoogleAICacheManager } = require('@google/generative-ai/server')
const fs = require('fs')
const path = require('path')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const cacheManager = new GoogleAICacheManager(process.env.GEMINI_API_KEY)

// Preços por 1M tokens em USD (input / output / cached_input)
const MODEL_PRICING = {
  'gemini-2.5-flash':              { input: 0.15,   output: 1.25,  cached: 0.03  },
  'gemini-2.5-pro':                { input: 0.625,  output: 5.00,  cached: 0.125 },
  'gemini-2.5-flash-lite':         { input: 0.05,   output: 0.20,  cached: 0.01  },
  'gemini-3-flash-preview':        { input: 0.25,   output: 1.50,  cached: 0.05  },
  'gemini-3.1-pro-preview':        { input: 1.00,   output: 6.00,  cached: 0.20  },
  'gemini-3.1-flash-lite-preview': { input: 0.125,  output: 0.75,  cached: 0.0125 },
}

function getPricing(modelId) {
  return MODEL_PRICING[modelId] || { input: 0.15, output: 1.25, cached: 0.03 }
}

function calcCostUSD(inputTokens, outputTokens, cachedTokens, modelId) {
  const p = getPricing(modelId)
  const freshInput = Math.max(0, inputTokens - cachedTokens)
  return (freshInput      / 1_000_000) * p.input
       + (cachedTokens    / 1_000_000) * p.cached
       + (outputTokens    / 1_000_000) * p.output
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

function loadOperationKnowledge(operation) {
  if (!operation) return ''
  const p = path.join(__dirname, '../knowledge/operations', `${operation}.md`)
  if (!fs.existsSync(p)) return ''
  return `\n\n## OPERAÇÃO ATIVA\n` + fs.readFileSync(p, 'utf-8')
}

async function getOrCreateCache(modelId) {
  const cached = cacheStore[modelId]
  if (cached && cached.expiresAt > Date.now()) {
    console.log('[cache] Reutilizando cache:', cached.name)
    return cached.name
  }

  console.log('[cache] Criando novo cache para modelo:', modelId)
  const systemPrompt = loadSystemPrompt()
  const staticKnowledge = loadStaticKnowledge()
  const fullContent = systemPrompt + '\n\n' + staticKnowledge

  const result = await cacheManager.create({
    model: modelId,
    contents: [{ role: 'user', parts: [{ text: fullContent }] },
               { role: 'model', parts: [{ text: 'Entendido. Estou pronto para responder sobre tráfego pago.' }] }],
    ttlSeconds: CACHE_TTL_SECONDS,
  })

  cacheStore[modelId] = {
    name: result.name,
    expiresAt: Date.now() + (CACHE_TTL_SECONDS - 60) * 1000
  }
  saveCacheStore(cacheStore)

  console.log('[cache] Cache criado:', result.name)
  return result.name
}

async function chat(userMessage, history, platform, operation, modelId, onChunk) {
  const mid = modelId || 'gemini-2.5-flash'
  console.log('[agent] chat | model:', mid, '| platform:', platform, '| operation:', operation)

  let model
  let usingCache = false

  try {
    const cacheName = await getOrCreateCache(mid)
    const cachedContent = await cacheManager.get(cacheName)
    model = genAI.getGenerativeModelFromCachedContent(cachedContent, {
      generationConfig: { maxOutputTokens: 4096 }
    })
    usingCache = true
    console.log('[cache] Modelo carregado com cache')
  } catch (err) {
    console.warn('[cache] Falha ao usar cache, usando modo normal:', err.message)
    const systemPrompt = loadSystemPrompt()
    const staticKnowledge = loadStaticKnowledge()
    model = genAI.getGenerativeModel({
      model: mid,
      systemInstruction: { parts: [{ text: systemPrompt + '\n\n' + staticKnowledge }] },
      generationConfig: { maxOutputTokens: 4096 }
    })
  }

  // Operação e compliance da plataforma são sempre dinâmicos (fora do cache)
  const operationCtx = loadOperationKnowledge(operation)
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
  const costUSD      = calcCostUSD(inputTokens, outputTokens, cachedTokens, mid)

  console.log(`[agent] tokens: in=${inputTokens} cached=${cachedTokens} out=${outputTokens} cost=$${costUSD.toFixed(6)} cache=${usingCache}`)

  return {
    text: fullResponse,
    usage: { inputTokens, outputTokens, cachedTokens, costUSD, modelId: mid, usingCache }
  }
}

module.exports = { chat }
