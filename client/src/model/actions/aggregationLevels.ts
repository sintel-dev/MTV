import { timeToSeconds } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import {
  TOGGLE_AGGREGATION_MODAL,
  SET_AGGREGATION_TIME_LEVEL,
  FETCH_SIGNAL_RAW,
  SET_EVENT_INTERVAL,
  SetAggregationLevelAction,
  DatarunDataType,
  EventDataType,
  AggregationTimeLevel,
  SetEventIntervalAction,
  GetSignalRawAction,
  SetAggregationModalState,
  SET_CONTEXT_VALUE,
  SetContextValueAction,
  UPDATE_AGGREGATION_ZOOM,
  ZoomType,
  UpdateAggZoomAction,
} from '../types';
import { getCurrentEventDetails, getDatarunDetails } from '../selectors/datarun';
import { getAggregationTimeLevel, getContextInfoValue } from '../selectors/aggregationLevels';
import API from '../utils/api';

export function toggleAggregationModal(currentState: boolean) {
  return function (dispatch) {
    const action: SetAggregationModalState = {
      type: TOGGLE_AGGREGATION_MODAL,
      isAggregationModalOpen: currentState,
    };
    dispatch(action);
    dispatch(setAggregationLevelAction('30 hours'));
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
    const contextInfo: number = getContextInfoValue(getState());

    const { timeSeries } = dataRun;
    const currentEventDetails: EventDataType = getCurrentEventDetails(getState());
    const currentAggregationLevel: AggregationTimeLevel = getAggregationTimeLevel(getState());
    const { start_time, stop_time }: { start_time: number; stop_time: number } = currentEventDetails;

    const eventInterval: Array<[number, number]> = timeSeries.filter(
      (current) => current[0] >= start_time && current[0] <= stop_time,
    );

    const startIndex: number =
      timeSeries.findIndex((element) => start_time - element[0] < 0) - 1 - eventInterval.length * contextInfo;
    const stopIndex: number =
      timeSeries.findIndex((element) => stop_time - element[0] < 0) + eventInterval.length * contextInfo;

    const eventWrapper: Array<[number, number]> = timeSeries.slice(
      Math.max(startIndex, 0),
      stopIndex > -1 ? stopIndex : timeSeries.length - 1,
    );

    const startTime: number = eventWrapper[0][0] / 1000;
    const stopTime: number = eventWrapper[eventWrapper.length - 1][0] / 1000;
    const setIntervalAction: SetEventIntervalAction = {
      type: SET_EVENT_INTERVAL,
      eventInterval,
    };
    dispatch(setIntervalAction);

    const payload: { signal: string; interval: number; start_time: number; stop_time: number } = {
      signal: dataRun.signal_id,
      interval: currentAggregationLevel.timeToSeconds || timeToSeconds('30 hours'),
      start_time: startTime,
      stop_time: stopTime,
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
