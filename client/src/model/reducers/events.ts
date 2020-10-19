import createReducer from '../store/createReducer';
import { EventState, GetEventCommentsActionType } from '../types';

const initialState: EventState = {
  eventHistory: null,
  isEventHistoryLoading: true,
  activeEventID: null,
  eventDetails: {},
  isEventCommentsLoading: true,
  eventComments: [],
  isEventModeEnabled: true,
  isEditingEventRange: false,
  isEditingEventRangeDone: false,
  isAddingEvent: false,
  newEventDetails: null,
  filterTags: [],
  uploadEventsStatus: null,
  eventUpdateStatus: null,
  isTranscriptSupported: false,
  isSpeechInProgress: false,
};

function FETCH_EVENT_HISTORY_REQUEST(nextState) {
  nextState.isEventHistoryLoading = true;
}

function FETCH_EVENT_HISTORY_SUCCESS(nextState, action) {
  nextState.eventHistory = action.result.records;
  nextState.isEventHistoryLoading = false;
}

function FETCH_EVENT_HISTORY_FAILURE(nextState) {
  nextState.eventHistory = null;
  nextState.isEventHistoryLoading = false;
}

function SET_ACTIVE_EVENT_ID(nextState, { activeEventID }) {
  nextState.activeEventID = activeEventID;
}

function UPDATE_EVENT_DETAILS(nextState, { eventDetails }) {
  nextState.eventDetails = eventDetails;
}

function GET_EVENT_COMMENTS_REQUEST(nextState) {
  nextState.isEventCommentsLoading = true;
}

function GET_EVENT_COMMENTS_SUCCESS(nextState: EventState, action: GetEventCommentsActionType) {
  nextState.eventComments = action.result.comments;
  nextState.isEventCommentsLoading = false;
}

function GET_EVENT_COMMENTS_FAILURE(nextState) {
  nextState.isEventCommentsLoading = false;
  nextState.eventComments = [];
}

function TOGGLE_EVENT_MODE(nextState, { isEventModeEnabled }) {
  nextState.isEventModeEnabled = isEventModeEnabled;
}

function IS_CHANGING_EVENT_RANGE(nextState, { isEditingEventRange }) {
  nextState.isEditingEventRange = isEditingEventRange;
}

function ADDING_NEW_EVENTS(nextState, { isAddingEvent }) {
  nextState.isAddingEvent = isAddingEvent;
}

function NEW_EVENT_DETAILS(nextState, { newEventDetails }) {
  nextState.isEventCommentsLoading = false;
  nextState.newEventDetails = newEventDetails;
}

function ADDING_NEW_EVENT_RESULT(nextState, { result }) {
  nextState.addingNewEvent = result;
}

function SET_FILTER_TAGS(nextState, { filterTags }) {
  nextState.filterTags = filterTags;
}
function UPLOAD_JSON_EVENTS(nextState, { uploadEventsStatus }) {
  nextState.uploadEventsStatus = uploadEventsStatus;
}

function EVENT_UPDATE_STATUS(nextState, { eventUpdateStatus }) {
  nextState.eventUpdateStatus = eventUpdateStatus;
}

function SET_TRANSCRIPT_STATUS(nextState, { isTranscriptSupported }) {
  nextState.isTranscriptSupported = isTranscriptSupported;
}

function SPEECH_STATUS(nextState, { isSpeechInProgress }) {
  nextState.isSpeechInProgress = isSpeechInProgress;
}
export default createReducer(initialState, {
  FETCH_EVENT_HISTORY_REQUEST,
  FETCH_EVENT_HISTORY_SUCCESS,
  FETCH_EVENT_HISTORY_FAILURE,
  SET_ACTIVE_EVENT_ID,
  UPDATE_EVENT_DETAILS,
  GET_EVENT_COMMENTS_REQUEST,
  GET_EVENT_COMMENTS_SUCCESS,
  GET_EVENT_COMMENTS_FAILURE,
  TOGGLE_EVENT_MODE,
  IS_CHANGING_EVENT_RANGE,
  ADDING_NEW_EVENTS,
  NEW_EVENT_DETAILS,
  ADDING_NEW_EVENT_RESULT,
  SET_FILTER_TAGS,
  UPLOAD_JSON_EVENTS,
  EVENT_UPDATE_STATUS,
  SET_TRANSCRIPT_STATUS,
  SPEECH_STATUS,
});
