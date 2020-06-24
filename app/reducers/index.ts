import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import song from './song';
import system from './system';
import download from './download';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    system,
    song,
    download
  });
}
