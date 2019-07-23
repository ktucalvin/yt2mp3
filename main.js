'use strict'
// Skeleton code taken from the electron-quick-start repo
// The repo can be found at https://github.com/electron/electron-quick-start
const { app, BrowserWindow } = require('electron')
const path = require('path')
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    minWidth: 640,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      enableRemoteModule: false,
      additionalArguments: [app.getAppPath(), app.getPath('downloads')]
    }
  })
  mainWindow.loadFile('src/index.html')
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  mainWindow.removeMenu()
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', e => e.preventDefault())
  contents.on('new-window', e => e.preventDefault())
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
