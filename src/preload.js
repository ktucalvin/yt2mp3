'use strict'
/* eslint-env browser */
const fs = require('fs')
const path = require('path')
const { getURLVideoID } = require('ytdl-core')
const ytdl = require('youtube-dl')
const id3 = require('node-id3')
const destRegex = /\[ffmpeg\] Destination: (.+.mp3)/

// passed from main process
const additionalArgs = process.argv.slice(-2)
const appRoot = additionalArgs[0]
const defaultOut = path.join(additionalArgs[1], 'yt2mp3')

const ffmpegPath = appRoot.includes('.asar')
  ? path.join(appRoot, '..', 'ffmpeg')
  : require('ffmpeg-static').path
let queue = []

const $ = e => document.querySelector(e)

function downloadVideo (url, folder, args = [], options = {}) {
  args = ['-x', '--audio-format', 'mp3', '--ffmpeg-location', `${ffmpegPath}`, '-o', `${folder}/%(title)s.%(ext)s`].concat(args)
  return new Promise((resolve, reject) => {
    ytdl.exec(url, args, options, (err, output) => {
      if (err) reject(err)
      if (!output) reject(new Error('No output file was generated'))
      output = output.map(e => destRegex.exec(e)).filter(e => e)
      resolve(output[0][1])
    })
  })
}

function tagSong (file, tags) {
  if (!id3.write(tags, file)) {
    throw new Error(`Failed to write tags for ${file}`)
  }
}

function setProgressText (msg) {
  document.getElementById('dl-progress').childNodes[0].textContent = msg
  const visibility = msg ? 'visible' : 'hidden'
  $('#dl-progress span').style.visibility = visibility
  if (msg) console.log(msg)
}

function disableForm (isDisabled) {
  document.getElementById('add').disabled = isDisabled
  document.getElementById('process').disabled = isDisabled
  document.getElementById('outputDir').disabled = isDisabled
  document.getElementById('url-list').disabled = isDisabled
}

// eslint-disable-next-line no-unused-vars
function addToQueue (e) {
  e.preventDefault()
  const $urlList = document.getElementById('url-list')
  const urls = $urlList.value.split('\n')
  const badUrls = []

  for (let i = 0; i < urls.length; i++) {
    const id = getURLVideoID(urls[i])
    if (!id || id instanceof Error) {
      badUrls.push(urls[i])
    } else {
      const $li = document.createElement('li')
      $li.innerHTML =
      `
        <img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg">
        <form action="#" onsubmit="return false">
          <input type="text" class="title" placeholder="Song Title">
          <input type="text" class="artist" placeholder="Artist">
          <input type="text" class="album" placeholder="Album">
        </form>
      `
      $li.setAttribute('data-url', `https://www.youtube.com/watch?v=${id}`)
      queue.push($li)
      document.getElementById('queue').appendChild($li)
    }
  }
  $urlList.value = badUrls.filter(e => !/\s/.test(e)).join('\n')
}

// eslint-disable-next-line no-unused-vars
async function processQueue (event, index = 0, outputDir) {
  event.preventDefault()
  if (!queue.length) return
  if (!outputDir) {
    outputDir = document.getElementById('outputDir').files[0]
    outputDir = outputDir ? outputDir.path : defaultOut
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const $li = queue[index]
  const tags = {}
  for (const field of $li.children[1].children) {
    if (field.value) tags[field.className] = field.value
  }

  if (index === 0) {
    $('#dl-progress .progress-value').style.width = '0'
    disableForm(true)
  }

  setProgressText(`Downloading ${$li.getAttribute('data-url')} (${index + 1} of ${queue.length})`)

  try {
    const outfile = await downloadVideo($li.getAttribute('data-url'), outputDir)
    setProgressText(`Download finished. Outfile: ${outfile}`)

    await tagSong(outfile, tags)
    setProgressText(`Finished tagging ${outfile}`)

    $li.remove()
    const width = Math.ceil(((index + 1) * 100) / queue.length) + '%'
    $('#dl-progress .progress-value').style.width = width

    if (index + 1 < queue.length) {
      processQueue(event, index + 1, outputDir)
    } else {
      queue = []
      setProgressText('')
      disableForm(false)
    }
  } catch (err) {
    console.error(err)
    alert(`An error has occurred. Perhaps open an issue on GitHub?\n${err}`)
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add').addEventListener('click', addToQueue)
  document.getElementById('process').addEventListener('click', processQueue)
})
