import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { addSong } from '../actions/song';
import SongEntry from '../components/SongEntry';
import EditSongModal from '../components/EditSongModal';
import type { ApplicationState, Song } from '../types/app';

interface HomeProps {
  addSong: (url: string) => void;
  songs: Song[];
}

function Home(props: HomeProps) {
  const { songs = [] } = props;
  return (
    // uk-light uk-background-secondary
    <>
      <div className="uk-container uk-height-1-1" uk-height-viewport="true">
        <div className="uk-section">
          <input
            className="uk-input"
            placeholder="Paste YouTube URL here"
            onChange={e => props.addSong(e.target.value)}
          />

          <div className="uk-text-right uk-margin-top">
            <progress className="uk-progress" value="70" max="100" />
            <button
              type="button"
              className="uk-button uk-button-primary uk-flex-inline uk-flex-middle"
            >
              Download Queue
              <span uk-icon="download" className="uk-margin-small-left" />
            </button>
          </div>
        </div>
        <EditSongModal />

        <table className="uk-table uk-table-small uk-table-divider uk-table-middle">
          <thead>
            <tr>
              <td />
              <td>Title</td>
              <td>Artist</td>
              <td>Album</td>
              <td>Album Artist</td>
            </tr>
          </thead>
          <tbody>
            {songs.map((song: Song) => (
              <SongEntry key={song.id} song={song} />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="uk-margin-top uk-background-secondary uk-text-center">
        yt2mp3 v0.1.0
      </footer>
    </>
  );
}

function mapStateToProps(state: ApplicationState) {
  return {
    songs: Object.values(state.song.songs || {}).reverse()
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      addSong
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
