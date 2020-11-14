import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import ytdl from 'ytdl-core';
import sanitize from 'sanitize-filename';
import id3, { Tags } from 'node-id3';
import ffmpegPath1 from 'ffmpeg-static';
import { Dispatch, GetState, Song } from '../types/app';
import { removeSong } from './song'; // eslint-disable-line import/no-cycle

let ffmpegPath = ffmpegPath1;
if (process.platform === 'win32' && !ffmpegPath.endsWith('.exe'))
  ffmpegPath += '.exe';

// Helper functions
const ffmpegArgs = [
  '-i',
  'pipe:',
  '-y',
  '-progress',
  'pipe:1',
  '-vn',
  '-ar',
  '44100',
  '-ac',
  '2',
  '-ab',
  '192k',
  '-f',
  'mp3'
];

function toMilliseconds(timestamp) {
  const arr = timestamp.split(':').map((e: string) => parseFloat(e));
  return arr[0] * 1000 * 60 * 60 + arr[1] * 60 * 1000 + arr[2] * 1000;
}

function extractAudio(
  song: Song,
  folder: string,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    let filename = '';
    if (song.title && song.artist) {
      filename = `${song.artist} - ${song.title}`;
    } else if (song.title) {
      filename = `${song.title}`;
    } else {
      filename = `${song.id}`;
    }

    filename = `${sanitize(filename).slice(0, 200)}.mp3`;

    const outfile = path.join(folder, filename);
    const args = [...ffmpegArgs, outfile];
    const ffmpeg = execFile(ffmpegPath, args);
    if (!ffmpeg || !ffmpeg.stdin || !ffmpeg.stderr) {
      throw new Error('Could not execute ffmpeg');
    }

    let total: number;
    ytdl(`https://www.youtube.com/watch?v=${song.id}`).pipe(ffmpeg.stdin);
    ffmpeg.stderr.on('data', chunk => {
      const totalRegex = /Duration: (\d{2}:\d{2}:\d{2}\.\d{2})/.exec(chunk);
      const currentRegex = /time=(\d{2}:\d{2}:\d{2}\.\d{2})/.exec(chunk);
      if (totalRegex) {
        total = toMilliseconds(totalRegex[1]);
      }
      if (currentRegex) {
        const converted = toMilliseconds(currentRegex[1]);
        onProgress((converted / total) * 100);
      }
    });
    ffmpeg.on('close', () => resolve(outfile));
    ffmpeg.on('error', reject);
  });
}

function tagSong(file: string, tags: Tags) {
  if (!id3.write(tags, file)) {
    throw new Error(`Failed to write tags for ${file}`);
  }
}

// Begin module exports

export const START_DOWNLOAD = 'START_DOWNLOAD';
export const FINISH_DOWNLOAD = 'FINISH_DOWNLOAD';
export const START_FETCH_METADATA = 'START_FETCH_METADATA';
export const END_FETCH_METADATA = 'END_FETCH_METADATA';
export const NOTIFY_FAILED_DOWNLOAD = 'NOTIFY_FAILED_DOWNLOAD';
export const REPORT_DOWNLOAD_PROGRESS = 'REPORT_DOWNLOAD_PROGRESS';

export interface DownloadProgressAction {
  type: typeof REPORT_DOWNLOAD_PROGRESS;
  downloadId: string;
  songProgress: number;
  totalProgress: number;
}

export interface DownloadFailedAction {
  type: typeof NOTIFY_FAILED_DOWNLOAD;
  error: Error;
}

export function notifyFailedDownload(error: Error) {
  return {
    type: NOTIFY_FAILED_DOWNLOAD,
    error
  };
}

export function downloadQueue() {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch({
      type: START_DOWNLOAD
    });

    const state = getState();
    const outfolder = path.join(state.system.downloadFolder, 'yt2mp3');
    const songs = Object.values(state.song.songs);

    try {
      if (!fs.existsSync(outfolder)) {
        fs.mkdirSync(outfolder, { recursive: true });
      }
    } catch (err) {
      console.error(err);
      err.message = `Failed to create output folder. Original error message logged to console.`;
      dispatch({
        type: NOTIFY_FAILED_DOWNLOAD,
        error: err
      });
    }

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      try {
        // eslint-disable-next-line
      const outfile = await extractAudio(song, outfolder, progress => {
          const report: DownloadProgressAction = {
            type: REPORT_DOWNLOAD_PROGRESS,
            downloadId: song.id,
            songProgress: progress,
            totalProgress: (100 * i + progress) / songs.length
          };
          dispatch(report);
        });

        tagSong(outfile, {
          title: song.title,
          artist: song.artist,
          album: song.album,
          performerInfo: song.albumArtist,
          composer: song.composer,
          year: song.year,
          genre: song.genre,
          trackNumber: song.trackNumber?.toString()
        });

        dispatch(removeSong(song.id));
      } catch (err) {
        dispatch({
          type: NOTIFY_FAILED_DOWNLOAD,
          error: err
        });
      }
    }

    setTimeout(() => dispatch({ type: FINISH_DOWNLOAD }), 2000);
  };
}
