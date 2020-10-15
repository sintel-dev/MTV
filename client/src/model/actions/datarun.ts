import {
  getZoomCounter,
  getSelectedPeriodRange,
  isDatarunIDSelected,
  getSelectedPeriodLevel,
  getIsTimeSyncModeEnabled,
  getScrollHistory,
} from '../selectors/datarun';
import {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
  TOGGLE_PREDICTION_MODE,
  SelectDatarunAction,
  SetTimeseriesPeriodAction,
  ZOOM_ON_CLICK,
  TOGGLE_ZOOM,
  SET_CURRENT_PERIOD_LEVEL,
  TOGGLE_TIME_SYNC_RANGE,
  SET_SCROLL_HISTORY,
  SWITCH_CHART_STYLE,
  TimeSeriesRangeType,
} from '../types';
import { resetSimilarShapesAction } from './similarShapes';
import { addNewEventAction, setActiveEventAction } from './events';

export function selectDatarun(datarunID: string) {
  return function (dispatch, getState) {
    const currentDatarunID: string = isDatarunIDSelected(getState());

    if (currentDatarunID === datarunID) {
      return;
    }
    const action: SelectDatarunAction = {
      type: SELECT_DATARUN,
      datarunID,
    };

    dispatch(action);
    dispatch(addNewEventAction(false));
    dispatch(setActiveEventAction(null));
    dispatch(resetSimilarShapesAction());
  };
}

export function setTimeseriesPeriod(selectedRange: TimeSeriesRangeType) {
  return function (dispatch, getState) {
    const currentRange: TimeSeriesRangeType = getSelectedPeriodRange(getState());

    if (JSON.stringify(selectedRange.eventRange) === JSON.stringify(currentRange.eventRange)) {
      return;
    }

    const action: SetTimeseriesPeriodAction = {
      type: SET_TIMESERIES_PERIOD,
      selectedRange,
    };
    dispatch(action);
  };
}

export function togglePredictionsAction(event) {
  return function (dispatch) {
    dispatch({ type: TOGGLE_PREDICTION_MODE, isPredictionEnabled: event });
  };
}

export function toggleTimeSyncModeAction(syncMode) {
  return function (dispatch, getState) {
    let periodLevel = getSelectedPeriodLevel(getState());
    const scrollHistory = getScrollHistory(getState());
    dispatch({
      type: TOGGLE_TIME_SYNC_RANGE,
      isTimeSyncModeEnabled: syncMode,
    });

    if (!syncMode) {
      if (scrollHistory.level === 'year') {
        dispatch(setReviewPeriodAction(null));
      }
      if (scrollHistory.level === 'month') {
        const { year } = scrollHistory;
        dispatch({
          type: SET_CURRENT_PERIOD_LEVEL,
          periodLevel: {
            year,
            month: null,
            level: 'year',
          },
        });
      }

      if (scrollHistory.level === 'day') {
        const { year, month } = scrollHistory;
        dispatch({
          type: SET_CURRENT_PERIOD_LEVEL,
          periodLevel: {
            year,
            month,
            level: 'month',
          },
        });
      }
    }

    if (syncMode) {
      const { level } = periodLevel;
      if (level === null) {
        dispatch({
          type: SET_SCROLL_HISTORY,
          scrollHistory: {
            ...scrollHistory,
            level: 'year',
          },
        });
      }

      if (level === 'year') {
        dispatch({
          type: SET_SCROLL_HISTORY,
          scrollHistory: {
            ...scrollHistory,
            year: periodLevel.year,
            level: 'month',
          },
        });
      }

      if (level === 'month') {
        dispatch({
          type: SET_SCROLL_HISTORY,
          scrollHistory: {
            year: periodLevel.year,
            month: periodLevel.month,
            level: 'day',
          },
        });
      }
    }
  };
}

export function zoomOnClick(zoomDirection) {
  return function (dispatch, getState) {
    let zoomCounter = getZoomCounter(getState());
    zoomDirection === 'In' ? (zoomCounter += 1) : (zoomCounter -= 1);
    dispatch({ type: ZOOM_ON_CLICK, zoomDirection, zoomCounter });
  };
}

export function zoomToggleAction(zoomMode) {
  return function (dispatch) {
    dispatch({ type: TOGGLE_ZOOM, zoomMode });
  };
}

export function setPeriodRangeAction(periodRange) {
  return function (dispatch) {
    const { level } = periodRange;

    if (level === 'year') {
      const year = periodRange.name;
      dispatch({
        type: SET_CURRENT_PERIOD_LEVEL,
        periodLevel: {
          year,
          month: null,
          level: 'year',
        },
      });
    }

    if (level === 'month') {
      dispatch({
        type: SET_CURRENT_PERIOD_LEVEL,
        periodLevel: {
          year: periodRange.parent.name,
          month: periodRange.name,
          level: 'month',
        },
      });
    }

    if (level === 'day') {
      dispatch({
        type: SET_CURRENT_PERIOD_LEVEL,
        periodLevel: {
          year: periodRange.parent.parent.name,
          month: periodRange.parent.name,
          level: 'day',
        },
      });
    }
  };
}

export function setReviewPeriodAction(level) {
  return function (dispatch, getState) {
    const isTimeSyncModeEnabled = getIsTimeSyncModeEnabled(getState());
    const currentPeriod = isTimeSyncModeEnabled ? getScrollHistory(getState()) : getSelectedPeriodLevel(getState());
    dispatch({
      type: SET_CURRENT_PERIOD_LEVEL,
      periodLevel: {
        ...currentPeriod,
        level,
      },
    });
  };
}

export function setScrollHistoryAction(period) {
  return function (dispatch) {
    dispatch({
      type: SET_SCROLL_HISTORY,
      scrollHistory: period,
    });
  };
}

export function switchChartStyleAction(chartStyle) {
  return function (dispatch) {
    dispatch({
      type: SWITCH_CHART_STYLE,
      chartStyle,
    });
  };
}
