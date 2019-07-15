'use strict'
/* eslint-env browser */
const { getURLVideoID } = require('ytdl-core')
const ytdl = require('youtube-dl')
const id3 = require('node-id3')
const destRegex = /\[ffmpeg\] Destination: (.+.mp3)/
const queue = []
let $queue

function download (url, folder, args = [], options = {}) {
  args = ['-x', '--audio-format', 'mp3', '-o', `${folder}/%(title)s.%(ext)s`].concat(args)
  return new Promise((resolve, reject) => {
    ytdl.exec(url, args, options, (err, output) => {
      if (err) reject(err)
      output = output.filter(e => destRegex.test(e))
      resolve(destRegex.exec(output[0])[1])
    })
  })
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
      $queue.appendChild($li)
    }
  }
  $urlList.value = badUrls.filter(e => !/\s/.test(e)).join('\n')
}

// eslint-disable-next-line no-unused-vars
function processQueue (event, index = 0, outputDir) {
  event.preventDefault()
  if (!outputDir) {
    outputDir = document.getElementById('outputDir').files[0]
    outputDir = outputDir ? outputDir.path : './output'
  }
  const $li = queue[index]
  let tags = {}
  for (const field of $li.children[1].children) {
    if (field.value) tags[field.className] = field.value
  }

  console.log(`downloading ${$li.getAttribute('data-url')}`)

  download($li.getAttribute('data-url'), outputDir)
    .then(filename => {
      console.log(`Download finished. Outfile: ${filename}`)
      if (!id3.write(tags, filename)) {
        console.error(`FAILED TO WRITE TAGS FOR ${filename}`)
      } else {
        console.log(`Finished tagging ${filename}`)
        $li.remove()
      }
    })
    .then(() => {
      if (index + 1 < queue.length) {
        processQueue(event, index + 1, outputDir)
      }
    })
    .catch(err => console.error(err))
}

window.addEventListener('DOMContentLoaded', () => {
  $queue = document.getElementById('queue')
  document.getElementById('add').addEventListener('click', addToQueue)
  document.getElementById('process').addEventListener('click', processQueue)
})
