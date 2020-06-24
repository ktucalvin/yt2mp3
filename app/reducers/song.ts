import { Action } from 'redux';
import type { SongReducerState } from '../types/app';
import {
  ADD_SONG,
  REMOVE_SONG,
  BEGIN_EDIT_SONG,
  FINISH_EDIT_SONG,
  AddSongAction,
  RemoveSongAction
} from '../actions/song';

const defaultSongState: SongReducerState = {
  songs: {}
};

export default function manageSong(
  state = defaultSongState,
  action: Action<string>
) {
  const newState: SongReducerState = {
    ...state
  };

  if (action.type === ADD_SONG) {
    const { song } = action as AddSongAction;
    if (!(song.id in newState.songs)) {
      newState.songs[song.id] = song;
    }
  }

  if (action.type === REMOVE_SONG) {
    delete newState.songs[(action as RemoveSongAction).id];
  }

  if (action.type === BEGIN_EDIT_SONG) {
    newState.editId = (action as RemoveSongAction).id;
  }

  if (action.type === FINISH_EDIT_SONG) {
    const { song } = action as AddSongAction;
    newState.songs[song.id] = song;
  }

  return newState;
}
