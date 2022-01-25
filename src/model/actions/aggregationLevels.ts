import { timeToSeconds } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import {
  TOGGLE_AGGREGATION_MODAL,
  SET_AGGREGATION_TIME_LEVEL,
  FETCH_SIGNAL_RAW,
  SetAggregationLevelAction,
  DatarunDataType,
  AggregationTimeLevel,
  GetSignalRawAction,
  SetAggregationModalState,
  SET_CONTEXT_VALUE,
  SetContextValueAction,
  UPDATE_AGGREGATION_ZOOM,
  ZoomType,
  UpdateAggZoomAction,
} from '../types';
import { getAggregationWrapperCoords, getDatarunDetails } from '../selectors/datarun';
import { getAggregationTimeLevel } from '../selectors/aggregationLevels';
import API from '../utils/api';

export function toggleAggregationModal(currentState: boolean) {
  return function (dispatch) {
    const action: SetAggregationModalState = {
      type: TOGGLE_AGGREGATION_MODAL,
      isAggregationModalOpen: currentState,
    };
    dispatch(action);
    dispatch(setAggregationLevelAction('30 days'));
  };
}

export function setAggregationLevelAction(timeStamp: string) {
  return function (dispatch) {
    const time = timeToSeconds(timeStamp);
    const action: SetAggregationLevelAction = {
      type: SET_AGGREGATION_TIME_LEVEL,
      aggregationTimeLevel: {
        selectedLevel: timeStamp,
        timeToSeconds: time,
      },
    };
    dispatch(action);
    dispatch(getSignalRawDataAction());
  };
}

export function getSignalRawDataAction() {
  return async function (dispatch, getState) {
    const dataRun: DatarunDataType = getDatarunDetails(getState());
    const currentAggregationLevel: AggregationTimeLevel = getAggregationTimeLevel(getState());
    const { wrapperStart, wrapperEnd } = getAggregationWrapperCoords(getState());
    const payload: { signal: string; interval: number; start_time: number; stop_time: number } = {
      signal: dataRun.signal_id,
      interval: currentAggregationLevel.timeToSeconds || timeToSeconds('30 days'),
      start_time: wrapperStart / 1000,
      stop_time: wrapperEnd / 1000,
    };

    const action: GetSignalRawAction = {
      type: FETCH_SIGNAL_RAW,
      promise: API.signalraw.all({}, payload),
    };

    dispatch(action);
  };
}

export function setContextValueAction(contextValue: number) {
  return function (dispatch) {
    const action: SetContextValueAction = {
      type: SET_CONTEXT_VALUE,
      contextValue,
    };
    dispatch(action);
    dispatch(getSignalRawDataAction());
  };
}

export function updateAggregationZoomAction(zoomValue: ZoomType) {
  return function (dispatch) {
    const action: UpdateAggZoomAction = {
      type: UPDATE_AGGREGATION_ZOOM,
      zoomValue,
    };
    dispatch(action);
  };
}
