# Implementation Plan: Ads Agent

## Overview

Construção incremental de um desktop app Electron para Windows — assistente especialista em gestão de anúncios digitais usando Google Gemini API. O plano segue a ordem: estrutura do projeto → módulo agent → main process → preload bridge → interface de chat → knowledge base → system prompt → configuração final, garantindo que cada etapa se integra à anterior.

## Tasks

- [ ] 1. Configurar estrutura do projeto e dependências
  - [x] 1.1 Criar estrutura de diretórios e `package.json`
    - Criar diretórios: `src/`, `knowledge/`, `prompts/`, `data/`
    - Criar `package.json` com `@google/generative-ai ^0.21.0`, `dotenv ^16.3.0`, `electron ^28.0.0` (dev), scripts `start` e `dev`
    - Criar `data/history.json` com `[]`
    - Criar `.env.example` com `GEMINI_API_KEY=sua_chave_aqui`
    - Criar `.gitignore` incluindo `.env`, `node_modules/`, `data/history.json`
    - _Requirements: 10.1, 10.2, 10.4, 10.7_

  - [x] 1.2 Criar `.kiro/steering.md` e `.kiro-mcp.json`
    - `.kiro/steering.md` com descrição da arquitetura, como rodar e convenções
    - `.kiro-mcp.json` com servidores MCP: `filesystem`, `memory`, `fetch`
    - _Requirements: 10.3, 10.5_

- [ ] 2. Implementar módulo Agent (`src/agent.js`)
  - [x] 2.1 Criar `src/agent.js` com funções `loadSystemPrompt`, `loadKnowledge` e `chat`
    - `loadSystemPrompt()`: lê `prompts/system.md` via `fs.readFileSync`
    - `loadKnowledge(platform)`: carrega sempre `compliance.md`, `playbooks.md`, `warmup.md`; carrega arquivo específico da plataforma ou todos se `geral`; usa `fs.existsSync` para ignorar arquivos ausentes
    - `chat(userMessage, history, platform, onChunk)`: monta system instruction (prompt + knowledge), converte histórico para formato `contents`, chama `generateContentStream` com `gemini-1.5-flash` e `maxOutputTokens: 4096`, emite chunks via callback
    - _Requirements: 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 8.6, 10.6_

  - [ ]* 2.2 Write property test: Knowledge loading by platform
    - **Property 6: Knowledge loading by platform**
    - Para cada valor de plataforma, verificar que os arquivos corretos são incluídos no contexto e que o system instruction é a concatenação esperada
    - **Validates: Requirements 7.2, 7.3, 7.5**

  - [ ]* 2.3 Write property test: History order preservation in API calls
    - **Property 8: History order preservation**
    - Gerar arrays aleatórios de histórico + mensagem atual e verificar que o array `contents` enviado à API mantém a ordem cronológica com a mensagem atual no final
    - **Validates: Requirements 8.6**

  - [ ]* 2.4 Write property test: Streaming chunk integrity
    - **Property 5: Streaming chunk integrity**
    - Gerar arrays aleatórios de strings (chunks) e verificar que a concatenação final é igual à junção de todos os chunks na ordem recebida
    - **Validates: Requirements 6.3, 6.4**

- [ ] 3. Implementar Main Process (`src/main.js`)
  - [x] 3.1 Criar `src/main.js` com configuração da BrowserWindow e handlers IPC
    - Carregar `dotenv` antes de qualquer operação
    - Validar presença de `GEMINI_API_KEY` — exibir `dialog.showErrorBox` e encerrar se ausente
    - Criar `BrowserWindow` com dimensões 1100×780, minWidth 800, minHeight 600, `titleBarStyle: 'hidden'`, overlay `#0f0f0f`, `backgroundColor: '#0f0f0f'`, `contextIsolation: true`, `nodeIntegration: false`
    - Abrir DevTools se `--dev` presente nos argumentos
    - Registrar handlers IPC: `send-message` (delega ao agent, repassa chunks via `webContents.send`), `load-history` (lê JSON, retorna `[]` se falhar), `save-history` (cria diretório `data/` se necessário, grava JSON), `clear-history` (sobrescreve com `[]`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.5, 6.3, 8.2, 8.3, 8.4, 8.5, 8.8_

  - [ ]* 3.2 Write property test: History persistence round trip
    - **Property 7: History persistence round trip**
    - Gerar arrays aleatórios de `HistoryEntry`, salvar em JSON, carregar de volta e verificar igualdade
    - **Validates: Requirements 8.2, 8.4**

- [ ] 4. Implementar Preload Bridge (`src/preload.js`)
  - [x] 4.1 Criar `src/preload.js` com `contextBridge.exposeInMainWorld`
    - Expor exatamente 6 funções: `sendMessage`, `loadHistory`, `saveHistory`, `clearHistory`, `onStreamChunk`, `removeStreamListeners`
    - `sendMessage`, `loadHistory`, `saveHistory`, `clearHistory` via `ipcRenderer.invoke`
    - `onStreamChunk` via `ipcRenderer.on('stream-chunk', ...)`
    - `removeStreamListeners` via `ipcRenderer.removeAllListeners('stream-chunk')`
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 4.2 Write property test: Preload bridge API contract
    - **Property 1: Preload bridge exposes correct API contract**
    - Verificar que o objeto exposto contém exatamente as 6 funções esperadas
    - **Validates: Requirements 2.2, 2.4**

- [ ] 5. Checkpoint — Verificar backend
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implementar interface de chat (`src/chat.html` + `src/styles.css`)
  - [x] 6.1 Criar `src/styles.css` com tema dark e layout completo
    - Cores: `#0f0f0f` (body), `#161616` (sidebar), `#1a1a1a` (chat area)
    - Sidebar fixa 220px, fonte `'Inter', system-ui, sans-serif`
    - Balões: usuário à direita `#2563eb`, agente à esquerda `#262626`
    - Input fixo no rodapé com borda azul ao focar
    - Chips de plataforma selecionáveis, animação de digitação, scrollbar fina
    - Transições suaves em hover e focus
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.9, 3.10_

  - [x] 6.2 Criar `src/chat.html` com estrutura HTML e lógica JavaScript
    - Estrutura: sidebar (logo, "Novo chat", quick actions, versão), main (platform selector, messages, input area)
    - Estado: `currentPlatform` (default `'geral'`), `chatHistory`, `isStreaming`
    - Ao carregar: `window.api.loadHistory()` e renderizar mensagens anteriores
    - Envio: Enter envia, Shift+Enter quebra linha; validar input não vazio
    - Exibir mensagem do usuário imediatamente, mostrar indicador de digitação
    - Chamar `window.api.sendMessage({message, history, platform})`
    - Receber chunks via `window.api.onStreamChunk()` e acrescentar ao balão do agente
    - Ao finalizar: remover indicador, salvar histórico via `window.api.saveHistory()`
    - Chips de plataforma: Geral (default), Meta, Google, TikTok — atualizam `currentPlatform` e estilo ativo
    - Quick Actions na sidebar: 6 atalhos que preenchem input com prompt contextualizado pela plataforma e enviam automaticamente
    - "Novo chat": limpa mensagens e chama `window.api.clearHistory()`
    - Auto-scroll para última mensagem
    - Renderização de markdown básico: `**bold**` → `<strong>`, `` `code` `` → `<code>`, `\n` → `<br>`, listas `-` → `<ul><li>`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.4, 6.7, 6.8, 8.1, 8.7_

  - [ ]* 6.3 Write property test: Markdown rendering transformation
    - **Property 2: Markdown rendering transformation**
    - Gerar strings com padrões markdown e verificar que a função produz as tags HTML correspondentes preservando o conteúdo
    - **Validates: Requirements 3.8**

  - [ ]* 6.4 Write property test: Platform selection consistency
    - **Property 3: Platform selection consistency**
    - Gerar sequências de seleções de plataforma e verificar que estado, estilo ativo e payload são consistentes
    - **Validates: Requirements 4.2, 4.3, 4.5**

  - [ ]* 6.5 Write property test: Quick action prompt generation
    - **Property 4: Quick action prompt generation**
    - Para cada combinação de quick action × plataforma, verificar que o prompt referencia a plataforma e o envio é disparado
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ] 7. Checkpoint — Verificar interface
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Criar Knowledge Base e System Prompt
  - [x] 8.1 Criar `prompts/system.md` com identidade e 6 módulos de conhecimento
    - Identidade: especialista sênior em tráfego pago (Meta, Google, TikTok)
    - Tom: direto, prático, terminologia do mercado (BM, pixel, lookalike, CBO, ABO, ROAS, CPM, CTR)
    - Módulos: criação de conta/BM, aquecimento, estrutura de campanhas, políticas/compliance, diagnóstico/recuperação, otimização/escala
    - Instruções: sinalizar riscos de ban, máximo 600 palavras, usar markdown
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 8.2 Criar arquivos da Knowledge Base em `knowledge/`
    - `compliance.md`: políticas de publicidade das 3 plataformas, nichos de risco, checklist de compliance
    - `playbooks.md`: playbooks práticos (lançamento, queda de resultados, escala, recuperação, migração, testes A/B, onboarding)
    - `warmup.md`: protocolos de aquecimento semana a semana para Meta, Google e TikTok
    - `meta.md`: conhecimento avançado Meta Ads (Advantage+, API de Conversões, bidding, públicos, pixels, criativos, regras automáticas)
    - `google.md`: conhecimento avançado Google Ads (Search, PMax, Display, YouTube, Smart Bidding, Quality Score, GA4)
    - `tiktok.md`: conhecimento avançado TikTok Ads (formatos, pixel, públicos, criativos, Creative Center, TikTok Shop)
    - Cada arquivo com conteúdo substantivo (mínimo 500 palavras)
    - _Requirements: 7.6_

- [ ] 9. Integração final e wiring
  - [x] 9.1 Conectar todos os componentes e validar fluxo completo
    - Verificar que `main.js` carrega `agent.js` corretamente
    - Verificar que `chat.html` referencia `styles.css`
    - Verificar que `preload.js` é carregado pela BrowserWindow
    - Verificar que todos os caminhos de arquivo (knowledge, prompts, data) estão corretos relativos à estrutura do projeto
    - Verificar que o fluxo completo funciona: input → IPC → agent → Gemini API → streaming → display → save history
    - _Requirements: 1.2, 2.1, 2.5, 6.3, 6.5_

- [ ] 10. Checkpoint final — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de corretude
- O projeto usa JavaScript (Node.js/Electron) com Google Gemini API (`@google/generative-ai` SDK)
- A linguagem de implementação é JavaScript conforme definido no design e na arquitetura Electron
