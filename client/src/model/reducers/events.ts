import createReducer from '../store/createReducer';
import {
  EventState,
  FetchEventHistoryActionType,
  GetEventCommentsActionType,
  IsEditingEventRangeActionType,
  SetEventIDActionType,
  UpdateEventDetailsActionType,
  ToggleEventModeActionType,
  AddNewEventActionType,
  UpdateNewEventDetailsActionType,
  AddNewEventResultActionType,
  SetFilterTagsActionType,
  SetEventStatusActionType,
  SetTranscriptStatusActionType,
} from '../types';

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
  addingNewEvent: '',
};

function FETCH_EVENT_HISTORY_REQUEST(nextState: EventState) {
  nextState.isEventHistoryLoading = true;
}

function FETCH_EVENT_HISTORY_SUCCESS(nextState: EventState, action: FetchEventHistoryActionType) {
  nextState.eventHistory = action.result.records;
  nextState.isEventHistoryLoading = false;
}

function FETCH_EVENT_HISTORY_FAILURE(nextState: EventState) {
  nextState.eventHistory = null;
  nextState.isEventHistoryLoading = false;
}

function SET_ACTIVE_EVENT_ID(nextState: EventState, action: SetEventIDActionType) {
  nextState.activeEventID = action.activeEventID;
}

function UPDATE_EVENT_DETAILS(nextState: EventState, action: UpdateEventDetailsActionType) {
  nextState.eventDetails = action.eventDetails;
}

function GET_EVENT_COMMENTS_REQUEST(nextState: EventState) {
  nextState.isEventCommentsLoading = true;
}

function GET_EVENT_COMMENTS_SUCCESS(nextState: EventState, action: GetEventCommentsActionType) {
  nextState.eventComments = action.result.comments;
  nextState.isEventCommentsLoading = false;
}

function GET_EVENT_COMMENTS_FAILURE(nextState: EventState) {
  nextState.isEventCommentsLoading = false;
  nextState.eventComments = [];
}

function TOGGLE_EVENT_MODE(nextState: EventState, action: ToggleEventModeActionType) {
  nextState.isEventModeEnabled = action.isEventModeEnabled;
}

function IS_CHANGING_EVENT_RANGE(nextState: EventState, action: IsEditingEventRangeActionType) {
  nextState.isEditingEventRange = action.isEditingEventRange;
}

function ADDING_NEW_EVENTS(nextState: EventState, action: AddNewEventActionType) {
  nextState.isAddingEvent = action.isAddingEvent;
}

function NEW_EVENT_DETAILS(nextState: EventState, action: UpdateNewEventDetailsActionType) {
  nextState.isEventCommentsLoading = false;
  nextState.newEventDetails = action.newEventDetails;
}

function ADDING_NEW_EVENT_RESULT(nextState: EventState, action: AddNewEventResultActionType) {
  nextState.addingNewEvent = action.result;
}

function SET_FILTER_TAGS(nextState: EventState, action: SetFilterTagsActionType) {
  nextState.filterTags = action.filterTags;
}

// yet to be implemented
function UPLOAD_JSON_EVENTS(nextState: EventState, { uploadEventsStatus }) {
  nextState.uploadEventsStatus = uploadEventsStatus;
}

function EVENT_UPDATE_STATUS(nextState: EventState, action: SetEventStatusActionType) {
  nextState.eventUpdateStatus = action.eventUpdateStatus;
}

function SET_TRANSCRIPT_STATUS(nextState: EventState, action: SetTranscriptStatusActionType) {
  nextState.isTranscriptSupported = action.isTranscriptSupported;
}

function SPEECH_STATUS(nextState: EventState, { isSpeechInProgress }) {
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
