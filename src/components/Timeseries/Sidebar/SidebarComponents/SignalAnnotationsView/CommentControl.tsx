import React, { Component } from 'react';
import { connect } from 'react-redux';
import { filterOptions, formatOptionLabel } from 'src/components/Common/Dropdown';
import { colorSchemes } from 'src/components/Timeseries/FocusChart/Constants';
import {
  recordCommentAction,
  updateEventDetailsAction,
  closeEventDetailsAction,
  saveEventDetailsAction,
} from 'src/model/actions/events';
import { getUpdatedEventDetails, getIsSpeechInProgress } from 'src/model/selectors/events';
import { RecordingIcon, MicrophoneIcon, CloseIcon } from 'src/components/Common/icons';
import Select from 'react-select';
import './CommentControl.scss';
import { RootState } from 'src/model/types';

type OwnProps = {
  currentEvent: {
    id: string;
    tag: string;
  };
  isChangeTagEnabled?: boolean;
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps & OwnProps;

class CommentControl extends Component<Props> {
  renderTagBadge() {
    const { tag } = this.props.updatedEventDetails;

    const bgColor = (tag && colorSchemes[tag]) || colorSchemes.Untagged;
    const eventClassName = tag?.replace(/\s/g, '_').toLowerCase() || 'untagged';
    return (
      <div className="badge-wrapper">
        <ul>
          <li>Assign tag</li>
          <li>
            <div style={{ background: bgColor }} className={`evt-tag ${eventClassName}`}>
              <span>{tag}</span>
            </div>
          </li>
        </ul>
      </div>
    );
  }

  render() {
    const {
      currentEvent,
      isSpeechInProgress,
      recordComment,
      updatedEventDetails,
      updateEventDetails,
      closeEventDetails,
      saveEventDetails,
      isChangeTagEnabled,
    } = this.props;

    if (!currentEvent) {
      return null;
    }

    const isEventTagChanged: boolean =
      updatedEventDetails.id === currentEvent.id && updatedEventDetails.tag !== currentEvent.tag;

    const commentText: string = updatedEventDetails.id === currentEvent.id ? updatedEventDetails.commentsDraft : '';
    const isEventCommentChanged: boolean =
      updatedEventDetails.id === currentEvent.id && updatedEventDetails.commentsDraft;
    const isEventChanged: boolean = isEventCommentChanged || isEventTagChanged;

    return (
      <div className="comment-wrapper">
        <div className="comment-heading">
          <div className="speech-controls" />
          <ul className="comment-holder">
            <li className="dropdown">
              {isChangeTagEnabled && (
                <Select
                  formatOptionLabel={formatOptionLabel}
                  options={filterOptions}
                  classNamePrefix="tag-options"
                  className="tag-select assign-tag"
                  placeholder="Assign a tag"
                  isMulti={false}
                  isSearchable={false}
                  value="Assing a tag"
                  onChange={(option: { value: string }) => updateEventDetails({ tag: option.value })}
                />
              )}
            </li>
            <li>
              <button className="clean" type="button" onClick={() => recordComment(!isSpeechInProgress)}>
                {isSpeechInProgress ? <RecordingIcon /> : <MicrophoneIcon />}
              </button>
            </li>
          </ul>
        </div>
        <div className="comment-content">
          {isEventTagChanged ? (
            this.renderTagBadge()
          ) : (
            <textarea
              value={commentText}
              onChange={(evt) => updateEventDetails({ commentsDraft: evt.target.value })}
              placeholder="Enter your comment..."
            />
          )}
          <div className="event-actions">
            <ul>
              {isEventTagChanged && (
                <li>
                  <button className="clean close" type="button" onClick={closeEventDetails}>
                    <CloseIcon />
                  </button>
                </li>
              )}
              <li>
                <button type="button" onClick={saveEventDetails} disabled={!isEventChanged}>
                  Enter
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  isSpeechInProgress: getIsSpeechInProgress(state),
  updatedEventDetails: getUpdatedEventDetails(state),
});

const mapDispatch = (dispatch: Function) => ({
  recordComment: (recordState) => dispatch(recordCommentAction(recordState)),
  updateEventDetails: (eventDetails) => dispatch(updateEventDetailsAction(eventDetails)),
  closeEventDetails: () => dispatch(closeEventDetailsAction()),
  saveEventDetails: () => dispatch(saveEventDetailsAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(CommentControl);
