import React, { ChangeEvent, KeyboardEvent, PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { beginEditSong, finishEditSong } from '../actions/song';
import type { Song, ApplicationState, DownloadState } from '../types/app';

interface SongFieldProps {
  beginEditSong: typeof beginEditSong;
  finishEditSong: typeof finishEditSong;
  downloadState: DownloadState;
  field: string;
  song: Song;
}

class SongField extends PureComponent<SongFieldProps> {
  private shouldDiscard = false;

  private inputRef: HTMLDivElement | null = null;

  handleFocus = () => {
    this.shouldDiscard = false;
    if (this.inputRef) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(this.inputRef);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      this.shouldDiscard = true;
      e.currentTarget.blur();
    } else if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  handleBlur = (e: ChangeEvent<HTMLDivElement>) => {
    const { song, field } = this.props;
    if (this.shouldDiscard && this.inputRef) {
      this.inputRef.innerText = song[field];
      return;
    }

    const newSong = {
      ...song,
      [field]: e.target.innerText.replace(/\r?\n|\r/g, ' ').trim()
    };

    this.props.beginEditSong(song.id);
    this.props.finishEditSong(newSong);
  };

  render() {
    const { song, field, downloadState } = this.props;
    const key = song[field];
    if (downloadState === 'IN_PROGRESS') {
      return <td key={`${song.id}-${field}`}>{key}</td>;
    }

    return (
      <td key={key}>
        <div
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label={`Edit ${field} for ${song.title || song.id}`}
          tabIndex={0}
          className="song-field-editable"
          ref={r => (this.inputRef = r)} // eslint-disable-line no-return-assign
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleBlur}
        >
          {key}
        </div>
      </td>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  return {
    downloadState: state.download.downloadState
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      beginEditSong,
      finishEditSong
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SongField);
