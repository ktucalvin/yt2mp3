import { connect } from 'react-redux';
import UIkit from '../types/uikit';
import type { ApplicationState, DownloadState } from '../types/app';

interface NotificationHandlerProps {
  downloadState: DownloadState;
  message: string;
}

function NotificationHandler(props: NotificationHandlerProps) {
  const { downloadState, message } = props;
  // Not very React-style code, but it works
  if (downloadState === 'FAILED' && !message.startsWith('Unexpected token N')) {
    UIkit.notification({
      message: `
      <div class="uk-text-small uk-flex uk-flex-middle">
        <span uk-icon="icon: warning"></span>
        <span style="margin-left: 1em">An error has occurred, please try again or report this error: </span>
      </div>
      <span class="uk-text-small">${message}</span>
      `,
      status: 'danger'
    });
  }

  return null;
}

function mapStateToProps(state: ApplicationState) {
  return {
    downloadState: state.download.downloadState,
    message: state.download.message || ''
  };
}

export default connect(mapStateToProps)(NotificationHandler);
