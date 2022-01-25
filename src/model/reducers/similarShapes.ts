import createReducer from '../store/createReducer';
import {
  FetchSimilarShapesActionType,
  SetActiveShapeActionType,
  ShapesInitialState,
  ToggleSimilarShapesActionType,
  UpdateMetricsActionType,
  UpdatePercentageActionType,
  UpdateShapesActionType,
  UpdateTagActionType,
} from '../types';

const initialState: ShapesInitialState = {
  isShapesOpen: false,
  isSimilarShapesLoading: false,
  similarShapes: [],
  activeShape: null,
  shapeMetrics: 'euclidean',
  shapesTag: null,
  currentPercentage: [0, 100],
};

function TOGGLE_SIMILAR_SHAPES(nextState: ShapesInitialState, action: ToggleSimilarShapesActionType) {
  nextState.isShapesOpen = action.isShapesOpen;
}

function FETCH_SIMILAR_SHAPES_REQUEST(nextState: ShapesInitialState) {
  nextState.isSimilarShapesLoading = true;
}

function FETCH_SIMILAR_SHAPES_SUCCESS(nextState: ShapesInitialState, action: FetchSimilarShapesActionType) {
  nextState.isSimilarShapesLoading = false;
  nextState.similarShapes = action.result.windows;
}

function FETCH_SIMILAR_SHAPES_FAILURE(nextState: ShapesInitialState) {
  nextState.isSimilarShapesLoading = false;
  nextState.similarShapes = [];
}

function RESET_SIMILAR_SHAPES(nextState: ShapesInitialState) {
  nextState.similarShapes = [];
}

function UPDATE_SIMILAR_SHAPES(nextState: ShapesInitialState, action: UpdateShapesActionType) {
  nextState.similarShapes = action.shapes;
}

function SET_ACTIVE_SHAPE(nextState: ShapesInitialState, action: SetActiveShapeActionType) {
  nextState.activeShape = action.activeShape;
}

function CHANGE_SHAPES_METRICS(nextState: ShapesInitialState, action: UpdateMetricsActionType) {
  nextState.shapeMetrics = action.metrics;
}

function UPDATE_SHAPES_TAG(nextState: ShapesInitialState, action: UpdateTagActionType) {
  nextState.shapesTag = action.tag;
}

function UPDATE_CURRENT_PERCENTAGE(nextState: ShapesInitialState, action: UpdatePercentageActionType) {
  nextState.currentPercentage[0] = action.percentageValue;
}

export default createReducer<ShapesInitialState>(initialState, {
  TOGGLE_SIMILAR_SHAPES,
  FETCH_SIMILAR_SHAPES_SUCCESS,
  FETCH_SIMILAR_SHAPES_REQUEST,
  FETCH_SIMILAR_SHAPES_FAILURE,
  RESET_SIMILAR_SHAPES,
  UPDATE_SIMILAR_SHAPES,
  SET_ACTIVE_SHAPE,
  CHANGE_SHAPES_METRICS,
  UPDATE_SHAPES_TAG,
  UPDATE_CURRENT_PERCENTAGE,
});
