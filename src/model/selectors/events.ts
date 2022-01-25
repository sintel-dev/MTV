import { createSelector } from 'reselect';
import { RootState } from '../types';

// selectors related to event should be moved here (datarun.ts currently)
export const getEventComments = (state: RootState) => state.events.eventComments;
export const getIsEventHistoryLoading = (state: RootState) => state.events.isEventHistoryLoading;
export const isEventCommentsLoading = (state: RootState) => state.events.isEventCommentsLoading;
export const getCurrentEventHistory = (state: RootState) => state.events.eventHistory;
export const getActiveEventID = (state: RootState) => state.events.activeEventID;

// will follow (eventDetails, newEventDetails)
export const getUpdatedEventDetails = (state) => state.events.eventDetails;
export const getNewEventDetails = (state) => state.events.newEventDetails;
export const getIsEditingEventRange = (state: RootState) => state.events.isEditingEventRange;
export const getIsAddingNewEvents = (state: RootState) => state.events.isAddingEvent;
export const getIsEventModeEnabled = (state: RootState) => state.events.isEventModeEnabled;
export const getUploadEventsStatus = (state: RootState) => state.events.uploadEventsStatus;
export const getEventFilterTags = (state: RootState) => state.events.filterTags;
export const getUpdateEventStatus = (state: RootState) => state.events.eventUpdateStatus;
export const getIsTranscriptSupported = (state: RootState) => state.events.isTranscriptSupported;
export const getIsSpeechInProgress = (state: RootState) => state.events.isSpeechInProgress;

export const getIsEventDataLoading = createSelector(
  [isEventCommentsLoading, getIsEventHistoryLoading],
  (isCommentsLoading, isHistoryLoading) => isCommentsLoading || isHistoryLoading,
);

export const getEventSortedHistory = createSelector(
  [getCurrentEventHistory, getEventComments, getIsEventDataLoading],
  (eventHistory, eventComments, isEventDataLoading) => {
    if (isEventDataLoading) {
      return null;
    }

    const eventData = [];
    eventComments && eventData.push(...eventComments);
    eventHistory && eventData.push(...eventHistory);
    const stringToTimestamp = (string) => new Date(string).getTime();
    const sortedHistory = eventData.sort(
      (prev, current) => stringToTimestamp(prev.insert_time) - stringToTimestamp(current.insert_time),
    );
    return sortedHistory;
  },
);
