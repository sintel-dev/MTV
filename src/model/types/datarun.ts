import { ZoomType } from './aggregation';
import { EventDataType } from './event';

export const SELECT_DATARUN = 'SELECT_DATARUN';
export const SET_TIMESERIES_PERIOD = 'SET_TIMESERIES_PERIOD';
export const TOGGLE_PREDICTION_MODE = 'TOGGLE_PREDICTION_MODE';
export const UPDATE_DATARUN_EVENTS = 'UPDATE_DATARUN_EVENTS';
export const ZOOM_ON_CLICK = 'ZOOM_ON_CLICK';
export const TOGGLE_ZOOM = 'TOGGLE_ZOOM';
export const SET_CURRENT_PERIOD_LEVEL = 'SET_CURRENT_PERIOD_LEVEL';
export const TOGGLE_TIME_SYNC_RANGE = 'TOGGLE_TIME_SYNC_RANGE';
export const SET_SCROLL_HISTORY = 'SET_SCROLL_HISTORY';
export const SWITCH_CHART_STYLE = 'SWITCH_CHART_STYLE';

/**
 * Datarun State format
 */
export type DatarunState = {
  selectedDatarunID: string;
  selectedPeriodRange: TimeSeriesRangeType;
  isPredictionEnabled: boolean;
  zoomDirection: string;
  zoomCounter: number;
  zoomMode: boolean;
  periodLevel: {
    year: number | null | string;
    month: string | null | number;
    day?: string | null;
    level: string | null;
  };
  isTimeSyncModeEnabled: boolean;
  scrollHistory: {
    year: null | string | number;
    month: null | string | number;
    level: string | null;
  };
  chartStyle: string;
  periodRange?: {
    // circular data
    bins: Array<number>;
    children: Array<{
      level: string;
      name: string;
      counts: Array<number>;
      children?: Array<{
        bins: Array<number>;
        name: number;
        counts: Array<number>;
        children: any;
      }>;
    }>;
    level: string;
    name: number;
    parent?: any;
  };
};

export type EventWindowsType = Array<[number, number, number, string, string | null]>;

/**
 * The single datarun item fetched from server with RESTAPI
 * API: find | delete | create | update
 */
export type DatarunDataType = {
  id: string;
  signal: string;
  experiment: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  events?: EventDataType[];
  prediction?: {
    names: string[];
    data: number[][];
  };
  raw?: {
    year: number;
    timestamp: number;
    data: { means: number[]; counts: number[] }[][];
  }[];
  eventWindows?: EventWindowsType;
  timeSeries?: Array<[number, number]>;
  maxTimeSeries?: Array<[number, number]>;
  signal_id: string;
};

/**
 * The array of datarun items fetched from server with RESTAPI
 * API: all
 */
export type DatarunsResponse = {
  dataruns: DatarunDataType[];
};

export type SelectDatarunAction = {
  type: typeof SELECT_DATARUN;
  datarunID: string;
};

export type TimeSeriesRangeType = {
  eventRange: Array<number>;
  zoomValue: ZoomType;
  timeStamp: Array<number>;
};

export type SetTimeseriesPeriodAction = {
  type: typeof SET_TIMESERIES_PERIOD;
  selectedRange: TimeSeriesRangeType;
};

export type ToggleSyncActionType = {
  type: typeof TOGGLE_TIME_SYNC_RANGE;
  isTimeSyncModeEnabled: boolean;
};

export type SetPeriodLevelActionType = {
  type: typeof SET_CURRENT_PERIOD_LEVEL;
  periodLevel: DatarunState['periodLevel'];
};

export type TogglePreditionActionType = {
  type: typeof TOGGLE_PREDICTION_MODE;
  isPredictionEnabled: boolean;
};

export type ClickToZoomActionType = {
  type: typeof ZOOM_ON_CLICK;
  zoomDirection: string;
  zoomCounter: number;
};

export type ToogleZoomActionType = {
  type: typeof TOGGLE_ZOOM;
  zoomMode: boolean;
};

export type SetScrollHistoryActionType = {
  type: typeof SET_SCROLL_HISTORY;
  scrollHistory: DatarunState['periodLevel'];
};

export type SetChartStyleActionType = {
  type: typeof SWITCH_CHART_STYLE;
  chartStyle: string;
};

export type UpdateEventsActionType = {
  type: typeof UPDATE_DATARUN_EVENTS;
  newDatarunEvents: EventDataType[];
  datarunIndex: number;
};
