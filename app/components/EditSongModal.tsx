import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import serializeForm from 'form-serialize';
import UIkit from '../types/uikit';
import { finishEditSong, beginEditSong } from '../actions/song';
import type { ApplicationState, Song } from '../types/app';

interface SongFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  value?: string | number;
  type?: 'number' | 'text';
}

interface EditSongModalProps {
  beginEditSong: typeof beginEditSong;
  finishEditSong: typeof finishEditSong;
  song: Song;
}

function SongFieldInput(props: SongFieldProps) {
  const { label, value, placeholder, name, type = 'text' } = props;
  return (
    <div className="uk-margin">
      <label className="uk-form-label" htmlFor={`edit-song-${label}`}>
        {label}
        <div className="uk-form-controls">
          <input
            id={`edit-song-${label}`}
            className="uk-input"
            name={name}
            type={type}
            placeholder={placeholder}
            defaultValue={value || ''}
          />
        </div>
      </label>
    </div>
  );
}

class EditSongModal extends PureComponent<EditSongModalProps> {
  private form: HTMLFormElement | null = null;

  componentDidMount() {
    UIkit.util.on('#edit-song-modal', 'hide', () => {
      // eslint-disable-next-line react/destructuring-assignment
      this.props.beginEditSong(''); // Discard any edits left in the modal
    });
  }

  render() {
    const { song } = this.props;
    return (
      <>
        <div id="edit-song-modal" uk-modal="true">
          <div className="uk-modal-dialog">
            <div className="uk-background-muted uk-modal-header">
              {song.id && (
                <img
                  src={`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`}
                  className="uk-preserve-width"
                  alt=""
                  width="150"
                />
              )}
            </div>

            <div className="uk-modal-body">
              <form
                key={song.id}
                ref={r => {
                  this.form = r;
                }}
              >
                <SongFieldInput label="Title" value={song.title} name="title" />
                <SongFieldInput
                  label="Artist"
                  value={song.artist}
                  name="artist"
                />
                <SongFieldInput label="Album" value={song.album} name="album" />
                <SongFieldInput
                  label="Album Artist"
                  value={song.albumArtist}
                  name="albumArtist"
                />
                <SongFieldInput
                  label="Composer"
                  value={song.composer}
                  name="composer"
                />
                <SongFieldInput
                  label="Year"
                  type="number"
                  value={song.year}
                  name="year"
                />
                <SongFieldInput label="Genre" value={song.genre} name="genre" />
                <SongFieldInput
                  label="Track Number"
                  type="number"
                  value={song.trackNumber}
                  name="trackNumber"
                />
              </form>
            </div>

            <div className="uk-modal-footer uk-text-right">
              <button
                className="uk-button uk-button-default uk-modal-close"
                type="button"
              >
                Cancel
            </button>{' '}{/* eslint-disable-line */ /* Rule conflict between prettier and eslint */}
              <button
                className="uk-button uk-button-primary"
                type="button"
                onClick={() => {
                  if (this.form) {
                    // eslint-disable-next-line react/destructuring-assignment
                    this.props.finishEditSong({
                      id: song.id,
                      ...serializeForm(this.form, { hash: true })
                    });
                    UIkit.modal('#edit-song-modal').hide();
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state: ApplicationState) {
  const { editId } = state.song;
  return {
    song: editId ? state.song.songs[editId] : { id: '' }
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

export default connect(mapStateToProps, mapDispatchToProps)(EditSongModal);
