// The only bridge between the window and the computer: the system's folder picker.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('storyCanon', {
  isDesktop: true,
  chooseFolder: () => ipcRenderer.invoke('choose-folder'),
});
