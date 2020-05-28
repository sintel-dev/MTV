import {
  getCurrentEventDetails,
  getUpdatedEventsDetails,
  getDatarunDetails,
  getZoomCounter,
  getNewEventDetails,
  getIsAddingNewEvents,
  getSelectedPeriodRange,
  isDatarunIDSelected,
} from '../selectors/datarun';
import { getSelectedExperimentData } from '../../model/selectors/experiment';
import API from '../utils/api';
import {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
  UPDATE_EVENT_DETAILS,
  IS_CHANGING_EVENT_RANGE,
  SET_ACTIVE_EVENT_ID,
  GET_EVENT_COMMENTS_SUCCESS,
  TOGGLE_PREDICTION_MODE,
  SelectDatarunAction,
  SetTimeseriesPeriodAction,
  IS_UPDATE_POPUP_OPEN,
  ADDING_NEW_EVENTS,
  NEW_EVENT_DETAILS,
  ADDING_NEW_EVENT_RESULT,
  UPDATE_DATARUN_EVENTS,
  SET_FILTER_TAGS,
  ZOOM_ON_CLICK,
  TOGGLE_ZOOM,
  SET_CURRENT_PERIOD_LEVEL,
  REVIEW_PERIOD_LEVEL,
  TOGGLE_EVENT_MODE,
  UPLOAD_JSON_EVENTS,
  EVENT_UPDATE_STATUS,
  TOGGLE_TIME_SYNC_RANGE,
} from '../types';

export function selectDatarun(datarunID: string) {
  return function (dispatch, getState) {
    const currentDatarunID = isDatarunIDSelected(getState());
    if (currentDatarunID === datarunID) {
      return;
    }
    const action: SelectDatarunAction = {
      type: SELECT_DATARUN,
      datarunID,
    };
    dispatch(action);
    dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: null });
    dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent: false });
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
  };
}

export function setTimeseriesPeriod(eventRange: {
  eventRange: Array<number>;
  zoomValue: any;
  timeStamp: Array<number>;
}) {
  return function (dispatch, getState) {
    const currentRange = getSelectedPeriodRange(getState());
    if (JSON.stringify(eventRange.eventRange) === JSON.stringify(currentRange.eventRange)) {
      return;
    }

    const action: SetTimeseriesPeriodAction = {
      type: SET_TIMESERIES_PERIOD,
      eventRange,
    };
    dispatch(action);
  };
}

export function setActiveEventAction(eventID) {
  return function (dispatch) {
    dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: eventID });
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: true });
    dispatch({ type: EVENT_UPDATE_STATUS, eventUpdateStatus: null });

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      dispatch({ type: 'SET_TRANSCRIPT_STATUS', isTranscriptSupported: true });
    } else {
      dispatch({ type: 'SET_TRANSCRIPT_STATUS', isTranscriptSupported: false });
    }

    dispatch(getEventComments());
  };
}

export function closeEventModal() {
  return async function (dispatch, getState) {
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
    const currentEventDetails = getCurrentEventDetails(getState());

    await API.events.find(`${currentEventDetails.id}/`).then((response) => {
      const { start_time, stop_time } = response;
      dispatch({
        type: UPDATE_EVENT_DETAILS,
        eventDetails: { ...response, start_time: start_time * 1000, stop_time: stop_time * 1000 },
      });

      dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent: false });
      dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
      dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: false });
      dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: {} });
    });
  };
}

export function getEventComments() {
  return async function (dispatch, getState) {
    const currentEventDetails = getCurrentEventDetails(getState());
    if (currentEventDetails) {
      const evtComments = await API.comments.find(`?event_id=${currentEventDetails.id}`);
      dispatch({ type: GET_EVENT_COMMENTS_SUCCESS, eventComments: evtComments });
    }
  };
}

export function togglePredictionsAction(event) {
  return function (dispatch) {
    dispatch({ type: TOGGLE_PREDICTION_MODE, isPredictionEnabled: event });
  };
}

export function toggleEventModeAction(mode) {
  return function (dispatch) {
    dispatch({ type: TOGGLE_EVENT_MODE, isEventModeEnabled: mode });
  };
}

export function toggleTimeSyncModeAction(syncMode) {
  return function (dispatch) {
    dispatch({
      type: TOGGLE_TIME_SYNC_RANGE,
      isTimeSyncModeEnabled: syncMode,
    });
  };
}

export function updateEventDetailsAction(updatedEventDetails) {
  return function (dispatch, getState) {
    const isAddingNewEvent = getIsAddingNewEvents(getState());
    let currentEventDetails = getCurrentEventDetails(getState());
    if (isAddingNewEvent) {
      currentEventDetails = getNewEventDetails(getState());
    }

    dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: { ...currentEventDetails, ...updatedEventDetails } });
  };
}

export function isEditingEventRangeAction(eventState) {
  return function (dispatch) {
    dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: eventState });
  };
}

export function saveEventDetailsAction() {
  return async function (dispatch, getState) {
    const updatedEventDetails = getUpdatedEventsDetails(getState());
    const { commentsDraft } = updatedEventDetails;
    const { start_time, stop_time, score, tag } = updatedEventDetails;

    const start = start_time / 1000;
    const stop = stop_time / 1000;

    const payload = {
      start_time: start,
      stop_time: stop,
      score,
      tag,
      event_id: updatedEventDetails.id,
    };

    if (commentsDraft && commentsDraft.length) {
      const commentData = {
        event_id: updatedEventDetails.id,
        text: commentsDraft,
        created_by: null, // no particular details about the logged in user
      };

      // posting comments
      await API.comments.create(commentData);
      dispatch(getEventComments());
      dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: { ...updatedEventDetails, commentsDraft: '' } });
    }

    if (updatedEventDetails.id) {
      await API.events
        .update(updatedEventDetails.id, payload)
        .then(async () => {
          dispatch({
            type: EVENT_UPDATE_STATUS,
            eventUpdateStatus: 'success',
          });

          // @TODO - make a sinle API call with find instead of all
          await API.events.all('events').then((response) => {
            const { events } = response;
            const datarun = getDatarunDetails(getState());
            const filteredEvents = events.filter((event) => event.datarun === datarun.id);

            const selectedExperimentData = getSelectedExperimentData(getState());
            const datarunIndex = selectedExperimentData.data.dataruns.findIndex(
              (dataItem) => dataItem.id === datarun.id,
            );
            dispatch({
              type: UPDATE_DATARUN_EVENTS,
              newDatarunEvents: filteredEvents,
              datarunIndex,
            });

            setTimeout(function () {
              dispatch({
                type: EVENT_UPDATE_STATUS,
                eventUpdateStatus: null,
              });
            }, 3000);
          });
        })
        .catch(() => dispatch({ type: EVENT_UPDATE_STATUS, eventUpdateStatus: 'error' }));
    } else {
      dispatch(saveNewEventAction());
    }
  };
}

export function addNewEventAction(isAddingEvent) {
  return async function (dispatch) {
    dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: {} });
    dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent });
  };
}

export function updateNewEventDetailsAction(eventDetails) {
  return function (dispatch, getState) {
    const datarun = getDatarunDetails(getState());
    const currentEventDetails = getNewEventDetails(getState());
    const eventTemplate = {
      ...currentEventDetails,
      ...eventDetails,
      datarun_id: datarun.id,
      score: 0,
      tag: (eventDetails.tag && eventDetails.tag) || null,
    };

    dispatch({ type: NEW_EVENT_DETAILS, newEventDetails: eventTemplate });
  };
}

export function openNewDetailsPopupAction() {
  return function (dispatch) {
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: true });
  };
}

export function openEventDetailsPopupAction() {
  return function (dispatch) {
    dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: false });
    dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: true });
  };
}

export function saveNewEventAction() {
  return async function (dispatch, getState) {
    const newEventDetails = getNewEventDetails(getState());
    let { start_time, stop_time } = newEventDetails;
    start_time /= 1000;
    stop_time /= 1000;
    const eventDetails = {
      start_time,
      stop_time,
      score: '0.00',
      tag: newEventDetails.tag || 'Untagged',
      datarun_id: newEventDetails.datarun_id || newEventDetails.datarun,
    };
    await API.events
      .create(eventDetails)
      .then(async () => {
        await API.events.all(newEventDetails.datarun_id || newEventDetails.datarun).then((datarunEvents) => {
          const datarun = getDatarunDetails(getState());
          const selectedExperimentData = getSelectedExperimentData(getState());
          const datarunIndex = selectedExperimentData.data.dataruns.findIndex((dataItem) => dataItem.id === datarun.id);
          const newDatarunEvents = datarunEvents.events.filter((event) => event.datarun === datarun.id);

          dispatch({
            type: UPDATE_DATARUN_EVENTS,
            newDatarunEvents,
            datarunIndex,
          });
          dispatch({ type: ADDING_NEW_EVENT_RESULT, result: 'success' });
          dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
          dispatch({ type: ADDING_NEW_EVENTS, isAddingEvent: false });
          dispatch({ type: NEW_EVENT_DETAILS, newEventDetails: {} });
          dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: null });
        });
      })
      .catch((err) => dispatch({ type: ADDING_NEW_EVENT_RESULT, result: err }));
  };
}

export function loadEventsFromJsonAction(jsonFiles) {
  return async function (dispatch) {
    // @TODO - implement it when backend is ready
    return dispatch({ type: UPLOAD_JSON_EVENTS, uploadEventsStatus: 'success' });
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

    // @TODO - implement delete comments as wel.
    // Investigate why server response is 405 when deleting comment
    // dispatch(deleteEventComments());

    await API.events.delete(currentEventDetails.id).then(() => {
      dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: null });
      dispatch({
        type: UPDATE_DATARUN_EVENTS,
        newDatarunEvents: remainingEvents,
        datarunIndex,
      });

      dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
    });
  };
}

export function filterEventsByTagAction(tags) {
  return function (dispatch) {
    dispatch({ type: SET_FILTER_TAGS, filterTags: tags !== null ? tags : [] });
  };
}

export function zoomOnClick(zoomDirection) {
  return function (dispatch, getState) {
    let zoomCounter = getZoomCounter(getState());
    zoomDirection === 'In' ? (zoomCounter += 1) : (zoomCounter -= 1);
    dispatch({ type: ZOOM_ON_CLICK, zoomDirection, zoomCounter });
  };
}

export function zoomToggleAction(zoomMode) {
  return function (dispatch) {
    dispatch({ type: TOGGLE_ZOOM, zoomMode });
  };
}

export function setPeriodRangeAction(newPeriod) {
  return function (dispatch) {
    if (newPeriod.level !== 'day') {
      if (newPeriod.level === 'year') {
        dispatch({
          type: SET_CURRENT_PERIOD_LEVEL,
          isPeriodLevelSelected: true,
          periodLevel: {
            year: newPeriod.name,
            month: '',
          },
        });
        dispatch(reviewPeriodAction('month'));
      }

      if (newPeriod.level === 'month') {
        dispatch({
          type: SET_CURRENT_PERIOD_LEVEL,
          isPeriodLevelSelected: true,
          periodLevel: {
            year: newPeriod.parent.name,
            month: newPeriod.name,
          },
        });
        dispatch(reviewPeriodAction('day'));
      }
    }
  };
}

export function reviewPeriodAction(period) {
  return function (dispatch) {
    dispatch({ type: REVIEW_PERIOD_LEVEL, isPeriodLevelSelected: true, reviewPeriod: period });
  };
}

export function recordCommentAction() {
  return function (dispatch, getState) {
    const updatedEventDetails = getUpdatedEventsDetails(getState());
    const { commentsDraft } = updatedEventDetails;
    dispatch({ type: 'SPEECH_STATUS', isSpeechInProgress: true });

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.start();
    recognition.onresult = function (event) {
      const current = event.resultIndex;
      const { transcript } = event.results[current][0];
      const comments = commentsDraft ? `${commentsDraft} ${transcript}.` : transcript;
      dispatch(updateEventDetailsAction({ commentsDraft: comments }));
      dispatch({ type: 'SPEECH_STATUS', isSpeechInProgress: false });
    };
  };
}
