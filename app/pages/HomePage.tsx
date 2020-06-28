import React from 'react';
import { connect } from 'react-redux';
import SongEntry from '../components/SongEntry';
import EditSongModal from '../components/EditSongModal';
import SongControls from '../components/SongControls';
import type { ApplicationState, Song, DownloadState } from '../types/app';
import NotificationHandler from '../components/NotificationHandler';
import DownloadMonitor from '../components/DownloadMonitor';

interface HomeProps {
  songs: Song[];
  downloadProgress: number;
  downloadState: DownloadState;
}

function Home(props: HomeProps) {
  const { songs } = props;
  return (
    // uk-light uk-background-secondary
    <>
      <div className="uk-container uk-height-1-1" uk-height-viewport="true">
        <NotificationHandler />
        <EditSongModal />
        <SongControls />
        <DownloadMonitor />

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
      <footer className="uk-margin-top uk-text-right">yt2mp3 v2.1.0</footer>
    </>
  );
}

function mapStateToProps(state: ApplicationState) {
  return {
    songs: Object.values(state.song.songs || {}).reverse()
  };
}

export default connect(mapStateToProps)(Home);
