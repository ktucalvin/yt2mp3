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
if (process.platform === 'win32' && !ffmpegPath.endsWith('.exe')) ffmpegPath += '.exe'

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
  // if the first child is a text node replace it, else create it
  if ($('#song-progress').firstChild.nodeType === 3) {
    $('#song-progress').firstChild.textContent = msg
  } else {
    $('#song-progress').insertAdjacentText('afterbegin', msg)
  }
  const visibility = msg ? 'visible' : 'hidden'
  $('#song-progress .stripes').style.visibility = visibility
  $('#total-progress .stripes').style.visibility = visibility
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
        <button>X</button>
        <img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg">
        <form>
          <input type="text" data-tag="title" placeholder="Song Title">
          <input type="text" data-tag="artist" placeholder="Artist">
          <input type="text" data-tag="album" placeholder="Album">
          <input type="text" data-tag="performerInfo" placeholder="Album Artist">
          <div class="selection">
            <select>
              <option>Add another field</option>
              <option value="composer">Composer</option>
              <option value="genre">Genre</option>
              <option value="subtitle">Subtitle</option>
              <option value="conductor">Conductor</option>
              <option value="remixArtist">Remix Artist</option>
              <option value="publisher">Publisher</option>
              <option value="trackNumber">Track Number</option>
            </select>
          </div>
        </form>
      `
      try {
        const info = await fetchVideoInfo(id)
        $li.setAttribute('data-url', `https://www.youtube.com/watch?v=${id}`)
        $li.setAttribute('data-title', info.title)
        $('#queue').appendChild($li)
      } catch (err) {
        alertError(err)
      }
    }
  }
  $urlList.value = badUrls.filter(e => !/\s/.test(e)).join('\n')
}

async function processQueue () {
  const songs = [...$('#queue').children]
  if (!songs.length) return
  let outputDir = $('#outputDir').files[0]
  outputDir = outputDir ? outputDir.path : defaultOut
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  $('#total-progress .progress-value').style.width = '0'
  $('#song-progress .progress-value').style.width = '0'
  $('#total-progress .percent-text').style.borderColor = '#e22'
  disableForm(true)

  for (let i = 0; i < songs.length; i++) {
    const $li = songs[i]
    const tags = {}
    for (const field of $li.getElementsByTagName('input')) {
      if (field.value) tags[field.getAttribute('data-tag')] = field.value
    }
    const video = {
      title: tags.title || $li.getAttribute('data-title'),
      url: $li.getAttribute('data-url')
    }

    try {
      const outfile = await extractAudio(video, outputDir, progress => {
        const songWidth = (progress * 100).toFixed(1) + '%'
        const totalWidth = (100 * (i + progress) / songs.length).toFixed(1) + '%'
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
  $('#queue').addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return
    e.target.parentNode.remove()
  })
  $('#queue').addEventListener('change', e => {
    if (e.target.tagName !== 'SELECT') return
    const option = e.target.selectedOptions[0]
    const $input = document.createElement('input')
    $input.setAttribute('type', 'text')
    $input.setAttribute('data-tag', option.value)
    $input.setAttribute('placeholder', option.innerText)
    e.target.parentNode.parentNode.insertBefore($input, e.target.parentNode)
    e.target.selectedOptions[0].remove()
    $input.focus()
  })
})

const _si = setImmediate
process.once('loaded', () => (global.setImmediate = _si))
