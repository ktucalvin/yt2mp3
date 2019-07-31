'use strict'
const path = require('path')

module.exports = {
  mode: 'production',
  target: 'electron-main',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'app')
  },
  node: {
    __dirname: false
  }
}
