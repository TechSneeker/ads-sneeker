# Requirements Document

## Introduction

O **Ads Agent** é um desktop app Electron para Windows que funciona como assistente especialista em gestão de anúncios digitais (Meta Ads, Google Ads, TikTok Ads). O usuário interage via interface de chat local; o assistente usa a API do Google Gemini (tier gratuito) com um system prompt especializado, carrega base de conhecimento local em arquivos `.md` e persiste o histórico de conversas em JSON. O objetivo é oferecer orientação prática e estratégica sobre tráfego pago — desde criação de contas até diagnóstico de bans e escala de campanhas.

---

## Glossary

- **App**: O desktop app Electron `ads-agent` como um todo.
- **Main_Process**: O processo principal do Electron (`src/main.js`) que gerencia janelas e IPC.
- **Renderer**: O processo de renderização do Electron que executa `src/chat.html`.
- **Agent**: O módulo `src/agent.js` responsável por chamar a API do Google Gemini via `@google/generative-ai` SDK.
- **Preload_Bridge**: O script `src/preload.js` que expõe a API segura ao Renderer via `contextBridge`.
- **Knowledge_Base**: Conjunto de arquivos `.md` em `knowledge/` com conteúdo especializado por plataforma.
- **System_Prompt**: Arquivo `prompts/system.md` que define identidade, tom e módulos de conhecimento do agente.
- **History_Store**: Arquivo `data/history.json` que persiste o histórico de conversas localmente.
- **Platform**: Plataforma de anúncios selecionada pelo usuário (meta, google, tiktok ou geral).
- **Quick_Action**: Atalho de sidebar que preenche e envia automaticamente um prompt contextualizado.
- **Streaming_Response**: Resposta da API do Google Gemini entregue em chunks via `generateContentStream`.
- **IPC**: Inter-Process Communication do Electron entre Main_Process e Renderer.

---

## Requirements

### Requirement 1: Inicialização e Janela Principal

**User Story:** As a usuário, I want que o app abra uma janela desktop funcional ao executar `npm start`, so that eu possa começar a usar o assistente imediatamente.

#### Acceptance Criteria

1. WHEN o usuário executa `npm start`, THE App SHALL abrir uma janela Electron com dimensões mínimas de 800×600 pixels e dimensões padrão de 1100×780 pixels.
2. THE App SHALL carregar a interface de chat (`src/chat.html`) como conteúdo principal da janela.
3. THE App SHALL aplicar `titleBarStyle: 'hidden'` com overlay de cor `#0f0f0f` e altura de 36px para integração visual no Windows.
4. THE App SHALL definir `backgroundColor: '#0f0f0f'` para evitar flash branco durante o carregamento.
5. WHEN o processo principal é iniciado com a flag `--dev`, THE Main_Process SHALL abrir o DevTools automaticamente.
6. THE Main_Process SHALL carregar variáveis de ambiente do arquivo `.env` via `dotenv` antes de qualquer outra operação.
7. IF o arquivo `.env` não contiver `GEMINI_API_KEY`, THEN THE App SHALL exibir uma mensagem de erro informando que a chave da API é obrigatória.

---

### Requirement 2: Segurança e Isolamento de Processos

**User Story:** As a desenvolvedor, I want que o Renderer não tenha acesso direto ao Node.js, so that a aplicação siga as melhores práticas de segurança do Electron.

#### Acceptance Criteria

1. THE Main_Process SHALL configurar `contextIsolation: true` e `nodeIntegration: false` em todas as janelas criadas.
2. THE Preload_Bridge SHALL expor ao Renderer exclusivamente as funções: `sendMessage`, `loadHistory`, `saveHistory`, `clearHistory`, `onStreamChunk` e `removeStreamListeners`.
3. THE Preload_Bridge SHALL utilizar `contextBridge.exposeInMainWorld` para expor a API ao Renderer.
4. WHEN o Renderer invoca qualquer função da API, THE Preload_Bridge SHALL encaminhar a chamada ao Main_Process via `ipcRenderer.invoke` ou `ipcRenderer.on`.
5. THE Main_Process SHALL registrar handlers IPC para todos os canais: `send-message`, `load-history`, `save-history` e `clear-history`.

---

### Requirement 3: Interface de Chat

**User Story:** As a usuário, I want uma interface de chat moderna e responsiva, so that eu possa conversar com o assistente de forma fluida e agradável.

#### Acceptance Criteria

1. THE Renderer SHALL exibir uma sidebar fixa de 220px de largura com logo, botão "Novo chat", atalhos rápidos e versão do app.
2. THE Renderer SHALL exibir uma área principal de chat com seletor de plataforma no topo, área de mensagens com scroll e área de input fixada no rodapé.
3. THE Renderer SHALL aplicar tema dark com as cores: `#0f0f0f` (body), `#161616` (sidebar), `#1a1a1a` (área de chat).
4. THE Renderer SHALL renderizar mensagens do usuário alinhadas à direita com fundo `#2563eb` e mensagens do agente alinhadas à esquerda com fundo `#262626`.
5. WHEN o usuário pressiona Enter sem Shift, THE Renderer SHALL enviar a mensagem do input.
6. WHEN o usuário pressiona Shift+Enter, THE Renderer SHALL inserir uma quebra de linha no input sem enviar.
7. THE Renderer SHALL aplicar scroll automático para a última mensagem após cada nova mensagem ser adicionada.
8. THE Renderer SHALL renderizar markdown básico nas respostas do agente: `**texto**` como `<strong>`, `` `código` `` como `<code>`, `\n` como `<br>` e listas com `-` como `<ul><li>`.
9. THE Renderer SHALL usar a fonte `'Inter', system-ui, sans-serif` em toda a interface.
10. THE Renderer SHALL exibir scrollbar personalizada fina e discreta na área de mensagens.

---

### Requirement 4: Seleção de Plataforma

**User Story:** As a usuário, I want selecionar a plataforma de anúncios com a qual estou trabalhando, so that o assistente carregue o conhecimento específico mais relevante para minha pergunta.

#### Acceptance Criteria

1. THE Renderer SHALL exibir chips de seleção de plataforma no topo da área de chat com as opções: Geral, Meta, Google e TikTok.
2. WHEN o usuário seleciona um chip de plataforma, THE Renderer SHALL atualizar a variável `currentPlatform` para o valor correspondente (geral, meta, google ou tiktok).
3. WHEN o usuário seleciona um chip de plataforma, THE Renderer SHALL aplicar estilo visual de seleção ativo ao chip escolhido e remover dos demais.
4. THE Renderer SHALL iniciar com a plataforma "Geral" selecionada por padrão.
5. WHEN uma mensagem é enviada, THE Renderer SHALL incluir o valor atual de `currentPlatform` no payload enviado ao Main_Process.

---

### Requirement 5: Atalhos Rápidos (Quick Actions)

**User Story:** As a usuário, I want atalhos na sidebar para tarefas comuns, so that eu possa iniciar conversas sobre tópicos frequentes sem digitar prompts do zero.

#### Acceptance Criteria

1. THE Renderer SHALL exibir na sidebar os seguintes Quick_Actions: "Criar conta do zero", "Protocolo de aquecimento", "Estruturar campanha", "Diagnóstico de ban", "Revisar copy/criativo" e "Escalar campanha".
2. WHEN o usuário clica em um Quick_Action, THE Renderer SHALL preencher o input com um prompt contextualizado correspondente à ação.
3. WHEN o usuário clica em um Quick_Action, THE Renderer SHALL enviar o prompt automaticamente sem exigir ação adicional do usuário.
4. WHEN um Quick_Action é acionado, THE Renderer SHALL considerar a plataforma atualmente selecionada ao formular o prompt contextualizado.

---

### Requirement 6: Envio de Mensagens e Streaming

**User Story:** As a usuário, I want ver a resposta do assistente sendo gerada em tempo real, so that eu não precise esperar o texto completo para começar a ler.

#### Acceptance Criteria

1. WHEN o usuário envia uma mensagem, THE Renderer SHALL exibir imediatamente a mensagem do usuário na área de chat.
2. WHEN o usuário envia uma mensagem, THE Renderer SHALL exibir um indicador de digitação animado (`...`) enquanto aguarda a primeira resposta do agente.
3. WHEN o Main_Process recebe um chunk de streaming, THE Main_Process SHALL emitir o evento `stream-chunk` para o Renderer via `webContents.send`.
4. WHEN o Renderer recebe um chunk via `onStreamChunk`, THE Renderer SHALL acrescentar o texto ao balão de resposta do agente em tempo real.
5. THE Agent SHALL utilizar `model.generateContentStream()` da SDK do Google Gemini para todas as chamadas à API.
6. THE Agent SHALL usar o modelo `gemini-1.5-flash` com `maxOutputTokens: 4096`.
7. WHEN o streaming é concluído, THE Renderer SHALL remover o indicador de digitação e exibir a resposta completa.
8. WHEN o streaming é concluído, THE Renderer SHALL salvar o histórico atualizado via `window.api.saveHistory()`.

---

### Requirement 7: Base de Conhecimento

**User Story:** As a usuário, I want que o assistente use conhecimento especializado por plataforma, so that as respostas sejam precisas e contextualizadas para o meu caso.

#### Acceptance Criteria

1. THE Agent SHALL carregar o System_Prompt do arquivo `prompts/system.md` a cada chamada.
2. THE Agent SHALL sempre carregar os arquivos `compliance.md`, `playbooks.md` e `warmup.md` da Knowledge_Base independentemente da plataforma selecionada.
3. WHEN a Platform selecionada é `meta`, `google` ou `tiktok`, THE Agent SHALL carregar o arquivo `.md` correspondente da Knowledge_Base e incluí-lo no contexto com o cabeçalho `## PLATAFORMA ATIVA: {PLATFORM}`.
4. WHEN a Platform selecionada é `geral`, THE Agent SHALL carregar todos os arquivos de plataforma (`meta.md`, `google.md`, `tiktok.md`) da Knowledge_Base.
5. THE Agent SHALL concatenar o System_Prompt com o conteúdo da Knowledge_Base e enviar como instrução de sistema na chamada à API do Gemini.
6. THE Knowledge_Base SHALL conter arquivos com conteúdo substantivo para cada tópico: `meta.md`, `google.md`, `tiktok.md`, `warmup.md`, `compliance.md` e `playbooks.md`.
7. IF um arquivo da Knowledge_Base não existir no disco, THEN THE Agent SHALL prosseguir sem incluir esse arquivo no contexto, sem lançar erro fatal.

---

### Requirement 8: Histórico de Conversas

**User Story:** As a usuário, I want que o histórico das minhas conversas seja salvo entre sessões, so that eu possa retomar conversas anteriores sem perder contexto.

#### Acceptance Criteria

1. WHEN o App é iniciado, THE Renderer SHALL carregar o histórico existente via `window.api.loadHistory()` e renderizar as mensagens anteriores na área de chat.
2. THE Main_Process SHALL ler o histórico do arquivo `data/history.json` ao receber o evento IPC `load-history`.
3. IF o arquivo `data/history.json` não existir, THEN THE Main_Process SHALL retornar um array vazio `[]` sem lançar erro.
4. WHEN o usuário envia uma mensagem e recebe uma resposta completa, THE Main_Process SHALL gravar o histórico atualizado em `data/history.json` ao receber o evento IPC `save-history`.
5. THE Main_Process SHALL criar o diretório `data/` automaticamente se ele não existir ao salvar o histórico.
6. THE Agent SHALL incluir o histórico de mensagens anteriores no array `contents` enviado à API do Gemini, mantendo a ordem cronológica.
7. WHEN o usuário clica em "Novo chat", THE Renderer SHALL limpar a área de mensagens e chamar `window.api.clearHistory()`.
8. WHEN `clear-history` é recebido, THE Main_Process SHALL sobrescrever `data/history.json` com `[]`.

---

### Requirement 9: System Prompt e Identidade do Agente

**User Story:** As a usuário, I want que o assistente tenha personalidade e conhecimento especializado em tráfego pago, so that as respostas sejam práticas, diretas e confiáveis.

#### Acceptance Criteria

1. THE System_Prompt SHALL definir a identidade do agente como especialista sênior em tráfego pago com experiência em Meta Ads, Google Ads e TikTok Ads.
2. THE System_Prompt SHALL instruir o agente a usar linguagem direta e prática, com terminologia do mercado (BM, pixel, lookalike, CBO, ABO, ROAS, CPM, CTR).
3. THE System_Prompt SHALL conter módulos de conhecimento cobrindo: criação de conta e Business Manager, aquecimento de conta, estrutura de campanhas, políticas e compliance, diagnóstico e recuperação, e otimização e escala.
4. THE System_Prompt SHALL instruir o agente a sinalizar explicitamente riscos de ban ou reprovação quando relevantes.
5. THE System_Prompt SHALL instruir o agente a responder com no máximo 600 palavras salvo necessidade justificada.
6. THE System_Prompt SHALL instruir o agente a usar formatação markdown nas respostas (negrito, código, listas numeradas).

---

### Requirement 10: Configuração e Dependências

**User Story:** As a desenvolvedor, I want que o projeto tenha configuração clara e dependências mínimas, so that eu possa instalar e executar o app com poucos passos.

#### Acceptance Criteria

1. THE App SHALL declarar como dependência de produção `@google/generative-ai ^0.21.0` e como dependência de desenvolvimento `electron ^28.0.0`.
2. THE App SHALL incluir um arquivo `.env.example` com a variável `GEMINI_API_KEY=sua_chave_aqui` como referência para o usuário.
3. THE App SHALL incluir um arquivo `.kiro-mcp.json` com configuração dos servidores MCP: `filesystem`, `memory` e `fetch`.
4. THE App SHALL incluir um script `start` (`electron .`) e um script `dev` (`electron . --dev`) no `package.json`.
5. THE App SHALL incluir um arquivo `.kiro/steering.md` descrevendo a arquitetura, como rodar o projeto e as convenções de desenvolvimento.
6. THE App SHALL sempre usar streaming na chamada à API (nunca `generateContent` sem stream).
7. THE App SHALL nunca incluir o arquivo `.env` em commits (deve estar no `.gitignore`).
