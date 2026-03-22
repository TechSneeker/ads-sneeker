const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  sendMessage: (payload) => ipcRenderer.invoke('send-message', payload),
  loadHistory: () => ipcRenderer.invoke('load-history'),
  saveHistory: (history) => ipcRenderer.invoke('save-history', history),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  // Chats múltiplos
  listChats: () => ipcRenderer.invoke('list-chats'),
  loadChat: (id) => ipcRenderer.invoke('load-chat', id),
  saveChat: (chat) => ipcRenderer.invoke('save-chat', chat),
  deleteChat: (id) => ipcRenderer.invoke('delete-chat', id),
  // Operações
  listOperations: () => ipcRenderer.invoke('list-operations'),
  saveOperation: (op) => ipcRenderer.invoke('save-operation', op),
  deleteOperation: (id) => ipcRenderer.invoke('delete-operation', id),
  getOperation: (id) => ipcRenderer.invoke('get-operation', id),
  // Usage
  getUsage: () => ipcRenderer.invoke('get-usage'),
  clearUsage: () => ipcRenderer.invoke('clear-usage'),
  onStreamChunk: (callback) => ipcRenderer.on('stream-chunk', (_, chunk) => callback(chunk)),
  removeStreamListeners: () => ipcRenderer.removeAllListeners('stream-chunk'),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close')
})
