import { Dispatch as ReduxDispatch, Store as ReduxStore, Action } from 'redux';

export const NO_OP = 'NO_OP';

export const enum DownloadState {
  FETCHING_METADATA,
  INVALID,
  IN_PROGRESS,
  FINISHED,
  FAILED
}

export interface YoutubeApiResponse {
  author_url: string;
  version: string;
  provider_name: string;
  type: string;
  provider_url: string;
  thumbnail_url: string;
  author_name: string;
  title: string;
  width: number;
  height: number;
  html: string;
  thumbnail_height: number;
  thumbnail_width: number;
}

export interface Song {
  id: string;
  title?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  composer?: string;
  year?: number;
  genre?: string;
  trackNumber?: number;
}

export interface SongReducerState {
  editId?: string;
  songs: {
    [key: string]: Song;
  };
}

export interface ApplicationState {
  system: {
    downloadFolder: string;
    platform: string;
  };

  song: SongReducerState;
}

export type GetState = () => ApplicationState;

export type Dispatch = ReduxDispatch<Action<string>>;

export type Store = ReduxStore<ApplicationState, Action<string>>;
