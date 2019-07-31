'use strict'
const path = require('path')
const { app, BrowserWindow } = require('electron')
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    minWidth: 640,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js'),
      enableRemoteModule: false,
      additionalArguments: [app.getAppPath(), app.getPath('downloads')]
    }
  })
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  mainWindow.removeMenu()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', e => e.preventDefault())
  contents.on('new-window', e => e.preventDefault())
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
