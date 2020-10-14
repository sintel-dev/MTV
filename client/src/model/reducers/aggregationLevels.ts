import createReducer from '../store/createReducer';
import { AggregationLevelsState, GetSignalRawAction } from '../types';

const initialState: AggregationLevelsState = {
  isAggregationModalOpen: false,
  aggregationTimeLevel: {
    selectedLevel: '30 hours',
    timeInMiliseconds: 108000000,
  },
  periodLevel: 1,
  isSignalRawLoading: true,
  singalRawData: [],
  eventInterval: [],
  contextValue: 1,
  aggZoomValue: 1,
};

function TOGGLE_AGGREGATION_MODAL(nextState: AggregationLevelsState, { isAggregationModalOpen }) {
  nextState.isAggregationModalOpen = isAggregationModalOpen;
}

function SET_AGGREGATION_TIME_LEVEL(nextState: AggregationLevelsState, { aggregationTimeLevel }) {
  nextState.aggregationTimeLevel = aggregationTimeLevel;
}
function FETCH_SIGNAL_RAW_REQUEST(nextState: AggregationLevelsState) {
  nextState.isSignalRawLoading = true;
}

function FETCH_SIGNAL_RAW_SUCCESS(nextState: AggregationLevelsState, action: GetSignalRawAction) {
  nextState.singalRawData = action.result.data;
  nextState.isSignalRawLoading = false;
}

function FETCH_SIGNAL_RAW_FAILURE(nextState: AggregationLevelsState) {
  nextState.singalRawData = [];
  nextState.isSignalRawLoading = false;
}

function SET_EVENT_INTERVAL(nextState: AggregationLevelsState, { eventInterval }) {
  nextState.eventInterval = eventInterval;
}

function SET_CONTEXT_VALUE(nextState: AggregationLevelsState, { contextValue }) {
  nextState.contextValue = contextValue;
}

function UPDATE_AGGREGATION_ZOOM(nextState: AggregationLevelsState, { zoomValue }) {
  nextState.aggZoomValue = zoomValue;
}

export default createReducer(initialState, {
  TOGGLE_AGGREGATION_MODAL,
  SET_AGGREGATION_TIME_LEVEL,
  FETCH_SIGNAL_RAW_REQUEST,
  FETCH_SIGNAL_RAW_SUCCESS,
  FETCH_SIGNAL_RAW_FAILURE,
  SET_EVENT_INTERVAL,
  SET_CONTEXT_VALUE,
  UPDATE_AGGREGATION_ZOOM,
});
