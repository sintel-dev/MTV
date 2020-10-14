import { createSelector } from 'reselect';
import { RootState } from '../types';

const getCurrentEventInterval = (state: RootState) => state.aggregationLevels.eventInterval;
export const getIsAggregationModalOpen = (state: RootState) => state.aggregationLevels.isAggregationModalOpen;
export const getAggregationTimeLevel = (state: RootState) => state.aggregationLevels.aggregationTimeLevel;
export const getIsSigRawLoading = (state: RootState) => state.aggregationLevels.isSignalRawLoading;
export const getCurrentSignalRawData = (state: RootState) => state.aggregationLevels.singalRawData;
export const getContextInfoValue = (state: RootState) => state.aggregationLevels.contextValue;
export const getAggregationZoomValue = (state: RootState) => state.aggregationLevels.aggZoomValue;

export const getSignalRawData = createSelector(
  [getIsSigRawLoading, getCurrentSignalRawData],
  (isSignalRawLoading, currentSignalRaw) => {
    if (isSignalRawLoading) {
      return null;
    }

    const timeStampConverted = [];

    currentSignalRaw.forEach((current) => {
      const start_time: number = current[0] * 1000;
      timeStampConverted.push([start_time, current[1]]);
    });
    return timeStampConverted;
  },
);

// get the event interval out of signalRaw data granulation
export const getEventInterval = createSelector(
  [getSignalRawData, getCurrentEventInterval, getIsSigRawLoading],
  (signalRawData, eventInterval, isSignalRawLoading) => {
    if (isSignalRawLoading) {
      return null;
    }
    return signalRawData.filter(
      (current) => current[0] >= eventInterval[0][0] && current[0] <= eventInterval[eventInterval.length - 1][0],
    );
  },
);
