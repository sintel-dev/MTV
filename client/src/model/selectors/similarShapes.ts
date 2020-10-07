import { createSelector } from 'reselect';

import { getDatarunDetails, getCurrentEventDetails } from './datarun';

export const getIsSimilarShapesActive = (state) => state.similarShapes.isShapesModalOpen;
export const getIsSimilarShapesLoading = (state) => state.similarShapes.isSimilarShapesLoading;
export const similarShapesResults = (state) => state.similarShapes.similarShapes;
export const getActiveShape = (state) => state.similarShapes.activeShape;
export const getCurrentShapeMetrics = (state) => state.similarShapes.shapeMetrics;
export const getCurrentShapesTag = (state) => state.similarShapes.shapesTag;
export const getPercentageInterval = (state) => state.similarShapes.currentPercentage;

export const getSimilarShapesFound = createSelector(
  [getIsSimilarShapesLoading, similarShapesResults, getCurrentEventDetails],
  (isSimilarShapesLoading, similarShapes, currentEvent) => {
    if (isSimilarShapesLoading || currentEvent === null) {
      return null;
    }

    let { start_time, stop_time } = currentEvent;
    start_time /= 1000;
    stop_time /= 1000;

    const filteredShapes = () =>
      similarShapes.filter((currentShape) => currentShape.start !== start_time && currentShape.end !== stop_time);

    const currentShapes = filteredShapes();
    return currentShapes;
  },
);

export const getSimilarShapesCoords = createSelector(
  [getIsSimilarShapesLoading, similarShapesResults, getDatarunDetails, getPercentageInterval],
  (isShapesLoading, similarShapes, dataRun, percentageInterval) => {
    if (isShapesLoading) {
      return [];
    }

    const { timeSeries } = dataRun;
    const filteredShapes = similarShapes.filter((shape) => shape.similarity * 100 >= percentageInterval[0]);

    return filteredShapes.map((currentShape) => {
      const { start, end } = currentShape;
      const startIndex = timeSeries.findIndex((element) => start * 1000 - element[0] < 0) - 1;
      const stopIndex = timeSeries.findIndex((element) => end * 1000 - element[0] < 0);
      return { ...currentShape, start: startIndex, end: stopIndex, source: 'SHAPE_MATCHING' };
    });
  },
);

export const getIsResetSimilarDisabled = createSelector(
  [getSimilarShapesCoords, getCurrentShapesTag],
  (similarShapes, shapesTag) => {
    const isShapeTagSelected =
      similarShapes.length !== 0 &&
      similarShapes.find((shape) => (shape.tag ? shape.tag !== null : false)) !== undefined;
    const isMasterTagSelected = shapesTag !== null;

    return !(isShapeTagSelected || isMasterTagSelected);
  },
);
