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
  DatarunState,
  ToggleSyncActionType,
  SetPeriodLevelActionType,
  TogglePreditionActionType,
  ClickToZoomActionType,
  ToogleZoomActionType,
  SetScrollHistoryActionType,
  SetChartStyleActionType,
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

export function togglePredictionsAction(mode: boolean) {
  return function (dispatch) {
    const action: TogglePreditionActionType = {
      type: TOGGLE_PREDICTION_MODE,
      isPredictionEnabled: mode,
    };
    dispatch(action);
  };
}

export function toggleTimeSyncModeAction(syncMode: boolean) {
  return function (dispatch, getState) {
    let periodLevel: DatarunState['periodLevel'] = getSelectedPeriodLevel(getState());
    const scrollHistory: DatarunState['scrollHistory'] = getScrollHistory(getState());
    const toggleSyncAction: ToggleSyncActionType = {
      type: TOGGLE_TIME_SYNC_RANGE,
      isTimeSyncModeEnabled: syncMode,
    };

    dispatch(toggleSyncAction);

    if (syncMode) {
      const { level } = periodLevel;
      let currentHistory: DatarunState['scrollHistory'] = {
        year: null,
        month: null,
        level: null,
      };
      switch (level) {
        case 'year':
          currentHistory = { ...scrollHistory, year: periodLevel.year, level: 'month' };
          break;
        case 'month':
          currentHistory = { year: periodLevel.year, month: periodLevel.month, level: 'day' };
          break;
        case null:
          currentHistory = { ...scrollHistory, level: 'year' };
          break;
        default:
          break;
      }

      dispatch(setScrollHistoryAction(currentHistory));
    }

    if (!syncMode) {
      const { level, year, month } = scrollHistory;
      let currentPeriod = periodLevel;
      switch (level) {
        case 'year':
          dispatch(setReviewPeriodAction(null));
          break;
        case 'month':
          currentPeriod = {
            year,
            month: null,
            level: 'year',
          };
          break;
        case 'day':
          periodLevel = {
            year,
            month,
            level: 'month',
          };
          break;
        default:
          break;
      }

      const setPeriodLevelAction: SetPeriodLevelActionType = {
        type: SET_CURRENT_PERIOD_LEVEL,
        periodLevel: currentPeriod,
      };
      dispatch(setPeriodLevelAction);
    }
  };
}

export function zoomOnClick(zoomDirection: string) {
  return function (dispatch, getState) {
    let zoomCounter = getZoomCounter(getState());
    zoomDirection === 'In' ? (zoomCounter += 1) : (zoomCounter -= 1);

    const action: ClickToZoomActionType = {
      type: ZOOM_ON_CLICK,
      zoomDirection,
      zoomCounter,
    };
    dispatch(action);
  };
}

export function zoomToggleAction(zoomMode: boolean) {
  return function (dispatch) {
    const action: ToogleZoomActionType = {
      type: TOGGLE_ZOOM,
      zoomMode,
    };
    dispatch(action);
  };
}

export function setPeriodRangeAction(periodRange: DatarunState['periodRange']) {
  return function (dispatch) {
    const { level, name } = periodRange;
    const year = name;
    let periodData: DatarunState['periodLevel'] = {
      year: null,
      month: null,
      level: null,
    };

    switch (level) {
      case 'year':
        periodData = { year, month: null, level: 'year' };
        break;
      case 'month':
        periodData = {
          year: periodRange.parent.name,
          month: periodRange.name,
          level: 'month',
        };
        break;
      case 'day':
        periodData = {
          year: periodRange.parent.parent.name,
          month: periodRange.parent.name,
          level: 'day',
        };
        break;
      default:
        break;
    }

    const action: SetPeriodLevelActionType = {
      type: SET_CURRENT_PERIOD_LEVEL,
      periodLevel: periodData,
    };

    dispatch(action);
  };
}

export function setReviewPeriodAction(level: string | null) {
  return function (dispatch, getState) {
    const isTimeSyncModeEnabled: boolean = getIsTimeSyncModeEnabled(getState());
    const currentPeriod: DatarunState['periodLevel'] = isTimeSyncModeEnabled
      ? getScrollHistory(getState())
      : getSelectedPeriodLevel(getState());
    const action: SetPeriodLevelActionType = {
      type: SET_CURRENT_PERIOD_LEVEL,
      periodLevel: {
        ...currentPeriod,
        level,
      },
    };
    dispatch(action);
  };
}

export function setScrollHistoryAction(period: DatarunState['scrollHistory']) {
  return function (dispatch) {
    const action: SetScrollHistoryActionType = {
      type: SET_SCROLL_HISTORY,
      scrollHistory: period,
    };
    dispatch(action);
  };
}

export function switchChartStyleAction(chartStyle: string) {
  return function (dispatch) {
    const action: SetChartStyleActionType = {
      type: SWITCH_CHART_STYLE,
      chartStyle,
    };
    dispatch(action);
  };
}
