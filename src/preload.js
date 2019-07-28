'use strict'
/* eslint-env browser */
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const ytdl = require('ytdl-core')
const sanitize = require('sanitize-filename')
const id3 = require('node-id3')

// passed from main process
const additionalArgs = process.argv.slice(-2)
const appRoot = additionalArgs[0]
const defaultOut = path.join(additionalArgs[1], 'yt2mp3')

const ffmpegPath = appRoot.includes('.asar')
  ? path.join(appRoot, '..', 'ffmpeg')
  : require('ffmpeg-static').path
let queue = []

const $ = e => document.querySelector(e)

function fetchVideoInfo (id) {
  return new Promise(resolve => {
    fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${id}&format=json`)
      .then(res => res.json())
      .then(resolve)
      .catch(alertError)
  })
}

function toMilliseconds (timestamp) {
  const arr = timestamp.split(':').map(e => parseFloat(e))
  return (arr[0] * 1000 * 60 * 60) + (arr[1] * 60 * 1000) + (arr[2] * 1000)
}

function extractAudio (video, folder, updateStyle) {
  return new Promise((resolve, reject) => {
    const outfile = path.join(folder, `${sanitize(video.title)}.mp3`)
    const args = ['-i', 'pipe:', '-y', '-progress', 'pipe:1', '-vn', '-ar', '44100', '-ac', '2', '-ab', '192k', '-f', 'mp3', outfile]
    const ffmpeg = execFile(ffmpegPath, args)
    let total
    ytdl(video.url).pipe(ffmpeg.stdin)
    ffmpeg.stderr.on('data', chunk => {
      const totalRegex = /Duration: (\d{2}:\d{2}:\d{2}\.\d{2})/.exec(chunk)
      const currentRegex = /time=(\d{2}:\d{2}:\d{2}\.\d{2})/.exec(chunk)
      if (totalRegex) {
        total = toMilliseconds(totalRegex[1])
      }
      if (currentRegex) {
        const converted = toMilliseconds(currentRegex[1])
        requestAnimationFrame(() => updateStyle(converted / total))
      }
    })
    ffmpeg.on('close', () => resolve(outfile))
    ffmpeg.on('error', reject)
  })
}

function tagSong (file, tags) {
  if (!id3.write(tags, file)) {
    throw new Error(`Failed to write tags for ${file}`)
  }
}

function alertError (err) {
  console.error(err)
  alert(`An error has occurred. Perhaps open an issue on GitHub?\n\n${err}`)
}

function setTotalProgressText (msg) {
  document.getElementById('total-progress').childNodes[0].textContent = msg
  if (msg) console.log(msg)
  const visibility = msg ? 'visible' : 'hidden'
  $('#song-progress span').style.visibility = visibility
  $('#total-progress span').style.visibility = visibility
}

function disableForm (isDisabled) {
  document.getElementById('add').disabled = isDisabled
  document.getElementById('process').disabled = isDisabled
  document.getElementById('outputDir').disabled = isDisabled
  document.getElementById('url-list').disabled = isDisabled
}

async function addToQueue () {
  const $urlList = document.getElementById('url-list')
  const urls = $urlList.value.split('\n')
  const badUrls = []

  for (let i = 0; i < urls.length; i++) {
    const id = ytdl.getURLVideoID(urls[i])
    if (!id || id instanceof Error) {
      badUrls.push(urls[i])
    } else {
      const $li = document.createElement('li')
      $li.innerHTML =
      `
        <img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg">
        <form>
          <input type="text" class="title" placeholder="Song Title">
          <input type="text" class="artist" placeholder="Artist">
          <input type="text" class="album" placeholder="Album">
        </form>
      `
      const info = await fetchVideoInfo(id)
      const video = {
        element: $li,
        url: `https://www.youtube.com/watch?v=${id}`,
        title: info.title,
        uploader: info.author_name
      }
      queue.push(video)
      document.getElementById('queue').appendChild($li)
    }
  }
  $urlList.value = badUrls.filter(e => !/\s/.test(e)).join('\n')
}

async function processQueue () {
  if (!queue.length) return
  let outputDir = document.getElementById('outputDir').files[0]
  outputDir = outputDir ? outputDir.path : defaultOut
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  $('#total-progress .progress-value').style.width = '0'
  disableForm(true)

  for (let i = 0; i < queue.length; i++) {
    const video = queue[i]
    const $li = video.element
    const tags = {}
    for (const field of $li.children[1].children) {
      if (field.value) tags[field.className] = field.value
    }
    setTotalProgressText(`Processing ${video.title} (${i + 1} of ${queue.length})`)
    $('#song-progress .progress-value').style.width = '0'

    try {
      const outfile = await extractAudio(video, outputDir, progress => {
        const percentage = `${(progress * 100).toFixed(2)}%`
        document.getElementById('song-progress').childNodes[0].textContent = `Extracting audio... (${percentage})`
        $('#song-progress .progress-value').style.width = percentage
      })
      console.log(`Audio extracted. Adding tags.`)

      await tagSong(outfile, tags)
      $('#song-progress .progress-value').style.width = '100%'
      console.log(`Finished tagging ${outfile}`)

      $li.remove()
      const width = Math.ceil(((i + 1) * 100) / queue.length) + '%'
      $('#total-progress .progress-value').style.width = width
    } catch (err) {
      alertError(err)
    }
  }

  queue = []
  requestAnimationFrame(() => {
    setTotalProgressText('')
    document.getElementById('song-progress').childNodes[0].textContent = ''
    disableForm(false)
  })
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add').addEventListener('click', addToQueue)
  document.getElementById('process').addEventListener('click', processQueue)
})

let _si = setImmediate
process.once('loaded', () => (global.setImmediate = _si))
