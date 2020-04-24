import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons'

import {
  updateEventDetailsAction,
  saveEventDetailsAction,
  searchSimilarEvents,
  isEditingEventRangeAction,
  closeEventModal,
  deleteEventAction,
  updateNewEventDetailsAction,
} from '../../../../model/actions/datarun';

import {
  getCurrentEventDetails,
  getUpdatedEventsDetails,
  getIsEditingEventRange,
  getIsPopupOpen,
  getNewEventDetails,
  getIsAddingNewEvents,
  isSimilarEventsLoading
} from '../../../../model/selectors/datarun';

import Loader from '../../../Common/Loader';
import { formatOptionLabel, grouppedOptions, RenderComments, selectedOption } from './eventUtils';
import './EventDetails.scss';

const renderInfoTooltip = () => (
  <div className="tooltip-info">
    <p>Insert a score between 0 to 10</p>
    <ul>
      <li>0 - not severe</li>
      <li>10 - most severe</li>
    </ul>
  </div>
);
class EventDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTooltipVisible: false,
      pos: {x: 0, y: 0},
      dragging: false,
      rel: null // position relative to the cursor
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dragging && !prevState.dragging) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragging && prevState.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }
  }

  onMouseDown = (e) => {
    // only left mouse button
    if (e.button !== 0) return
    this.setState({
      dragging: true,
      rel: {
        x: e.pageX - this.wrapper.offsetLeft,
        y: e.pageY - this.wrapper.offsetTop
      }
    })
    e.stopPropagation()
    e.preventDefault()
  }

  onMouseUp = (e) => {
    this.setState({dragging: false})
    e.stopPropagation()
    e.preventDefault()
  }

  onMouseMove = (e) => {
    if (!this.state.dragging) return
    this.setState({
      pos: {
        x: e.pageX - this.state.rel.x,
        y: e.pageY - this.state.rel.y
      }
    })
    e.stopPropagation()
    e.preventDefault()
  }

  render() {
    const {
      eventDetails,
      updatedEventDetails,
      updateEventDetails,
      closeEventDetails,
      saveEventDetails,
      searchSimilarEvents,
      editEventRange,
      isEditingEventRange,
      isPopupOpen,
      deleteEvent,
      newEventDetails,
      isAddingNewEvent,
      updateNewEventDetails,
      isSimilarEventsLoading
    } = this.props;

    const currentEventDetails = isAddingNewEvent ? newEventDetails : eventDetails;
    const isActive = currentEventDetails && !isEditingEventRange && isPopupOpen ? 'active' : '';
    const changeEventTag = (tag) => {
      if (isAddingNewEvent) {
        updateNewEventDetails({ tag: tag.label });
      } else {
        updateEventDetails({ tag: tag.label });
      }
    };

    const updateEventScore = ({ target }) => {
      const eventScore = target.value;
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(eventScore) && eventScore <= 10) {
        updateEventDetails({ score: eventScore });
      }
    };

    return (
      <div className={"events-wrapper-overflow"}>
        <div className={`events-wrapper ${isActive}`} ref={c => this.wrapper = c}
            style={{left: `${this.state.pos.x}px`, top: `${this.state.pos.y}px`}}>
          {currentEventDetails && (
            <div className="events-header" onMouseDown={this.onMouseDown}>
              <button type="button" className="back-position"
                      onClick={()=>{this.setState({pos: {x:0, y: 0}})}}>
                o
              </button>
            </div> 
          )}
          {currentEventDetails && (
            <div className="events-body" ref={c => this.ebody = c}>
              <button type="button" className="close" onClick={closeEventDetails}>
                x
              </button>
              <div className="row">
                <label>Signal: </label>
                <span>{currentEventDetails.signal}</span>
              </div>
              {/* <div className="row">
                <label>Severity Score:</label>
                <span>{currentEventDetails.score}</span>
              </div> */}
              <div className="row">
                <label>From:</label>
                <span>{new Date(currentEventDetails.start_time).toUTCString()}</span>
              </div>
              <div className="row">
                <label>To:</label>
                <span>{new Date(currentEventDetails.stop_time).toUTCString()}</span>
                <button type="button" className="edit danger" onClick={() => editEventRange(true)}>
                  Modify
                </button>
              </div>
              <div className="row">
                {this.state.isTooltipVisible && renderInfoTooltip()}
                <label htmlFor="sevScore">Severity Score: </label>
                <input
                  type="text"
                  name="severity-score"
                  id="sevScore"
                  maxLength="2"
                  value={currentEventDetails.score}
                  onChange={(event) => updateEventScore(event)}
                  placeholder="-"
                />
                {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
                <i
                  className="score-info"
                  onMouseOver={() => this.setState({ isTooltipVisible: true })}
                  onMouseLeave={() => this.setState({ isTooltipVisible: false })}
                >
                  i
                </i>
              </div>
              <div className="row select-holder">
                <Select
                  onChange={(tag) => changeEventTag(tag)}
                  formatOptionLabel={formatOptionLabel}
                  options={grouppedOptions}
                  className="tag-select"
                  classNamePrefix="tag-options"
                  placeholder="Select a tag"
                  value={selectedOption(currentEventDetails.tag)}
                />
              </div>
              <div className="row form-group">
                <label htmlFor="comment">Comment</label>
                <div className="comment-area">
                  <div className="comment-wrapper scroll-style">
                    {(!isAddingNewEvent && (
                      <Loader isLoading={currentEventDetails.isCommentsLoading}>
                        <RenderComments comments={currentEventDetails.eventComments.comments} />
                      </Loader>
                    )) || <p>Comments can be added after saving event</p>}
                  </div>
                  <textarea
                    id="comment"
                    placeholder="Enter your comment..."
                    value={updatedEventDetails.comments}
                    onChange={(event) => updateEventDetails({ comments: event.target.value })}
                    readOnly={isAddingNewEvent}
                  />
                </div>
              </div>
              <div className="row ">
                <ul>
                  {!isAddingNewEvent && (
                    <li>
                      <button type="button" className="danger" onClick={deleteEvent}>
                        Delete
                      </button>
                    </li>
                  )}
                  <li>
                    <button type="button" onClick={saveEventDetails}>
                      Save
                    </button>
                  </li>
                  <li>
                      <button type="button" className="success" onClick={searchSimilarEvents}>
                        {isSimilarEventsLoading ? <FontAwesomeIcon className="fa-spin" icon={faSync} /> : "Search"}
                      </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

EventDetails.propTypes = {
  eventDetails: PropTypes.object,
  closeEventDetails: PropTypes.func,
  updateEventDetails: PropTypes.func,
  saveEventDetails: PropTypes.func,
  searchSimilarEvents: PropTypes.func
};

export default connect(
  (state) => ({
    eventDetails: getCurrentEventDetails(state),
    updatedEventDetails: getUpdatedEventsDetails(state),
    isEditingEventRange: getIsEditingEventRange(state),
    isPopupOpen: getIsPopupOpen(state),
    newEventDetails: getNewEventDetails(state),
    isAddingNewEvent: getIsAddingNewEvents(state),
    isSimilarEventsLoading: isSimilarEventsLoading(state)
  }),
  (dispatch) => ({
    closeEventDetails: () => dispatch(closeEventModal()),
    updateEventDetails: (details) => dispatch(updateEventDetailsAction(details)),
    saveEventDetails: () => dispatch(saveEventDetailsAction()),
    searchSimilarEvents: () => dispatch(searchSimilarEvents()),
    editEventRange: (eventState) => dispatch(isEditingEventRangeAction(eventState)),
    deleteEvent: () => dispatch(deleteEventAction()),
    updateNewEventDetails: (details) => dispatch(updateNewEventDetailsAction(details))
  }),
)(EventDetails);
