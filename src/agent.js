const { GoogleGenerativeAI } = require('@google/generative-ai')
const fs = require('fs')
const path = require('path')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

function loadSystemPrompt() {
  const systemPath = path.join(__dirname, '../prompts/system.md')
  return fs.readFileSync(systemPath, 'utf-8')
}

function loadKnowledge(platform) {
  const knowledgeDir = path.join(__dirname, '../knowledge')
  let context = ''

  // Sempre carrega compliance, playbooks e warmup
  const alwaysLoad = ['compliance.md', 'playbooks.md', 'warmup.md']
  for (const file of alwaysLoad) {
    const filePath = path.join(knowledgeDir, file)
    if (fs.existsSync(filePath)) {
      context += `\n\n---\n## ${file.replace('.md', '').toUpperCase()}\n` + fs.readFileSync(filePath, 'utf-8')
    }
  }

  // Carrega conhecimento específico da plataforma
  if (platform && platform !== 'geral') {
    const filePath = path.join(knowledgeDir, `${platform}.md`)
    if (fs.existsSync(filePath)) {
      context += `\n\n---\n## PLATAFORMA ATIVA: ${platform.toUpperCase()}\n` + fs.readFileSync(filePath, 'utf-8')
    }
  } else {
    // Geral: carrega todas as plataformas
    for (const file of ['meta.md', 'google.md', 'tiktok.md']) {
      const filePath = path.join(knowledgeDir, file)
      if (fs.existsSync(filePath)) {
        context += `\n\n---\n## ${file.replace('.md', '').toUpperCase()}\n` + fs.readFileSync(filePath, 'utf-8')
      }
    }
  }

  return context
}

async function chat(userMessage, history, platform, modelId, onChunk) {
  console.log('[agent] Iniciando chat | platform:', platform, '| model:', modelId, '| mensagem:', userMessage.slice(0, 50))
  const systemPrompt = loadSystemPrompt()
  const knowledge = loadKnowledge(platform)
  const fullSystem = systemPrompt + '\n\n' + knowledge

  const model = genAI.getGenerativeModel({
    model: modelId || 'gemini-2.5-flash',
    systemInstruction: { parts: [{ text: fullSystem }] },
    generationConfig: { maxOutputTokens: 4096 }
  })

  const contents = [
    ...history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ]

  let fullResponse = ''

  console.log('[agent] Chamando Gemini API...')
  const result = await model.generateContentStream({ contents })

  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) {
      fullResponse += text
      onChunk(text)
    }
  }

  console.log('[agent] Resposta completa | tokens aprox:', fullResponse.length)
  return fullResponse
}

module.exports = { chat }
