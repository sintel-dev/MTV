import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';

import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import Dropdown from 'src/components/Common/Dropdown';
import {
  updateEventDetailsAction,
  isEditingEventRangeAction,
  saveEventDetailsAction,
  deleteEventAction,
  setActiveEventAction,
  cancelEventEditingAction,
} from 'src/model/actions/events';
import { getCurrentEventDetails } from 'src/model/selectors/datarun';
import { getUpdatedEventDetails, getIsAddingNewEvents, getNewEventDetails } from 'src/model/selectors/events';

import { RootState } from 'src/model/types';
import { selectedOption } from './eventUtils';
import EventComments from '../SignalAnnotationsView/EventComments';
import CommentControl from '../SignalAnnotationsView/CommentControl';
import './EventDetails.scss';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

const getEventSource = (type: string) => {
  switch (type) {
    case 'SHAPE_MATCHING':
      return 'Shape Matching';
    case 'MANUALLY_CREATED':
      return 'Manually Created';
    default:
      return 'Orion';
  }
};

class EventDetailsView extends Component<Props> {
  noEventToRender() {
    return (
      <div className="no-event">
        <p>
          Add or Select an Event in <br />
          order to see details.
        </p>
      </div>
    );
  }

  renderEventHeader() {
    const { eventDetails, updateEventDetails, editEventRange, newEventDetails, isAddingNewEvent } = this.props;
    const currentEvent = isAddingNewEvent ? newEventDetails : eventDetails;
    const { start_time, stop_time, score, tag, source } = currentEvent;

    const scoreFormatter = d3.format('.3f') as Function;

    return (
      <div className="evt-ops">
        <div className="evt-detail">
          <table>
            <tbody>
              <tr className="date-time">
                <td width="46%">
                  <p>From</p>
                  {timestampToDate(start_time)}
                </td>
                <td>
                  <p>To</p>
                  {timestampToDate(stop_time)}
                </td>
                <td>
                  <button type="button" className="clean evt-edit" onClick={() => editEventRange(true)}>
                    Edit time
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <table>
            <tbody>
              <tr>
                <td width="46%">
                  <p>Tag</p>
                  <Dropdown
                    value={selectedOption(tag)}
                    onChange={(evtTag: { label: string }) => updateEventDetails({ tag: evtTag.label })}
                  />
                </td>
                <td width="29%">
                  <p>Severity Score</p>
                  {scoreFormatter(score)}
                </td>
                <td>
                  <p>Source</p>
                  {getEventSource(source)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderEventFooter() {
    const { saveEventDetails, deleteEvent, cancelEventEditing, isAddingNewEvent } = this.props;
    return (
      <div className="evt-footer">
        <ul>
          {!isAddingNewEvent && (
            <li>
              <button type="button" className="clean delete" onClick={deleteEvent}>
                Delete
              </button>
            </li>
          )}
        </ul>
        <ul>
          <li>
            <button type="button" className="clean" onClick={() => cancelEventEditing()}>
              Cancel
            </button>
          </li>
          <li>
            <button type="button" className="save" onClick={saveEventDetails}>
              Save changes
            </button>
          </li>
        </ul>
      </div>
    );
  }

  renderEventDetails(eventDetails) {
    const { isAddingNewEvent } = this.props;
    return (
      <>
        <div className="evt-row">{this.renderEventHeader()}</div>
        {!isAddingNewEvent && (
          <div className="evt-row evt-actions">
            <EventComments isEventJumpVisible={false} />
            <CommentControl isChangeTagEnabled={false} currentEvent={eventDetails} />
          </div>
        )}
        {this.renderEventFooter()}
      </>
    );
  }

  render() {
    const { eventDetails, isAddingNewEvent, newEventDetails } = this.props;
    const currentEventDetails = isAddingNewEvent ? newEventDetails : eventDetails;

    return currentEventDetails ? (
      <div className={`event-details ${(isAddingNewEvent && 'new-event') || ''}`}>
        {this.renderEventDetails(currentEventDetails)}
      </div>
    ) : (
      this.noEventToRender()
    );
  }
}

const mapState = (state: RootState) => ({
  eventDetails: getCurrentEventDetails(state),
  updatedEventDetails: getUpdatedEventDetails(state),
  isAddingNewEvent: getIsAddingNewEvents(state),
  newEventDetails: getNewEventDetails(state),
});

const mapDispatch = (dispatch: Function) => ({
  updateEventDetails: (eventDetails) => dispatch(updateEventDetailsAction(eventDetails)),
  editEventRange: (eventState) => dispatch(isEditingEventRangeAction(eventState)),
  saveEventDetails: () => dispatch(saveEventDetailsAction()),
  deleteEvent: () => dispatch(deleteEventAction()),
  setActiveEvent: (eventID) => dispatch(setActiveEventAction(eventID)),
  cancelEventEditing: () => dispatch(cancelEventEditingAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(EventDetailsView);
