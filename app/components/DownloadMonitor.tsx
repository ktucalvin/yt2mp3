import React from 'react';
import { connect } from 'react-redux';
import type { ApplicationState, DownloadState, Song } from '../types/app';
import ProgressBar from './ProgressBar';

interface DownloadMonitorProps {
  downloadState: DownloadState;
  songProgress: number;
  totalProgress: number;
  song?: Song;
}

function DownloadMonitor(props: DownloadMonitorProps) {
  const { downloadState, songProgress, totalProgress, song } = props;
  if (downloadState !== 'IN_PROGRESS') {
    return null;
  }

  if (!song && totalProgress >= 100) {
    return (
      <div id="download-monitor">
        <div id="download-info" className="uk-section uk-background-muted">
          <div>Finished!</div>
        </div>
        <ProgressBar stripes percent={songProgress} />
        <ProgressBar stripes percent={totalProgress} />
      </div>
    );
  }

  return (
    <div id="download-monitor">
      <div id="download-info" className="uk-section uk-background-muted">
        <div>
          {song?.title ? (
            <>
              <b>Current Song</b>: {song?.title}
            </>
          ) : (
            'Preparing next song...'
          )}
        </div>
        <div>
          <b>Song Progress</b>: {songProgress.toFixed(1)}%
        </div>
        <div>
          <b>Total Progress</b>: {totalProgress.toFixed(1)}%
        </div>
      </div>
      <ProgressBar stripes percent={songProgress} />
      <ProgressBar stripes percent={totalProgress} />
    </div>
  );
}

function mapStateToProps(state: ApplicationState) {
  const { downloadState, songProgress, totalProgress } = state.download;
  return {
    downloadState,
    songProgress,
    totalProgress,
    song: state.song.songs[state.download.downloadId || '__nonexistant']
  };
}

export default connect(mapStateToProps)(DownloadMonitor);
