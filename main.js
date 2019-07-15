'use strict'
// Skeleton code taken from the electron-quick-start repo
// The repo can be found at https://github.com/electron/electron-quick-start
const { app, BrowserWindow } = require('electron')
const path = require('path')
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.resolve('src/preload.js')
    }
  })
  mainWindow.loadFile('src/index.html')
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
