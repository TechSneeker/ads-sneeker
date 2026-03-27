require('dotenv').config()

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow
let loginWindow

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 1336,
    height: 768,
    minWidth: 1336,
    minHeight: 768,
    maxWidth: 1336,
    maxHeight: 768,
    title: 'ADSneeker',
    resizable: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0f0f0f'
  })
  loginWindow.loadFile(path.join(__dirname, 'login.html'))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 800,
    minHeight: 600,
    title: 'ADSneeker',
    resizable: true,
    movable: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0f0f0f'
  })

  mainWindow.loadFile(path.join(__dirname, 'chat.html'))

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  createLoginWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: versão
ipcMain.handle('get-version', () => {
  return require('./config').getVersion()
})

// IPC: controles da janela
ipcMain.handle('window-minimize', () => {
  const win = mainWindow || loginWindow
  if (win) win.minimize()
})
ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  }
})
ipcMain.handle('window-close', () => {
  const win = mainWindow || loginWindow
  if (win) win.close()
})

// IPC: auth
ipcMain.handle('auth-action', async (event, { mode, email, password }) => {
  const auth = require('./auth')
  const db   = require('./db')
  try {
    const result = mode === 'register'
      ? await auth.signUp(email, password)
      : await auth.signIn(email, password)
    if (!result.error && result.user) {
      db.setSession(result.session, result.user.id)
      // carrega chave Gemini do usuário em memória
      db.getSettings().catch(() => {})
    }
    return result
  } catch (err) {
    return { error: err.message }
  }
})

ipcMain.handle('open-main', async () => {
  createWindow()
  if (loginWindow && !loginWindow.isDestroyed()) loginWindow.close()
  loginWindow = null
})

// IPC: envia mensagem ao agente com streaming
const usageFile = path.join(__dirname, '../data/usage.json')

function loadUsage() {
  try { return JSON.parse(fs.readFileSync(usageFile, 'utf-8')) } catch { return { sessions: [] } }
}

function saveUsage(data) {
  fs.mkdirSync(path.dirname(usageFile), { recursive: true })
  fs.writeFileSync(usageFile, JSON.stringify(data, null, 2), 'utf-8')
}

ipcMain.handle('send-message', async (event, { message, history, platform, operation, model }) => {
  const agent = require('./agent')
  try {
    const result = await agent.chat(message, history, platform, operation, model, (chunk) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('stream-chunk', chunk)
      }
    })
    // Sinaliza fim do streaming
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('stream-chunk', '__DONE__')
    }

    // Persiste usage
    if (result.usage) {
      const usage = loadUsage()
      usage.sessions.push({
        ts: new Date().toISOString(),
        model: result.usage.modelId,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        cachedTokens: result.usage.cachedTokens || 0,
        costUSD: result.usage.costUSD,
        usingCache: result.usage.usingCache || false
      })
      saveUsage(usage)
    }

    return result.text
  } catch (err) {
    console.error('[main] Erro no send-message:', err)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('stream-chunk', '__DONE__')
    }
    return `Erro ao chamar a API: ${err.message}`
  }
})

ipcMain.handle('get-usage', async () => loadUsage())
ipcMain.handle('clear-usage', async () => { saveUsage({ sessions: [] }); return true })

// IPC: carrega histórico do disco (legado — mantido por compatibilidade)
ipcMain.handle('load-history', async () => {
  return []
})

// IPC: salva histórico do disco (legado)
ipcMain.handle('save-history', async () => true)

// IPC: limpa histórico (legado)
ipcMain.handle('clear-history', async () => true)

// ── Chats múltiplos ──

// Lista todos os chats ordenados por data (mais recente primeiro)
ipcMain.handle('list-chats', async () => {
  try { return await require('./db').listChats() } catch { return [] }
})

// Carrega um chat pelo id
ipcMain.handle('load-chat', async (event, id) => {
  try { return await require('./db').loadChat(id) } catch { return null }
})

// Salva/atualiza um chat
ipcMain.handle('save-chat', async (event, chat) => {
  try { return await require('./db').saveChat(chat) } catch (err) { return { error: err.message } }
})

// Deleta um chat
ipcMain.handle('delete-chat', async (event, id) => {
  try { return await require('./db').deleteChat(id) } catch { return false }
})

// ── Operações (Supabase) ──
ipcMain.handle('list-operations', async () => {
  try { return await require('./db').listOperations() } catch { return [] }
})

ipcMain.handle('save-operation', async (event, op) => {
  try { return await require('./db').saveOperation(op) } catch (err) { return { error: err.message } }
})

ipcMain.handle('delete-operation', async (event, id) => {
  try { return await require('./db').deleteOperation(id) } catch { return false }
})

ipcMain.handle('get-operation', async (event, slug) => {
  try { return await require('./db').getOperation(slug) } catch { return null }
})

// ── Configurações do usuário (Supabase) ──
ipcMain.handle('get-settings', async () => {
  try { return await require('./db').getSettings() } catch { return {} }
})

ipcMain.handle('save-settings', async (event, settings) => {
  try { return await require('./db').saveSettings(settings) } catch (err) { return { error: err.message } }
})
