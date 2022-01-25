export const TOGGLE_AGGREGATION_MODAL = 'TOGGLE_AGGREGATION_MODAL';
export const SET_AGGREGATION_TIME_LEVEL = 'SET_AGGREGATION_TIME_LEVEL';
export const FETCH_SIGNAL_RAW = 'FETCH_SIGNAL_RAW';
export const SET_EVENT_INTERVAL = 'SET_EVENT_INTERVAL';
export const SET_CONTEXT_VALUE = 'SET_CONTEXT_VALUE';
export const UPDATE_AGGREGATION_ZOOM = 'UPDATE_AGGREGATION_ZOOM';

type SignalRawResponse = {
  data: [number, number][];
};

export type ZoomType = {} | { k: number; x: number; y: number } | number | any;

export type AggregationTimeLevel = {
  selectedLevel: string | null;
  timeToSeconds?: number | null;
  timeInMiliseconds?: number | null;
};

export type AggregationLevelsState = {
  isAggregationModalOpen: boolean;
  aggregationTimeLevel: AggregationTimeLevel;
  periodLevel: any;
  isSignalRawLoading: boolean;
  singalRawData: Array<[number, number]>;
  eventInterval: Array<[number, number]>;
  contextValue: number;
  aggZoomValue: ZoomType;
};

export type SetEventIntervalAction = {
  type: typeof SET_EVENT_INTERVAL;
  eventInterval: Array<[number, number]>;
};

export type SetAggregationLevelAction = {
  type: typeof SET_AGGREGATION_TIME_LEVEL;
  aggregationTimeLevel: AggregationTimeLevel;
};

export type GetSignalRawAction = {
  type: typeof FETCH_SIGNAL_RAW;
  promise: Promise<SignalRawResponse>;
  result?: SignalRawResponse;
  error?: string;
};

export type SetAggregationModalState = {
  type: typeof TOGGLE_AGGREGATION_MODAL;
  isAggregationModalOpen: boolean;
};

export type SetContextValueAction = {
  type: typeof SET_CONTEXT_VALUE;
  contextValue: number;
};

export type UpdateAggZoomAction = {
  type: typeof UPDATE_AGGREGATION_ZOOM;
  zoomValue: ZoomType;
};
