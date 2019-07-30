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

let ffmpegPath = appRoot.includes('.asar')
  ? path.join(appRoot, '..', 'ffmpeg')
  : require('ffmpeg-static').path
if (process.platform === 'win32') ffmpegPath += '.exe'
let queue = []

const $ = e => document.querySelector(e)

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
        updateStyle(converted / total)
      }
    })
    ffmpeg.on('close', () => resolve(outfile))
    ffmpeg.on('error', reject)
  })
}

function fetchVideoInfo (id) {
  return new Promise((resolve, reject) => {
    fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${id}&format=json`)
      .then(res => res.json())
      .then(resolve)
      .catch(reject)
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

function setProgressText (msg) {
  $('#song-progress').childNodes[0].textContent = msg
  const visibility = msg ? 'visible' : 'hidden'
  $('#song-progress span').style.visibility = visibility
  $('#total-progress span').style.visibility = visibility
}

function disableForm (isDisabled) {
  $('#add').disabled = isDisabled
  $('#process').disabled = isDisabled
  $('#outputDir').disabled = isDisabled
  $('#url-list').disabled = isDisabled
}

async function addToQueue () {
  const $urlList = $('#url-list')
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
      try {
        const info = await fetchVideoInfo(id)
        const video = {
          element: $li,
          url: `https://www.youtube.com/watch?v=${id}`,
          title: info.title,
          uploader: info.author_name
        }
        queue.push(video)
        $('#queue').appendChild($li)
      } catch (err) {
        alertError(err)
      }
    }
  }
  $urlList.value = badUrls.filter(e => !/\s/.test(e)).join('\n')
}

async function processQueue () {
  if (!queue.length) return
  let outputDir = $('#outputDir').files[0]
  outputDir = outputDir ? outputDir.path : defaultOut
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  $('#total-progress .progress-value').style.width = '0'
  $('#song-progress .progress-value').style.width = '0'
  $('#total-progress .percent-text').style.borderColor = '#e22'
  disableForm(true)

  for (let i = 0; i < queue.length; i++) {
    const video = queue[i]
    const $li = video.element
    const tags = {}
    for (const field of $li.children[1].children) {
      if (field.value) tags[field.className] = field.value
    }

    try {
      const outfile = await extractAudio(video, outputDir, progress => {
        const songWidth = (progress * 100).toFixed(1) + '%'
        const totalWidth = (100 * (i + progress) / queue.length).toFixed(1) + '%'
        setProgressText(`Now processing: ${video.title} (${songWidth})`)
        $('#song-progress .progress-value').style.width = songWidth
        $('#total-progress .progress-value').style.width = totalWidth
        $('#total-progress .percent-text').innerText = totalWidth
      })

      tagSong(outfile, tags)

      $li.remove()
    } catch (err) {
      alertError(err)
    }
  }

  queue = []
  setProgressText('')
  disableForm(false)
  $('#total-progress .progress-value').style.width = '100%'
  $('#song-progress .progress-value').style.width = '100%'
  $('#total-progress .percent-text').innerText = ''
  $('#total-progress .percent-text').style.borderColor = 'transparent'
}

window.addEventListener('DOMContentLoaded', () => {
  $('#add').addEventListener('click', addToQueue)
  $('#process').addEventListener('click', processQueue)
})

const _si = setImmediate
process.once('loaded', () => (global.setImmediate = _si))
