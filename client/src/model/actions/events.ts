import Cookies from 'js-cookie';
import { getDatarunDetails, getCurrentEventDetails } from '../selectors/datarun';
import { getIsAddingNewEvents, getNewEventDetails, getUpdatedEventDetails } from '../selectors/events';
import { getSelectedExperimentData } from '../selectors/experiment';
import { getCurrentActivePanel } from '../selectors/sidebar';
import {
  ADDING_NEW_EVENTS,
  ADDING_NEW_EVENT_RESULT,
  FETCH_EVENT_DATA,
  FETCH_EVENT_HISTORY,
  GET_EVENT_COMMENTS,
  IS_CHANGING_EVENT_RANGE,
  NEW_EVENT_DETAILS,
  SET_ACTIVE_EVENT_ID,
  SET_FILTER_TAGS,
  SET_TRANSCRIPT_STATUS,
  TOGGLE_EVENT_MODE,
  UPDATE_DATARUN_EVENTS,
  UPDATE_EVENT_DETAILS,
  UPLOAD_JSON_EVENTS,
  SPEECH_STATUS,
  EVENT_UPDATE_STATUS,
  UpdateEventDetailsActionType,
  AddNewEventActionType,
  SetTranscriptStatusActionType,
  EventDataType,
  FetchEventDetailsActionType,
  FetchEventHistoryActionType,
  GetEventCommentsActionType,
  SetEventIDActionType,
  SetEventStatusActionType,
  DatarunDataType,
  ToggleEventModeActionType,
  IsEditingEventRangeActionType,
  UpdatedEventDetailsType,
  SetFilterTagsActionType,
  RecordCommentType,
  UpdateNewEventDetailsActionType,
  AddNewEventResultActionType,
} from '../types';
import API from '../utils/api';
import { AUTHENTICATED_USER_ID, AUTH_USER_DATA } from '../utils/constants';
import { getSignalRawDataAction } from './aggregationLevels';
import { setActivePanelAction } from './sidebar';
import { toggleSimilarShapesAction } from './similarShapes';

export function addNewEventAction(isAddingEvent: boolean) {
  return async function (dispatch) {
    const action: AddNewEventActionType = {
      type: ADDING_NEW_EVENTS,
      isAddingEvent,
    };
    dispatch(setActiveEventAction(null));
    dispatch(action);
  };
}

export function getCurrentEventHistoryAction() {
  return function (dispatch, getState) {
    const currentEvent: EventDataType | null = getCurrentEventDetails(getState());
    if (!currentEvent) {
      return null;
    }

    const eventID: string = currentEvent.id;
    const action: FetchEventHistoryActionType = {
      type: FETCH_EVENT_HISTORY,
      promise: API.eventInteraction.all({}, { event_id: eventID, action: 'TAG' }),
    };

    return dispatch(action);
  };
}

/**
 * being used when cancelling adding new event as well
 */
export function cancelEventEditingAction() {
  return async function (dispatch, getState) {
    const currentEventDetails: EventDataType = getCurrentEventDetails(getState());

    if (currentEventDetails) {
      const fetchEventDetailsAction: FetchEventDetailsActionType = {
        type: FETCH_EVENT_DATA,
        promise: API.events.find(`${currentEventDetails.id}/`),
      };

      dispatch(fetchEventDetailsAction);

      await fetchEventDetailsAction.promise.then((response: EventDataType) => {
        const { start_time, stop_time } = response;
        const eventDetails = {
          ...response,
          start_time: start_time * 1000,
          stop_time: stop_time * 1000,
        };
        dispatch(updateEventDetailsAction(eventDetails));
      });
    }

    dispatch(addNewEventAction(false));
    dispatch(isEditingEventRangeAction(false));
    dispatch(updateEventDetailsAction({}));
    dispatch({ type: NEW_EVENT_DETAILS, newEventDetails: null });
    dispatch(toggleSimilarShapesAction(false));
    dispatch(setActiveEventAction(null));
  };
}

export function setActiveEventAction(eventID: string | null) {
  return function (dispatch, getState) {
    const setEventIDAction: SetEventIDActionType = {
      type: SET_ACTIVE_EVENT_ID,
      activeEventID: eventID,
    };

    if (eventID === null) {
      return dispatch(setEventIDAction);
    }

    const currentPanel: string = getCurrentActivePanel(getState());

    dispatch(setEventIDAction);
    dispatch(toggleSimilarShapesAction(false));
    dispatch(eventUpdateStatusAction(null));
    dispatch(setTranscriptStatusAction());
    dispatch(getEventComments());
    dispatch(getCurrentEventHistoryAction());
    dispatch(getSignalRawDataAction());
    return (currentPanel === 'periodicalView' || currentPanel === null) && dispatch(setActivePanelAction('signalView'));
  };
}

export function getEventComments() {
  return async function (dispatch, getState) {
    const currentEventDetails: EventDataType = getCurrentEventDetails(getState());
    if (currentEventDetails) {
      const action: GetEventCommentsActionType = {
        type: GET_EVENT_COMMENTS,
        promise: API.comments.find(`?event_id=${currentEventDetails.id}`),
      };
      dispatch(action);
    }
  };
}

function eventUpdateStatusAction(newStatus: string | null) {
  return function (dispatch) {
    const action: SetEventStatusActionType = {
      type: EVENT_UPDATE_STATUS,
      eventUpdateStatus: newStatus,
    };
    dispatch(action);
  };
}

function setTranscriptStatusAction() {
  return function (dispatch) {
    const action: SetTranscriptStatusActionType = {
      type: SET_TRANSCRIPT_STATUS,
      isTranscriptSupported: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    };

    dispatch(action);
  };
}

export function saveEventDetailsAction() {
  return async function (dispatch, getState) {
    const updatedEventDetails: UpdatedEventDetailsType = getUpdatedEventDetails(getState());

    const isAddingNewEvent: boolean = getIsAddingNewEvents(getState());
    if (isAddingNewEvent) {
      dispatch(saveNewEventAction());
      return;
    }

    if (!Object.keys(updatedEventDetails).length) {
      return;
    }

    const userID = Cookies.get(AUTHENTICATED_USER_ID);
    const dataRun = getDatarunDetails(getState());

    // @TODO - getting the user data without Google authentication is yet to be handled
    const userData = JSON.parse(Cookies.get(AUTH_USER_DATA));
    if (!userID) {
      return;
    }

    const { commentsDraft } = updatedEventDetails;
    const { start_time, stop_time, score, tag } = updatedEventDetails;

    const start: number = start_time / 1000;
    const stop: number = stop_time / 1000;

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
      const commentData: { event_id: string; text: string; created_by: string } = {
        event_id: updatedEventDetails.id,
        text: commentsDraft,
        created_by: userData.name,
      };

      API.comments.create(commentData);
    }
    await API.events
      .update(updatedEventDetails.id, payload)
      .then(async () => {
        dispatch(eventUpdateStatusAction('success'));

        // @TODO - make a sinle API call with find instead of all
        await API.events.all('events').then((response) => {
          const { events } = response;
          const datarun: DatarunDataType = getDatarunDetails(getState());
          const filteredEvents: EventDataType[] = events.filter((event) => event.datarun === datarun.id);
          const eventDetails = { ...updatedEventDetails, commentsDraft: '' };

          dispatch(updateDatarunEvents(filteredEvents));
          dispatch(getEventComments());
          dispatch(updateEventDetailsAction(eventDetails));
          setTimeout(function () {
            dispatch(eventUpdateStatusAction(null));
          }, 3000);
          dispatch(isEditingEventRangeAction(false));
          dispatch(getCurrentEventHistoryAction());
        });
      })
      .catch(() => dispatch(eventUpdateStatusAction('error')));
  };
}

export function saveNewEventAction() {
  return async function (dispatch, getState) {
    const newEventDetails: EventDataType = getNewEventDetails(getState());
    let { start_time, stop_time }: { start_time: number; stop_time: number } = newEventDetails;
    start_time /= 1000;
    stop_time /= 1000;
    const userData: { name: string } = JSON.parse(Cookies.get(AUTH_USER_DATA));
    const eventDetails = {
      start_time,
      stop_time,
      score: '0.00',
      tag: newEventDetails.tag || 'Untagged',
      datarun_id: newEventDetails.datarun || newEventDetails.datarun,
      created_by: userData.name,
      source: newEventDetails.source ? newEventDetails.source : 'MANUALLY_CREATED',
    };

    const updateAddEventResult = (result) => {
      const addEventResultAction: AddNewEventResultActionType = {
        type: ADDING_NEW_EVENT_RESULT,
        result,
      };
      dispatch(addEventResultAction);
    };

    await API.events
      .create(eventDetails)
      .then(async () => {
        await API.events.all(newEventDetails.datarun).then((datarunEvents) => {
          const datarun: DatarunDataType = getDatarunDetails(getState());
          const newDatarunEvents: EventDataType[] = datarunEvents.events.filter(
            (event) => event.datarun === datarun.id,
          );

          dispatch(updateDatarunEvents(newDatarunEvents));
          updateAddEventResult('success');
          dispatch(addNewEventAction(false));
          dispatch({ type: NEW_EVENT_DETAILS, newEventDetails: {} });
          dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: null });
        });
      })
      .catch((err) => updateAddEventResult(err));
  };
}

export function closeEventDetailsAction() {
  return async function (dispatch, getState) {
    const currentEventDetails: EventDataType = getCurrentEventDetails(getState());

    await API.events.find(`${currentEventDetails.id}/`).then((response) => {
      const { start_time, stop_time }: { start_time: number; stop_time: number } = response;
      const eventDetails = { ...response, start_time: start_time * 1000, stop_time: stop_time * 1000 };
      dispatch(updateEventDetailsAction(eventDetails));
      dispatch(addNewEventAction(false));
      dispatch(isEditingEventRangeAction(false));
      dispatch(toggleSimilarShapesAction(false));
    });
  };
}

export function toggleEventModeAction(mode: boolean) {
  return function (dispatch) {
    const action: ToggleEventModeActionType = { type: TOGGLE_EVENT_MODE, isEventModeEnabled: mode };

    dispatch(action);
  };
}

export function updateEventDetailsAction(updatedEventDetails: UpdatedEventDetailsType) {
  return function (dispatch, getState) {
    const isAddingNewEvent: boolean = getIsAddingNewEvents(getState());
    let currentEventDetails: EventDataType = getCurrentEventDetails(getState());
    if (isAddingNewEvent) {
      currentEventDetails = getNewEventDetails(getState());
      return dispatch(updateNewEventDetailsAction(updatedEventDetails));
    }
    const eventDetails = { ...currentEventDetails, ...updatedEventDetails };

    const action: UpdateEventDetailsActionType = {
      type: UPDATE_EVENT_DETAILS,
      eventDetails,
    };
    return dispatch(action);
  };
}

export function isEditingEventRangeAction(eventState: boolean) {
  return function (dispatch) {
    const action: IsEditingEventRangeActionType = {
      type: IS_CHANGING_EVENT_RANGE,
      isEditingEventRange: eventState,
    };
    dispatch(action);
  };
}

export function updateNewEventDetailsAction(eventDetails: UpdatedEventDetailsType) {
  return function (dispatch, getState) {
    const datarun: DatarunDataType = getDatarunDetails(getState());
    const currentEventDetails = getNewEventDetails(getState());
    const eventTemplate = {
      ...currentEventDetails,
      ...eventDetails,
      datarun: datarun.id,
      score: 0,
      tag: (eventDetails.tag && eventDetails.tag) || 'Untagged',
    };

    const action: UpdateNewEventDetailsActionType = { type: NEW_EVENT_DETAILS, newEventDetails: eventTemplate };

    dispatch(action);
  };
}

export function loadEventsFromJsonAction(jsonFiles) {
  return async function (dispatch) {
    // @TODO - implement it when backend is ready
    return dispatch({ type: UPLOAD_JSON_EVENTS, uploadEventsStatus: 'success' });
  };
}

function updateDatarunEvents(events) {
  return function (dispatch, getState) {
    const currentDatarun: DatarunDataType = getDatarunDetails(getState());
    const { id } = currentDatarun;
    const selectedExperimentData = getSelectedExperimentData(getState());

    const datarunIndex: number = selectedExperimentData.data.dataruns.findIndex((dataItem) => dataItem.id === id);
    const action = {
      type: UPDATE_DATARUN_EVENTS,
      newDatarunEvents: events,
      datarunIndex,
    };
    dispatch(action);
  };
}

export function deleteEventAction() {
  return async function (dispatch, getState) {
    const currentEventDetails: EventDataType = getCurrentEventDetails(getState());
    const currentDatarun: DatarunDataType = getDatarunDetails(getState());
    const remainingEvents: EventDataType[] = currentDatarun.events.filter(
      (currentEvent) => currentEvent.id !== currentEventDetails.id,
    );
    await API.events.delete(currentEventDetails.id).then(() => {
      dispatch({ type: SET_ACTIVE_EVENT_ID, activeEventID: null });
      dispatch(updateDatarunEvents(remainingEvents));
    });
  };
}

export function filterEventsByTagAction(tags) {
  return function (dispatch) {
    const action: SetFilterTagsActionType = { type: SET_FILTER_TAGS, filterTags: tags !== null ? tags : [] };
    dispatch(action);
  };
}

function setSpeechStatus(recordState: boolean) {
  return function (dispatch) {
    const action: RecordCommentType = { type: SPEECH_STATUS, isSpeechInProgress: recordState };
    dispatch(action);
  };
}

export function recordCommentAction(recordState: boolean) {
  return function (dispatch, getState) {
    const updatedEventDetails: EventDataType = getUpdatedEventDetails(getState());
    const { commentsDraft } = updatedEventDetails;
    dispatch(setSpeechStatus(recordState));

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.start();
    recognition.onresult = function (event) {
      const current: number = event.resultIndex;
      const { transcript } = event.results[current][0];
      const comments = commentsDraft ? `${commentsDraft} ${transcript}.` : transcript;
      dispatch(updateEventDetailsAction({ commentsDraft: comments }));
      dispatch(setSpeechStatus(false));
    };
  };
}
