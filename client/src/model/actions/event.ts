import API from '../utils/api';
import { getDatarunDetails } from '../selectors/datarun';
import { getCurrentEventDetails, getEventDetails } from '../selectors/event';
import {
  FETCH_EVENT_DATA,
  IS_UPDATE_POPUP_OPEN,
  UPDATE_EVENT_DETAILS,
  IS_ADDING_EVENT,
  IS_CHANGING_EVENT_RANGE,
  SAVE_EVENT,
  UPDATE_EVENT_STATUS,
  DELETE_EVENT,
  UPDATE_DATARUN_EVENTS,
} from '../types';
import { getSelectedExperimentData } from '../selectors/experiment';

export function getEventDetailsAction(eventID) {
  return function (dispatch) {
    const action = {
      type: FETCH_EVENT_DATA,
      promise: API.events.find(`${eventID}/`),
    };
    dispatch(action);

    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: true });
  };
}

export function closeEventModal() {
  return async function (dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());

    await API.events.find(`${currentEventDetails.id}/`).then((response) => {
      const { start_time, stop_time } = response;
      dispatch({
        type: UPDATE_EVENT_DETAILS,
        eventDetails: { ...response, start_time: start_time * 1000, stop_time: stop_time * 1000 },
      });
      dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
      // dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent: false });
      dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
      // dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: false });
    });
  };
}

// real time updating
export function updateEventDetailsAction(updatedEventDetails) {
  return function (dispatch, getState) {
    // const isAddingNewEvent = getIsAddingNewEvents(getState());
    let currentEventDetails = getCurrentEventDetails(getState());
    // if (isAddingNewEvent) {
    //   currentEventDetails = getNewEventDetails(getState());
    // }
    dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: { ...currentEventDetails, ...updatedEventDetails } });
  };
}

export function deleteEventAction() {
  return async function (dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());
    const currentDatarun = getDatarunDetails(getState());
    const remainingEvents = currentDatarun.events.filter((currentEvent) => currentEvent.id !== currentEventDetails.id);

    const selectedExperimentData = getSelectedExperimentData(getState());
    const datarunIndex = selectedExperimentData.data.dataruns.findIndex(
      (dataItem) => dataItem.id === currentDatarun.id,
    );

    // @TODO - why server response is 405
    // dispatch(deleteEventComments());

    const deleteEvent = {
      type: DELETE_EVENT,
      promise: API.events.delete(currentEventDetails.id),
    };

    dispatch(deleteEvent);

    dispatch({
      type: UPDATE_DATARUN_EVENTS,
      datarunEvents: remainingEvents,
      datarunIndex,
    });

    dispatch(resetEventModalState());
  };
}

function deleteEventComments() {
  // @TODO - server responded with 405
  return function (dispatch, getState) {
    const eventDetails = getCurrentEventDetails(getState());
    const { comments } = eventDetails;
    comments.map((comment) => API.comments.delete(comment.id));
  };
}

export function isEditingEventRangeAction(eventState) {
  return function (dispatch) {
    dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: eventState });
  };
}

export function resetEventModalState() {
  return function (dispatch) {
    dispatch({ type: IS_ADDING_EVENT, isAddingEvent: false });
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
  };
}

export function openEventModalAction() {
  return function (dispatch) {
    dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: false });
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: true });
  };
}

function updateEventStatus(status: string | null) {
  return function (dispatch) {
    dispatch({ type: UPDATE_EVENT_STATUS, eventUpdateStatus: status });
  };
}

export function saveEventAction() {
  return async function (dispatch, getState) {
    const eventDetails = getEventDetails(getState());
    const { start_time, stop_time, commentsDraft } = eventDetails;

    const payLoad = {
      ...eventDetails,
      start_time: start_time / 1000,
      stop_time: stop_time / 1000,
    };

    // save event comments if any
    if (commentsDraft && commentsDraft.length) {
      const commentData = {
        event_id: eventDetails.id,
        text: commentsDraft,
        created_by: null, // no logged in user yet
      };
      await API.comments.create(commentData);
      dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: { ...eventDetails, commentsDraft: '' } });
    }

    // if is updating an existing event
    if (eventDetails.id) {
      const action = {
        type: SAVE_EVENT,
        promise: API.events.update(eventDetails.id, payLoad),
      };

      dispatch(action);
      dispatch(updateEventStatus('success'));

      setTimeout(function () {
        dispatch(updateEventStatus(null));
      }, 3000);

      // if (comments) {
      //   const commentsData = {
      //     event_id: eventDetails.id,
      //     text: comments,
      //     created_by: null, // no user so far
      //   };

      //   await API.comments.create(commentsData);
      // }

      // await API.events.update(eventDetails.id, payLoad).then(async (response) => {
      //   debugger;
      //   dispatch({
      //     type: UPDATE_EVENT,
      //     eventDetails: 'success',
      //   });
      // });
    }
  };
}
