require('dotenv').config()

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

function createWindow() {
  if (!process.env.GEMINI_API_KEY) {
    dialog.showErrorBox(
      'Chave da API não encontrada',
      'Configure GEMINI_API_KEY no arquivo .env antes de iniciar o app.'
    )
    app.quit()
    return
  }

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
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: controles da janela
ipcMain.handle('window-minimize', () => mainWindow.minimize())
ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize()
  else mainWindow.maximize()
})
ipcMain.handle('window-close', () => mainWindow.close())

// IPC: envia mensagem ao agente com streaming
ipcMain.handle('send-message', async (event, { message, history, platform, model }) => {
  const agent = require('./agent')
  try {
    const result = await agent.chat(message, history, platform, model, (chunk) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('stream-chunk', chunk)
      }
    })
    // Sinaliza fim do streaming
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('stream-chunk', '__DONE__')
    }
    return result
  } catch (err) {
    console.error('[main] Erro no send-message:', err)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('stream-chunk', '__DONE__')
    }
    return `Erro ao chamar a API: ${err.message}`
  }
})

// IPC: carrega histórico do disco (legado — mantido por compatibilidade)
ipcMain.handle('load-history', async () => {
  return []
})

// IPC: salva histórico do disco (legado)
ipcMain.handle('save-history', async () => true)

// IPC: limpa histórico (legado)
ipcMain.handle('clear-history', async () => true)

// ── Chats múltiplos ──
const chatsDir = path.join(__dirname, '../data/chats')

function ensureChatsDir() {
  fs.mkdirSync(chatsDir, { recursive: true })
}

// Lista todos os chats ordenados por data (mais recente primeiro)
ipcMain.handle('list-chats', async () => {
  ensureChatsDir()
  const files = fs.readdirSync(chatsDir).filter(f => f.endsWith('.json'))
  return files
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(chatsDir, f), 'utf-8')) } catch { return null }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }))
})

// Carrega um chat pelo id
ipcMain.handle('load-chat', async (event, id) => {
  ensureChatsDir()
  const file = path.join(chatsDir, `${id}.json`)
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
})

// Salva/atualiza um chat
ipcMain.handle('save-chat', async (event, chat) => {
  ensureChatsDir()
  fs.writeFileSync(path.join(chatsDir, `${chat.id}.json`), JSON.stringify(chat, null, 2), 'utf-8')
  return true
})

// Deleta um chat
ipcMain.handle('delete-chat', async (event, id) => {
  const file = path.join(chatsDir, `${id}.json`)
  if (fs.existsSync(file)) fs.unlinkSync(file)
  return true
})
