# Ads Agent — Steering

## O que é este projeto

Desktop app Electron para Windows — assistente especialista em gestão de anúncios digitais (Meta Ads, Google Ads, TikTok Ads). Usa a API do Google Gemini (modelo `gemini-1.5-flash`) com streaming obrigatório, base de conhecimento local em arquivos `.md` e histórico persistido em JSON.

## Arquitetura

O app segue a arquitetura multi-processo do Electron:

- **Main Process** (`src/main.js`) — Gerencia a janela, IPC handlers, I/O de disco e delegação ao Agent. Carrega `.env` via `dotenv` na inicialização.
- **Renderer Process** (`src/chat.html` + `src/styles.css`) — Interface de chat com sidebar, seletor de plataforma, quick actions e renderização de markdown básico. Lógica em JavaScript inline.
- **Preload Bridge** (`src/preload.js`) — Expõe API segura ao Renderer via `contextBridge.exposeInMainWorld`. Funções: `sendMessage`, `loadHistory`, `saveHistory`, `clearHistory`, `onStreamChunk`, `removeStreamListeners`.
- **Agent Module** (`src/agent.js`) — Monta contexto (system prompt + knowledge base + histórico) e chama `generateContentStream` da SDK `@google/generative-ai`. Emite chunks via callback.
- **Knowledge Base** (`knowledge/`) — Arquivos `.md` carregados seletivamente por plataforma. Sempre carrega: `compliance.md`, `playbooks.md`, `warmup.md`. Plataforma específica carrega seu `.md`; "geral" carrega todos.
- **System Prompt** (`prompts/system.md`) — Define identidade, tom e módulos de conhecimento do agente.
- **History Store** (`data/history.json`) — Array de `{ role, content }` persistido localmente.

### Fluxo de mensagem

1. Usuário digita mensagem → Renderer envia via `window.api.sendMessage()`
2. Preload encaminha via `ipcRenderer.invoke('send-message', payload)`
3. Main Process delega ao `agent.chat(message, history, platform, onChunk)`
4. Agent monta system instruction, chama `generateContentStream`
5. Chunks são emitidos via callback → Main envia `webContents.send('stream-chunk', text)` → Renderer acrescenta ao balão
6. Ao finalizar, Renderer salva histórico via `window.api.saveHistory()`

## Como rodar

```bash
# Instalar dependências
npm install

# Configurar chave da API
cp .env.example .env
# Editar .env e inserir sua GEMINI_API_KEY

# Rodar em produção
npm start

# Rodar em modo desenvolvimento (abre DevTools)
npm run dev
```

## Dependências

- `@google/generative-ai ^0.21.0` — SDK oficial do Google Gemini
- `dotenv ^16.3.0` — Carregamento de variáveis de ambiente
- `electron ^28.0.0` (dev) — Framework desktop

## Convenções de desenvolvimento

- **Streaming obrigatório**: Toda chamada à API usa `generateContentStream()`, nunca `generateContent()`.
- **Segurança Electron**: `contextIsolation: true`, `nodeIntegration: false`. Renderer acessa Node.js apenas via preload bridge.
- **Histórico**: Salvo automaticamente após cada resposta completa. "Novo chat" sobrescreve com `[]`.
- **Knowledge base**: Arquivos ausentes são ignorados silenciosamente (`fs.existsSync` antes de ler).
- **Variáveis de ambiente**: `.env` nunca commitado. Usar `.env.example` como referência.
- **Modelo**: `gemini-1.5-flash` com `maxOutputTokens: 4096`.
- **Linguagem**: JavaScript (CommonJS). Sem TypeScript, sem bundler.
- **Tema**: Dark mode — cores `#0f0f0f`, `#161616`, `#1a1a1a`. Fonte `'Inter', system-ui, sans-serif`.
