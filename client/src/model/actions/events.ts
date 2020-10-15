import Cookies from 'js-cookie';
import { getDatarunDetails, getCurrentEventDetails } from '../selectors/datarun';
import { getIsAddingNewEvents, getNewEventDetails, getUpdatedEventDetails } from '../selectors/events';
import { getSelectedExperimentData } from '../selectors/experiment';
import { getCurrentActivePanel } from '../selectors/sidebar';
import {
  ADDING_NEW_EVENTS,
  ADDING_NEW_EVENT_RESULT,
  AddNewEventActionType,
  EVENT_UPDATE_STATUS,
  FetchEventDetailsAction,
  FETCH_EVENT_DATA,
  FETCH_EVENT_HISTORY,
  GET_EVENT_COMMENTS_SUCCESS,
  IS_CHANGING_EVENT_RANGE,
  NEW_EVENT_DETAILS,
  SetEventIDAction,
  SetEventStatusAction,
  SET_ACTIVE_EVENT_ID,
  SET_FILTER_TAGS,
  SET_TRANSCRIPT_STATUS,
  TOGGLE_EVENT_MODE,
  UpdateEventDetailsAction,
  UPDATE_DATARUN_EVENTS,
  UPDATE_EVENT_DETAILS,
  UPLOAD_JSON_EVENTS,
} from '../types';
import API from '../utils/api';
import { AUTHENTICATED_USER_ID, AUTH_USER_DATA } from '../utils/constants';
import { setActivePanelAction } from './sidebar';
import { toggleSimilarShapesAction } from './similarShapes';

export function addNewEventAction(isAddingEvent: boolean) {
  return async function (dispatch) {
    const action: AddNewEventActionType = {
      type: ADDING_NEW_EVENTS,
      isAddingEvent,
    };
    dispatch(action);
  };
}

export function getCurrentEventHistoryAction() {
  return function (dispatch, getState) {
    const currentEvent = getCurrentEventDetails(getState());
    if (!currentEvent) {
      return null;
    }

    const eventID = currentEvent.id;
    const tagHistory = {
      type: FETCH_EVENT_HISTORY,
      promise: API.eventInteraction.all({}, { event_id: eventID, action: 'TAG' }),
    };

    return dispatch(tagHistory);
  };
}

/**
 * being used when cancelling adding new event as well
 */
export function cancelEventEditingAction() {
  return async function (dispatch, getState) {
    // dispatch({ type: IS_UPDATE_POPUP_OPEN, isPopupOpen: false });
    const currentEventDetails = getCurrentEventDetails(getState());

    if (currentEventDetails) {
      const fetchEventDetailsAction: FetchEventDetailsAction = {
        type: FETCH_EVENT_DATA,
        promise: API.events.find(`${currentEventDetails.id}/`),
      };

      dispatch(fetchEventDetailsAction);

      await fetchEventDetailsAction.promise.then((response) => {
        const { start_time, stop_time } = response;
        const updateEventAction: UpdateEventDetailsAction = {
          type: UPDATE_EVENT_DETAILS,
          eventDetails: {
            ...response,
            start_time: start_time * 1000,
            stop_time: stop_time * 1000,
          },
        };

        dispatch(updateEventAction);
      });
    }

    dispatch(addNewEventAction(false));
    dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: false });
    dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: {} });
    dispatch({ type: NEW_EVENT_DETAILS, newEventDetails: null });
    dispatch(toggleSimilarShapesAction(false));
    dispatch(setActiveEventAction(null));
  };
}

export function setActiveEventAction(eventID: string | null) {
  return function (dispatch, getState) {
    if (eventID === null) {
      return dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: null });
    }

    const currentPanel: string = getCurrentActivePanel(getState());

    const setEventIDAction: SetEventIDAction = {
      type: SET_ACTIVE_EVENT_ID,
      activeEventID: eventID,
    };

    dispatch(setEventIDAction);
    dispatch(toggleSimilarShapesAction(false));
    dispatch(eventUpdateStatusAction(null));
    dispatch(setTranscriptStatusAction());
    dispatch(getEventComments());
    dispatch(getCurrentEventHistoryAction());
    return (currentPanel === 'periodicalView' || currentPanel === null) && dispatch(setActivePanelAction('signalView'));
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

function eventUpdateStatusAction(newStatus: string | null) {
  return function (dispatch) {
    const action: SetEventStatusAction = {
      type: EVENT_UPDATE_STATUS,
      eventUpdateStatus: newStatus,
    };
    dispatch(action);
  };
}

function setTranscriptStatusAction() {
  return function (dispatch) {
    const action = {
      type: SET_TRANSCRIPT_STATUS,
      isTranscriptSupported: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    };

    dispatch(action);
  };
}

export function saveEventDetailsAction() {
  return async function (dispatch, getState) {
    const updatedEventDetails = getUpdatedEventDetails(getState());
    const userID = Cookies.get(AUTHENTICATED_USER_ID);
    const dataRun = getDatarunDetails(getState());

    // @TODO - getting the user data without Google authentication is yet to be handled
    const userData = JSON.parse(Cookies.get(AUTH_USER_DATA));
    if (!userID) {
      return;
    }

    const { commentsDraft } = updatedEventDetails;
    const { start_time, stop_time, score, tag } = updatedEventDetails;

    const start = start_time / 1000;
    const stop = stop_time / 1000;

    const payload = {
      start_time: start,
      stop_time: stop,
      score,
      tag,
      datarun_id: dataRun.id,
      event_id: updatedEventDetails.id,
      created_by: userData.name,
    };

    if (commentsDraft && commentsDraft.length) {
      const commentData = {
        event_id: updatedEventDetails.id,
        text: commentsDraft,
        created_by: userData.name,
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
          dispatch(eventUpdateStatusAction('success'));

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
              dispatch(eventUpdateStatusAction(null));
            }, 3000);
            dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: false });
            dispatch(getCurrentEventHistoryAction());
          });
        })
        .catch(() => dispatch(eventUpdateStatusAction('error')));
    } else {
      dispatch(saveNewEventAction());
    }
  };
}

export function saveNewEventAction() {
  return async function (dispatch, getState) {
    const newEventDetails = getNewEventDetails(getState());
    let { start_time, stop_time } = newEventDetails;
    start_time /= 1000;
    stop_time /= 1000;
    const userData = JSON.parse(Cookies.get(AUTH_USER_DATA));
    const eventDetails = {
      start_time,
      stop_time,
      score: '0.00',
      tag: newEventDetails.tag || 'Untagged',
      datarun_id: newEventDetails.datarun_id || newEventDetails.datarun,
      created_by: userData.name,
      source: newEventDetails.source ? newEventDetails.source : 'MANUALLY_CREATED',
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
          dispatch(addNewEventAction(false));
          dispatch({ type: NEW_EVENT_DETAILS, newEventDetails: {} });
          dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: null });
        });
      })
      .catch((err) => dispatch({ type: ADDING_NEW_EVENT_RESULT, result: err }));
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
      dispatch(addNewEventAction(false));
      dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: false });
      dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: {} });
      dispatch(toggleSimilarShapesAction(false));
    });
  };
}

export function toggleEventModeAction(mode) {
  return function (dispatch) {
    dispatch({ type: TOGGLE_EVENT_MODE, isEventModeEnabled: mode });
  };
}

export function updateEventDetailsAction(updatedEventDetails) {
  return function (dispatch, getState) {
    const isAddingNewEvent = getIsAddingNewEvents(getState());
    let currentEventDetails = getCurrentEventDetails(getState());
    if (isAddingNewEvent) {
      currentEventDetails = getNewEventDetails(getState());
      return dispatch(updateNewEventDetailsAction(updatedEventDetails));
    }

    return dispatch({ type: UPDATE_EVENT_DETAILS, eventDetails: { ...currentEventDetails, ...updatedEventDetails } });
  };
}

export function isEditingEventRangeAction(eventState) {
  return function (dispatch) {
    dispatch({ type: IS_CHANGING_EVENT_RANGE, isEditingEventRange: eventState });
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
      tag: (eventDetails.tag && eventDetails.tag) || 'Untagged',
    };

    dispatch({ type: NEW_EVENT_DETAILS, newEventDetails: eventTemplate });
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

    await API.events.delete(currentEventDetails.id).then(() => {
      dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: null });
      dispatch({
        type: UPDATE_DATARUN_EVENTS,
        newDatarunEvents: remainingEvents,
        datarunIndex,
      });
    });
  };
}

export function filterEventsByTagAction(tags) {
  return function (dispatch) {
    dispatch({ type: SET_FILTER_TAGS, filterTags: tags !== null ? tags : [] });
  };
}

export function recordCommentAction(recordState) {
  return function (dispatch, getState) {
    const updatedEventDetails = getUpdatedEventDetails(getState());
    const { commentsDraft } = updatedEventDetails;
    dispatch({ type: 'SPEECH_STATUS', isSpeechInProgress: recordState });

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

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
