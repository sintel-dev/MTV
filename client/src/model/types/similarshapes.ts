import { EventDataType } from './event';

export const TOGGLE_SIMILAR_SHAPES = 'TOGGLE_SIMILAR_SHAPES';
export const FETCH_SIMILAR_SHAPES = 'FETCH_SIMILAR_SHAPES';
export const UPDATE_SIMILAR_SHAPES = 'UPDATE_SIMILAR_SHAPES';
export const SET_ACTIVE_SHAPE = 'SET_ACTIVE_SHAPE';
export const CHANGE_SHAPES_METRICS = 'CHANGE_SHAPES_METRICS';
export const RESET_SIMILAR_SHAPES = 'RESET_SIMILAR_SHAPES';
export const SAVE_SIMILAR_SHAPES = 'SAVE_SIMILAR_SHAPES';
export const UPDATE_SHAPES_TAG = 'UPDATE_SHAPES_TAG';
export const UPDATE_CURRENT_PERCENTAGE = 'UPDATE_CURRENT_PERCENTAGE';

export type ShapesInitialState = {
  isShapesOpen: boolean;
  isSimilarShapesLoading: boolean;
  similarShapes: SimilarShapeType[];
  activeShape: SimilarShapeType | null;
  shapeMetrics: string;
  shapesTag: string | null;
  currentPercentage: [number, number];
};

export type ShapePayloadType = {
  start_time: number;
  stop_time: number;
  score: string;
  tag: string;
  datarun_id: string;
  source: string;
  created_by: string;
};

export type ToggleSimilarShapesActionType = {
  type: typeof TOGGLE_SIMILAR_SHAPES;
  isShapesOpen: boolean;
};

export type SimilarShapeType = {
  start: number;
  end: number;
  similarity: number;
  tag?: string;
  source?: string;
};

export type SimilarShapesResponse = {
  windows: SimilarShapeType[];
};

export type FetchSimilarShapesActionType = {
  type: typeof FETCH_SIMILAR_SHAPES;
  promise: Promise<SimilarShapesResponse>;
  result?: SimilarShapesResponse;
};

export type SaveSimilarShapesActionType = {
  type: typeof SAVE_SIMILAR_SHAPES;
  promise: Promise<EventDataType>;
  result?: EventDataType;
};

export type UpdateTagActionType = {
  type: typeof UPDATE_SHAPES_TAG;
  tag: string | null;
};

export type UpdateShapesActionType = {
  type: typeof UPDATE_SIMILAR_SHAPES;
  shapes: SimilarShapeType[];
};

export type SetActiveShapeActionType = {
  type: typeof SET_ACTIVE_SHAPE;
  activeShape: SimilarShapeType;
};

export type UpdateMetricsActionType = {
  type: typeof CHANGE_SHAPES_METRICS;
  metrics: string;
};

export type UpdatePercentageActionType = {
  type: typeof UPDATE_CURRENT_PERCENTAGE;
  percentageValue: number;
};
