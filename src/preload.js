'use strict'
/* eslint-env browser */
const { getURLVideoID } = require('ytdl-core')
const ytdl = require('youtube-dl')
const id3 = require('node-id3')
const destRegex = /\[ffmpeg\] Destination: (.+.mp3)/
let queue = []

const $ = e => document.querySelector(e)

function download (url, folder, args = [], options = {}) {
  args = ['-x', '--audio-format', 'mp3', '-o', `${folder}/%(title)s.%(ext)s`].concat(args)
  return new Promise((resolve, reject) => {
    ytdl.exec(url, args, options, (err, output) => {
      if (err) reject(err)
      output = output.map(e => destRegex.exec(e)).filter(e => e)
      resolve(output[0][1])
    })
  })
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
  let badUrls = []

  for (let i = 0; i < urls.length; i++) {
    const id = getURLVideoID(urls[i])
    if (!id || id instanceof Error) {
      badUrls.push(urls[i])
    } else {
      const $li = document.createElement('li')
      $li.innerHTML =
      `
        <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg">
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
function processQueue (event, index = 0, outputDir) {
  event.preventDefault()
  if (!queue.length) return
  if (!outputDir) {
    outputDir = document.getElementById('outputDir').files[0]
    outputDir = outputDir ? outputDir.path : './output'
  }
  const $li = queue[index]
  let tags = {}
  for (const field of $li.children[1].children) {
    if (field.value) tags[field.className] = field.value
  }

  if (index === 0) {
    $('#dl-progress .progress-value').style.width = '0'
    disableForm(true)
  }

  setProgressText(`Downloading ${$li.getAttribute('data-url')} (${index + 1} of ${queue.length})`)

  download($li.getAttribute('data-url'), outputDir)
    .then(filename => {
      setProgressText(`Download finished. Outfile: ${filename}`)
      if (!id3.write(tags, filename)) {
        console.error(`Failed to write tags for ${filename}`)
      } else {
        setProgressText(`Finished tagging ${filename}`)
        $li.remove()
      }
      const width = Math.ceil(((index + 1) * 100) / queue.length) + '%'
      $('#dl-progress .progress-value').style.width = width
    })
    .then(() => {
      if (index + 1 < queue.length) {
        processQueue(event, index + 1, outputDir)
      } else {
        queue = []
        setProgressText('')
        disableForm(false)
      }
    })
    .catch(err => console.error(err))
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add').addEventListener('click', addToQueue)
  document.getElementById('process').addEventListener('click', processQueue)
})
