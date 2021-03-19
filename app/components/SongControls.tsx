import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { validateURL } from 'ytdl-core';
import { addSong } from '../actions/song';
import { downloadQueue } from '../actions/download';
import type { ApplicationState, DownloadState } from '../types/app';

interface SongControlsProps {
  addSong: (song: string) => void;
  downloadQueue: () => void;
  queueLength: number;
  downloadState: DownloadState;
  dispatch: Dispatch;
}

interface SongControlsState {
  hasInvalidSong: boolean;
  songUrl: string;
}

class SongControls extends PureComponent<SongControlsProps, SongControlsState> {
  private inputTimeout = 0;

  constructor(props) {
    super(props);
    this.state = {
      hasInvalidSong: false,
      songUrl: ''
    };
  }

  componentDidUpdate(prevProps: SongControlsProps) {
    if (
      prevProps.downloadState === 'FETCHING_METADATA' &&
      this.props.downloadState === 'FINISHED'
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ songUrl: '' });
    }
  }

  getInputHelperText = (downloadState: DownloadState) => {
    if (this.state.hasInvalidSong || downloadState === 'FAILED') {
      return 'URL is invalid';
    }

    if (downloadState === 'FETCHING_METADATA') {
      return (
        <>
          Fetching metadata...
          <div uk-spinner="ratio: 0.4" style={{ marginLeft: '1em' }} />
        </>
      );
    }

    return '';
  };

  handleInputChange = (song: string) => {
    clearTimeout(this.inputTimeout);
    if (validateURL(song)) {
      this.props.addSong(song);
      this.setState({ hasInvalidSong: false, songUrl: song });
    } else if (song !== '') {
      this.setState({ songUrl: song });
      this.inputTimeout = window.setTimeout(
        () => this.setState({ hasInvalidSong: true }),
        750
      );
    } else {
      this.setState({ hasInvalidSong: false, songUrl: song });
    }
  };

  render() {
    const { downloadState, queueLength } = this.props;
    const isDownloading = downloadState === 'IN_PROGRESS';
    const dangerStyling =
      this.state.hasInvalidSong || downloadState === 'FAILED'
        ? 'uk-form-danger'
        : '';

    return (
      <div id="song-controls" className="uk-section">
        <input
          className={`uk-input ${dangerStyling}`}
          placeholder="Paste YouTube URL here"
          value={this.state.songUrl}
          onChange={e => this.handleInputChange(e.target.value)}
          disabled={isDownloading}
        />
        <span className={`input-helper-text uk-text-small ${dangerStyling}`}>
          {this.getInputHelperText(downloadState)}
        </span>

        {queueLength >= 1 && !isDownloading && (
          <div className="uk-text-right uk-margin-top">
            <button
              type="button"
              className="uk-button uk-button-primary uk-flex-inline uk-flex-middle"
              onClick={this.props.downloadQueue}
            >
              Download Queue ({this.props.queueLength})
              <span uk-icon="download" className="uk-margin-small-left" />
            </button>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  return {
    queueLength: Object.keys(state.song.songs).length,
    downloadState: state.download.downloadState
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      addSong,
      downloadQueue,
      dispatch
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SongControls);
