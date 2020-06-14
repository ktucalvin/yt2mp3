import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';

export default function Home() {
  return (
    <div className="uk-container">
      <h2 className="uk-heading-large">Home</h2>
      <input className="uk-input" placeholder="YouTube URL" />

      <span uk-icon="more-vertical" />
      <span uk-icon="icon: check" />
      <table className="uk-table uk-table-small">
        <thead>
          <tr>
            <td>Name</td>
            <td />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Test name</td>
            <td>
              <span uk-icon="more-vertical" />
            </td>
          </tr>
        </tbody>
      </table>
      <Link to={routes.COUNTER}>to Counter</Link>
    </div>
  );
}
