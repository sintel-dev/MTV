import Cookies from 'js-cookie';
import {
  TOGGLE_SIMILAR_SHAPES,
  UPDATE_DATARUN_EVENTS,
  UPDATE_SIMILAR_SHAPES,
  SET_ACTIVE_SHAPE,
  CHANGE_SHAPES_METRICS,
  FETCH_SIMILAR_SHAPES,
  UPDATE_CURRENT_PERCENTAGE,
  UPDATE_SHAPES_TAG,
  RESET_SIMILAR_SHAPES,
  SAVE_SIMILAR_SHAPES,
  ToggleSimilarShapesActionType,
  EventDataType,
  FetchSimilarShapesActionType,
  SimilarShapeType,
  DatarunDataType,
  ShapePayloadType,
  UpdateEventsActionType,
  SaveSimilarShapesActionType,
  UpdateTagActionType,
  UpdateShapesActionType,
  SetActiveShapeActionType,
  UpdateMetricsActionType,
  UpdatePercentageActionType,
} from '../types';
import { getDatarunDetails, getCurrentEventDetails } from '../selectors/datarun';
import API from '../utils/api';
import {
  getSimilarShapesCoords,
  getSimilarShapesFound,
  getActiveShape,
  getCurrentShapeMetrics,
  similarShapesResults,
  getPercentageInterval,
  getIsSimilarShapesActive,
} from '../selectors/similarShapes';
import { getSelectedExperimentData } from '../selectors/experiment';
import { AUTH_USER_DATA } from '../utils/constants';
import { setActiveEventAction } from './events';

export function toggleSimilarShapesAction(state: boolean) {
  return async function (dispatch) {
    const action: ToggleSimilarShapesActionType = {
      type: TOGGLE_SIMILAR_SHAPES,
      isShapesOpen: state,
    };
    dispatch(action);
  };
}

export function getSimilarShapesAction() {
  return async function (dispatch, getState) {
    const eventDetails: EventDataType = getCurrentEventDetails(getState());
    const shapeMetric: string = getCurrentShapeMetrics(getState());
    let { datarun, start_time, stop_time } = eventDetails;
    start_time /= 1000;
    stop_time /= 1000;

    const getMinpercentage = (shapesList: SimilarShapeType[]) => {
      let minPercent = 0;

      shapesList.forEach((shape: SimilarShapeType) => {
        const { similarity } = shape;
        minPercent = similarity * 100 < 100 ? similarity : minPercent;
      });

      minPercent *= 100;

      minPercent = Math.ceil(Math.ceil(minPercent / 5) * 5) - 5;

      dispatch(updateCurrentPercentage(minPercent));
    };

    const action: FetchSimilarShapesActionType = {
      type: FETCH_SIMILAR_SHAPES,
      promise: API.similar_windows.all(
        {},
        { start: start_time, end: stop_time, datarun_id: datarun, metric: shapeMetric },
      ),
    };
    dispatch(action);
    await action.promise.then((shapesData) => {
      const currentShapes = shapesData.windows;
      getMinpercentage(currentShapes.length > 5 ? currentShapes.slice(0, 5) : currentShapes);
      dispatch(toggleSimilarShapesAction(true));
    });
  };
}

export function resetSimilarShapesAction() {
  return function (dispatch, getState) {
    const isSimilarShapesActive: boolean = getIsSimilarShapesActive(getState());
    if (!isSimilarShapesActive) {
      return;
    }

    const currentShapes: SimilarShapeType[] = getSimilarShapesCoords(getState());
    if (currentShapes.length !== 0) {
      dispatch({ type: RESET_SIMILAR_SHAPES });
    }

    dispatch(toggleSimilarShapesAction(false));
    dispatch(setActiveEventAction(null));
  };
}

function saveNewShape(currentShape: SimilarShapeType) {
  return async function (dispatch, getState) {
    const dataRun: DatarunDataType = getDatarunDetails(getState());
    const { timeSeries } = dataRun;
    const { start, end } = currentShape;
    const userData = JSON.parse(Cookies.get(AUTH_USER_DATA));

    const shapePayload: ShapePayloadType = {
      start_time: timeSeries[start][0] / 1000,
      stop_time: timeSeries[end][0] / 1000,
      score: '0.00', // @TODO - add this data
      tag: currentShape.tag || 'Untagged',
      datarun_id: dataRun.id,
      source: 'SHAPE_MATCHING',
      created_by: userData.name,
    };

    const saveShapes: SaveSimilarShapesActionType = {
      type: SAVE_SIMILAR_SHAPES,
      promise: API.events.create(shapePayload),
    };
    return dispatch(saveShapes);
  };
}

export function saveSimilarShapesAction() {
  return async function (dispatch, getState) {
    // @TODO - backend should provide a single endpoint, single API call instead of similarShapes.length
    const currentShapes: SimilarShapeType[] = getSimilarShapesCoords(getState());
    const [minPercentage]: [number, number] = getPercentageInterval(getState());

    currentShapes.filter((shape) => shape.similarity >= minPercentage);

    const dataRun: DatarunDataType = getDatarunDetails(getState());
    const selectedExperimentData = getSelectedExperimentData(getState());
    const datarunIndex: number = selectedExperimentData.data.dataruns.findIndex(
      (dataItem) => dataItem.id === dataRun.id,
    );

    await currentShapes.forEach((currentShape: SimilarShapeType) =>
      dispatch(saveNewShape(currentShape)).then(async () => {
        await API.events.all(dataRun.id).then((newEvents) => {
          const newDatarunEvents: EventDataType[] = newEvents.events.filter(
            (currentEvent) => currentEvent.datarun === dataRun.id,
          );

          const action: UpdateEventsActionType = {
            type: UPDATE_DATARUN_EVENTS,
            newDatarunEvents,
            datarunIndex,
          };

          dispatch(action);
        });
      }),
    );

    dispatch(resetSimilarShapesAction());
    dispatch(toggleSimilarShapesAction(false));
  };
}

export function shapesTagsOverrideAction(tag: string) {
  return function (dispatch, getState) {
    const currentShapes: SimilarShapeType[] = getSimilarShapesFound(getState());
    const updatedShapes: SimilarShapeType[] = currentShapes.map((current: SimilarShapeType) => ({ ...current, tag }));

    const updateTagAction: UpdateTagActionType = {
      type: UPDATE_SHAPES_TAG,
      tag,
    };

    const updateShapesAction: UpdateShapesActionType = {
      type: UPDATE_SIMILAR_SHAPES,
      shapes: updatedShapes,
    };

    dispatch(updateTagAction);
    dispatch(updateShapesAction);
  };
}

export function setActiveShapeAction(activeShape: SimilarShapeType) {
  return function (dispatch) {
    const setActiveShape: SetActiveShapeActionType = {
      type: SET_ACTIVE_SHAPE,
      activeShape,
    };

    dispatch(setActiveShape);
  };
}

export function changeActiveShapeTagAction(tag: string) {
  return function (dispatch, getState) {
    const currentShapes: SimilarShapeType[] = getSimilarShapesFound(getState());
    const activeShape: SimilarShapeType = { ...getActiveShape(getState()), tag };
    const { start, end }: { start: number; end: number } = activeShape;
    const dataRun: DatarunDataType = getDatarunDetails(getState());
    const { timeSeries } = dataRun;
    const updatedShape: SimilarShapeType = {
      ...activeShape,
      start: timeSeries[start][0] / 1000,
      end: timeSeries[end][0] / 1000,
      tag,
    };
    const shapeIndex: number = currentShapes.findIndex((current) => current.similarity === activeShape.similarity);

    currentShapes[shapeIndex] = updatedShape;

    const updateShapeAction: UpdateShapesActionType = {
      type: UPDATE_SIMILAR_SHAPES,
      shapes: currentShapes,
    };

    dispatch(updateShapeAction);
  };
}

export function resetShapesTagsAction() {
  return function (dispatch, getState) {
    const currentShapes: SimilarShapeType[] = getSimilarShapesFound(getState());
    const updatedShapes: SimilarShapeType[] = currentShapes.map((shape) => ({ ...shape, tag: null }));
    const resetTagAction: UpdateTagActionType = {
      type: UPDATE_SHAPES_TAG,
      tag: null,
    };

    const updateShapesAction: UpdateShapesActionType = {
      type: UPDATE_SIMILAR_SHAPES,
      shapes: updatedShapes,
    };

    dispatch(resetTagAction);
    dispatch(updateShapesAction);
  };
}

export function changeMetricsAction(metrics: string) {
  return function (dispatch) {
    const updateMetricsAction: UpdateMetricsActionType = { type: CHANGE_SHAPES_METRICS, metrics };

    dispatch(updateMetricsAction);
  };
}

export function deleteShapeAction() {
  return function (dispatch, getState) {
    let similarShapes: SimilarShapeType[] = [...similarShapesResults(getState())];
    const activeShape: SimilarShapeType = getActiveShape(getState());
    const shapeIndex: number = similarShapes.findIndex(
      (current: SimilarShapeType) => current.similarity === activeShape.similarity,
    );

    similarShapes.splice(shapeIndex, 1);
    const updateShapeAction: UpdateShapesActionType = {
      type: UPDATE_SIMILAR_SHAPES,
      shapes: similarShapes,
    };
    dispatch(updateShapeAction);
  };
}

export function updateCurrentPercentage(newPercentage: number) {
  return function (dispatch) {
    const action: UpdatePercentageActionType = {
      type: UPDATE_CURRENT_PERCENTAGE,
      percentageValue: newPercentage,
    };

    dispatch(action);
  };
}
