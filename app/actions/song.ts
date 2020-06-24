import { validateURL, getURLVideoID } from 'ytdl-core';
import type { Song, Dispatch, YoutubeApiResponse } from '../types/app';

// eslint-disable-next-line import/no-cycle
import {
  START_FETCH_METADATA,
  END_FETCH_METADATA,
  notifyFailedDownload
} from './download';

export const ADD_SONG = 'ADD_SONG';
export const REMOVE_SONG = 'REMOVE_SONG';
export const BEGIN_EDIT_SONG = 'BEGIN_EDIT_SONG';
export const FINISH_EDIT_SONG = 'FINISH_EDIT_SONG';

export interface AddSongAction {
  type: typeof ADD_SONG | typeof FINISH_EDIT_SONG;
  song: Song;
}

export interface RemoveSongAction {
  type: typeof REMOVE_SONG | typeof BEGIN_EDIT_SONG;
  id: string;
}

// An EditSongAction is just a remove followed by an add, but reduced differently

export function addSong(url: string) {
  return async (dispatch: Dispatch) => {
    if (!validateURL(url)) {
      return;
    }

    try {
      const id = getURLVideoID(url);

      dispatch({
        type: START_FETCH_METADATA
      });

      const response = await fetch(`
        https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${id}&format=json
      `);
      const result: YoutubeApiResponse = await response.json();

      dispatch({
        type: ADD_SONG,
        song: {
          id,
          title: result.title,
          artist: result.author_name
        }
      });

      dispatch({
        type: END_FETCH_METADATA
      });
    } catch (err) {
      dispatch(notifyFailedDownload(err));
    }
  };
}

export function removeSong(id: string): RemoveSongAction {
  return {
    type: REMOVE_SONG,
    id
  };
}

export function beginEditSong(id: string): RemoveSongAction {
  return {
    type: BEGIN_EDIT_SONG,
    id
  };
}

export function finishEditSong(editedSong: Song): AddSongAction {
  return {
    type: FINISH_EDIT_SONG,
    song: editedSong
  };
}
