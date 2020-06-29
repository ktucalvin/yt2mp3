import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Icons from 'uikit/dist/js/uikit-icons';
import UIkit from './types/uikit';
import Root from './pages/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';

// Load UIkit icons
UIkit.use(Icons);

const additionalArgs = process.argv.slice(-2);
const store = configureStore({
  system: {
    downloadFolder: additionalArgs[0],
    platform: additionalArgs[1]
  },
  song: {
    songs: {}
  },
  download: {
    downloadState: 'FINISHED',
    songProgress: 0,
    totalProgress: 0
  }
});

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  )
);
