import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import song from './song';
import system from './system';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    song,
    system
  });
}
