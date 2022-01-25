import { SelectDatarunAction, SetTimeseriesPeriodAction, DatarunState } from '../types';
import createReducer from '../store/createReducer';

const initialState: DatarunState = {
  selectedDatarunID: '',
  selectedPeriodRange: {
    zoomValue: 1,
    eventRange: [0, 0],
    timeStamp: [0, 0],
  },
  isPredictionEnabled: false,
  zoomDirection: '',
  zoomCounter: 0,
  zoomMode: true,
  periodLevel: {
    year: null,
    month: null,
    day: null,
    level: null,
  },
  isTimeSyncModeEnabled: true,
  scrollHistory: {
    year: null,
    month: null,
    level: 'year',
  },
  chartStyle: 'linear',
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
  nextState.selectedPeriodRange = action.selectedRange;
}

function TOGGLE_PREDICTION_MODE(nextState, { isPredictionEnabled }) {
  nextState.isPredictionEnabled = isPredictionEnabled;
}

function ZOOM_ON_CLICK(nextState, { zoomDirection, zoomCounter }) {
  nextState.zoomCounter = zoomCounter;
  nextState.zoomDirection = zoomDirection;
}

function TOGGLE_ZOOM(nextState, { zoomMode }) {
  nextState.zoomMode = zoomMode;
}

function TOGGLE_TIME_SYNC_RANGE(nextState, { isTimeSyncModeEnabled }) {
  nextState.isTimeSyncModeEnabled = isTimeSyncModeEnabled;
}

function SET_CURRENT_PERIOD_LEVEL(nextState, { periodLevel }) {
  nextState.periodLevel = periodLevel;
}

function SET_SCROLL_HISTORY(nextState, { scrollHistory }) {
  nextState.scrollHistory = scrollHistory;
}

function SWITCH_CHART_STYLE(nextState, { chartStyle }) {
  nextState.chartStyle = chartStyle;
}

export default createReducer<DatarunState>(initialState, {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
  TOGGLE_PREDICTION_MODE,
  ZOOM_ON_CLICK,
  TOGGLE_ZOOM,
  SET_CURRENT_PERIOD_LEVEL,
  TOGGLE_TIME_SYNC_RANGE,
  SET_SCROLL_HISTORY,
  SWITCH_CHART_STYLE,
});
