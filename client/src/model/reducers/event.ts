import createReducer from '../store/createReducer';
import { EventDataState } from '../types';

const initialState: EventDataState = {
  isEventDetailsLoading: true,
  eventDetails: [],
  isEditingEventRange: false,
  isSaveEventLoading: true,
  eventUpdateStatus: null,
  isEventDeletedSuccess: null,
};

function FETCH_EVENT_DATA_REQUEST(nextState) {
  nextState.isEventDetailsLoading = true;
}

function FETCH_EVENT_DATA_SUCCESS(nextState, action) {
  const { start_time, stop_time } = action.result;

  nextState.eventDetails = {
    ...action.result,
    start_time: start_time * 1000,
    stop_time: stop_time * 1000,
  };

  nextState.isEventDetailsLoading = false;
}

function FETCH_EVENT_DATA_FAILURE(nextState) {
  nextState.isEventDetailsLoading = false;
  nextState.eventDetails = {};
}

function IS_UPDATE_POPUP_OPEN(nextState, { isPopupOpen }) {
  nextState.isPopupOpen = isPopupOpen;
}

function IS_CHANGING_EVENT_RANGE(nextState, { isEditingEventRange }) {
  nextState.isEditingEventRange = isEditingEventRange;
}

function UPDATE_EVENT_DETAILS(nextState, { eventDetails }) {
  nextState.eventDetails = eventDetails;
}

function SAVE_EVENT_REQUEST(nextState) {
  nextState.isSaveEventLoading = true;
}

function SAVE_EVENT_SUCCESS(nextState, action) {
  if (action.result) {
    const eventDetails = action.result;
    const { start_time, stop_time } = eventDetails;

    nextState.eventDetails = {
      ...eventDetails,
      start_time: start_time * 1000,
      stop_time: stop_time * 1000,
    };

    nextState.isSaveEventLoading = false;
  }
}

function SAVE_EVENT_FAILURE(nextState) {
  nextState.eventDetails = {};
  nextState.isSaveEventLoading = false;
}

function UPDATE_EVENT_STATUS(nextState, { eventUpdateStatus }) {
  nextState.eventUpdateStatus = eventUpdateStatus;
}

function DELETE_EVENT_SUCCESS(nextState) {
  nextState.isEventDeletedSuccess = true;
}

function DELETE_EVENT_FAILURE(nextState) {
  nextState.isEventDeletedSuccess = false;
}

export default createReducer(initialState, {
  FETCH_EVENT_DATA_REQUEST,
  FETCH_EVENT_DATA_SUCCESS,
  FETCH_EVENT_DATA_FAILURE,
  IS_UPDATE_POPUP_OPEN,
  IS_CHANGING_EVENT_RANGE,
  UPDATE_EVENT_DETAILS,

  SAVE_EVENT_REQUEST,
  SAVE_EVENT_SUCCESS,
  SAVE_EVENT_FAILURE,
  UPDATE_EVENT_STATUS,

  DELETE_EVENT_SUCCESS,
  DELETE_EVENT_FAILURE,
});
