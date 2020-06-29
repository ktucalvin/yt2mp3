import { Action } from 'redux';
import { DownloadReducerState } from '../types/app';
import * as DlActions from '../actions/download';

const defaultDownloadState: DownloadReducerState = {
  downloadState: 'FINISHED',
  songProgress: 0,
  totalProgress: 0
};

export default function manageDownload(
  state = defaultDownloadState,
  action: Action<string>
) {
  const newState = {
    ...state
  };

  if (action.type === DlActions.START_FETCH_METADATA) {
    newState.downloadState = 'FETCHING_METADATA';
  }

  if (action.type === DlActions.END_FETCH_METADATA) {
    newState.downloadState = 'FINISHED';
  }

  if (action.type === DlActions.START_DOWNLOAD) {
    newState.songProgress = 0;
    newState.totalProgress = 0;
    newState.downloadState = 'IN_PROGRESS';
  }

  if (action.type === DlActions.REPORT_DOWNLOAD_PROGRESS) {
    const report = action as DlActions.DownloadProgressAction;
    newState.songProgress = report.songProgress;
    newState.downloadId = report.downloadId;
    newState.totalProgress = report.totalProgress;
  }

  if (action.type === DlActions.FINISH_DOWNLOAD) {
    newState.songProgress = 100;
    newState.totalProgress = 100;
    newState.downloadState = 'FINISHED';
  }

  if (action.type === DlActions.NOTIFY_FAILED_DOWNLOAD) {
    const report = action as DlActions.DownloadFailedAction;
    newState.downloadState = 'FAILED';
    newState.message = report.error.message;
    console.error(report.error);
  }

  return newState;
}
