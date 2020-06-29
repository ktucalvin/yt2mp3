import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import SongEntry from '../components/SongEntry';
import EditSongModal from '../components/EditSongModal';
import SongControls from '../components/SongControls';
import type { ApplicationState, Song, DownloadState } from '../types/app';
import NotificationHandler from '../components/NotificationHandler';
import DownloadMonitor from '../components/DownloadMonitor';
import packageJson from '../../package.json';

const { nativeTheme } = remote.require('electron');

interface HomeProps {
  songs: Song[];
  downloadProgress: number;
  downloadState: DownloadState;
}

class Home extends PureComponent<HomeProps> {
  componentDidMount() {
    nativeTheme.on('updated', () => {
      this.forceUpdate();
    });
  }

  render() {
    const { songs } = this.props;
    let containerClass = 'uk-container uk-height-1-1 ';
    if (nativeTheme.shouldUseDarkColors) {
      containerClass += 'uk-light uk-background-secondary';
    }

    return (
      <>
        <div className={containerClass} uk-height-viewport="true">
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
        <footer className="uk-margin-top uk-text-right">
          yt2mp3 v{packageJson.version}
        </footer>
      </>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  return {
    songs: Object.values(state.song.songs || {}).reverse()
  };
}

export default connect(mapStateToProps)(Home);
