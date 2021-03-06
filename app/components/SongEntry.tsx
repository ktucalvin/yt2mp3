import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import UIkit from '../types/uikit';
import { removeSong, beginEditSong } from '../actions/song';
import { Song } from '../types/app';
import SongField from './SongField';

interface SongProps {
  song: Song;
  removeSong: typeof removeSong;
  beginEditSong: typeof beginEditSong;
}

function SongEntry(props: SongProps) {
  const { song } = props;
  return (
    <tr className="song-entry">
      <td className="uk-table-shrink">
        <img
          src={`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`}
          className="uk-preserve-width"
          alt=""
          width="75"
        />
      </td>

      <SongField song={song} field="title" />
      <SongField song={song} field="artist" />
      <SongField song={song} field="album" />
      <SongField song={song} field="albumArtist" />

      <td style={{ minWidth: '1.5em' }}>
        <button type="button" className="edit-song-button">
          <span uk-icon="more-vertical" />
        </button>
        <div
          id={`dropdown-${song.id}`}
          className="song-dropdown uk-width-auto"
          uk-dropdown="mode: click; pos: bottom-right"
        >
          <ul className="uk-nav uk-navbar-dropdown-nav">
            <li>
              <button
                type="button"
                onClick={() => {
                  UIkit.dropdown(`#dropdown-${song.id}`).hide(false);
                  UIkit.modal('#edit-song-modal').show();
                  props.beginEditSong(song.id);
                }}
              >
                Edit Info
              </button>
            </li>
            <li>
              <button type="button" onClick={() => props.removeSong(song.id)}>
                Remove
              </button>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  );
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      removeSong,
      beginEditSong
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(SongEntry);
