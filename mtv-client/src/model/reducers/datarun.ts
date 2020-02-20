import { SelectDatarunAction, SetTimeseriesPeriodAction, DatarunState } from '../types';
import createReducer from '../store/createReducer';

const initialState: DatarunState = {
  selectedDatarunID: '',
  selectedPeriodRange: {
    zoomValue: 1,
    eventRange: [0, 0],
  },
  eventIndex: null,
  isEventCommentsLoading: true,
  eventComments: [],
  isPredictionEnabled: false,
  eventDetails: {},
  isEditingEventRange: false,
  isEditingEventRangeDone: false,
  isPopupOpen: false,
  isAddingEvent: false,
  newEventDetails: {},
  filterTags: [],
  zoomDirection: '',
  zoomCounter: 0,
  zoomMode: true,
  periodLevel: {},
  isPeriodLevelSelected: false,
  reviewPeriod: null,
};

/**
 * update the currently selected datarunID to state
 */
function SELECT_DATARUN(nextState: DatarunState, action: SelectDatarunAction) {
  nextState.selectedDatarunID = action.datarunID;
}

/**
 * set the selectedPeriodRange
 */
function SET_TIMESERIES_PERIOD(nextState: DatarunState, action: SetTimeseriesPeriodAction) {
  nextState.selectedPeriodRange = action.eventRange;
}

function SET_CURRENT_EVENT(nextState, { eventIndex }) {
  nextState.eventIndex = eventIndex;
}

function UPDATE_EVENT_DETAILS(nextState, { eventDetails }) {
  nextState.eventDetails = eventDetails;
}

function GET_EVENT_COMMENTS_SUCCESS(nextState, { eventComments }) {
  nextState.eventComments = eventComments;
  nextState.isEventCommentsLoading = false;
}

function TOGGLE_PREDICTION_MODE(nextState, { isPredictionEnabled }) {
  nextState.isPredictionEnabled = isPredictionEnabled;
}

function IS_CHANGING_EVENT_RANGE(nextState, { isEditingEventRange }) {
  nextState.isEditingEventRange = isEditingEventRange;
}

function IS_UPDATE_POPUP_OPEN(nextState, { isPopupOpen }) {
  nextState.isPopupOpen = isPopupOpen;
}

function ADDING_NEW_EVENTS(nextState, { isAddingEvent }) {
  nextState.isAddingEvent = isAddingEvent;
}

function NEW_EVENT_DETAILS(nextState, { eventDetails }) {
  nextState.isEventCommentsLoading = false;
  nextState.eventDetails = eventDetails;
}

function ADDING_NEW_EVENT_RESULT(nextState, { result }) {
  nextState.addingNewEvent = result;
}

function SET_FILTER_TAGS(nextState, { filterTags }) {
  nextState.filterTags = filterTags;
}

function ZOOM_ON_CLICK(nextState, { zoomDirection, zoomCounter }) {
  nextState.zoomCounter = zoomCounter;
  nextState.zoomDirection = zoomDirection;
}

function TOGGLE_ZOOM(nextState, { zoomMode }) {
  nextState.zoomMode = zoomMode;
}

function SET_CURRENT_PERIOD_LEVEL(nextState, { isPeriodLevelSelected, periodLevel }) {
  nextState.isPeriodLevelSelected = isPeriodLevelSelected;
  nextState.periodLevel = periodLevel;
}
function REVIEW_PERIOD_LEVEL(nextState, { reviewPeriod }) {
  nextState.reviewPeriod = reviewPeriod;
}

export default createReducer<DatarunState>(initialState, {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
  SET_CURRENT_EVENT,
  UPDATE_EVENT_DETAILS,
  TOGGLE_PREDICTION_MODE,
  GET_EVENT_COMMENTS_SUCCESS,
  IS_CHANGING_EVENT_RANGE,
  IS_UPDATE_POPUP_OPEN,
  ADDING_NEW_EVENTS,
  NEW_EVENT_DETAILS,
  ADDING_NEW_EVENT_RESULT,
  SET_FILTER_TAGS,
  ZOOM_ON_CLICK,
  TOGGLE_ZOOM,
  SET_CURRENT_PERIOD_LEVEL,
  REVIEW_PERIOD_LEVEL,
});
