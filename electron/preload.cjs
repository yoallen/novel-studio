// The only bridge between the window and the computer: the system's folder picker.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('storyCanon', {
  isDesktop: true,
  chooseFolder: (title) => ipcRenderer.invoke('choose-folder', typeof title === 'string' ? title.slice(0, 120) : undefined),
});
