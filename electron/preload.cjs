// The only bridge between the window and the computer: the system's folder picker, and saving an exported file.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('storyCanon', {
  isDesktop: true,
  chooseFolder: (title) => ipcRenderer.invoke('choose-folder', typeof title === 'string' ? title.slice(0, 120) : undefined),
  saveFile: (name, base64) => ipcRenderer.invoke('save-file', String(name), String(base64)),
  showFile: (path) => ipcRenderer.invoke('show-file', String(path)),
});
