import { createSelector } from 'reselect';
import { getDatarunDetails } from './datarun';

export const getIsEventLoading = (state) => state.event.isEventDetailsLoading;
export const getEventDetails = (state) => state.event.eventDetails;
export const getIsPopupOpen = (state) => state.event.isPopupOpen;
export const getUpdatedEventStatus = (state) => state.event.eventUpdateStatus;

// @TODO - see why two selectors instead of one
export const getIsEditingEventRange = (state) => state.event.isEditingEventRange;
export const getIsEditingEventRangeDone = (state) => state.event.isEditingEventRangeDone;
// export const getIsAddingNewEvents = (state) => state.event.isAddingEvent;

export const getCurrentEventDetails = createSelector(
  [getDatarunDetails, getIsEventLoading, getEventDetails],
  (dataRun, isEventLoading, currentEventDetails) => {
    if (isEventLoading) {
      return null;
    }

    // console.log(currentEventDetails);
    return { ...currentEventDetails, signal: dataRun.signal };

    const { timeSeries } = dataRun;
    const eventIndex = dataRun.eventWindows.find((windowEvent) => windowEvent[3] === currentEventDetails.id);
    const start_time = timeSeries[eventIndex[0]][0];
    const stop_time = timeSeries[eventIndex[1]][0];
    const startIndex = timeSeries.findIndex((element) => start_time - element[0] < 0) - 1;
    const stopIndex = timeSeries.findIndex((element) => stop_time - element[0] < 0);

    // limit editing within the datarun timeseries range
    if (startIndex === -1 || stopIndex === -1) {
      return null;
    }

    const eventDetails = {
      ...currentEventDetails,
      start_time,
      stop_time,
      signal: dataRun.signal,
    };

    console.log('=======', eventDetails);

    return eventDetails;
  },
);
