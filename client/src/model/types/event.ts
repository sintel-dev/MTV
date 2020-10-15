import { CommentDataType } from './comment';

export const FETCH_EVENT_HISTORY = 'FETCH_EVENT_HISTORY';
export const FETCH_EVENT_DATA = 'FETCH_EVENT_DATA';
export const UPDATE_EVENT_DETAILS = 'UPDATE_EVENT_DETAILS';
export const ADDING_NEW_EVENTS = 'ADDING_NEW_EVENTS';
export const SET_ACTIVE_EVENT_ID = 'SET_ACTIVE_EVENT_ID';
export const EVENT_UPDATE_STATUS = 'EVENT_UPDATE_STATUS';
export const SET_TRANSCRIPT_STATUS = 'SET_TRANSCRIPT_STATUS';
export const NEW_EVENT_DETAILS = 'NEW_EVENT_DETAILS';
export const ADDING_NEW_EVENT_RESULT = 'ADDING_NEW_EVENT_RESULT';
export const SET_FILTER_TAGS = 'SET_FILTER_TAGS';
export const TOGGLE_EVENT_MODE = 'TOGGLE_EVENT_MODE';
export const UPLOAD_JSON_EVENTS = 'UPLOAD_JSON_EVENTS';
export const SAVE_EVENT_DETAILS = 'SAVE_EVENT_DETAILS';

export type EventCommentsType = {
  comments?: {
    created_by: string;
    event: string;
    id: string;
    insert_time: string;
    text: string;
  };
};
/**
 * The data fetched from server with RESTAPI
 */
export type EventDataType = {
  id: string;
  score: number;
  tag: string | null;
  start_time: number;
  stop_time: number;
  insert_time?: string;
  datarun?: string;
  comments?: CommentDataType[];
  source?: string;
  signalrunID: string;
  isCommentsLoading: boolean;
  eventComments: EventCommentsType[];
};

export type EventState = {
  isEventHistoryLoading: boolean;
  eventHistory: any;
  activeEventID: string | null;
  isEventCommentsLoading: boolean;
  eventComments: Array<any>;
  eventDetails: object;
  isEditingEventRange: boolean;
  isEditingEventRangeDone: boolean;
  isAddingEvent: boolean;
  newEventDetails: object;
  filterTags: any;
  isEventModeEnabled: boolean;
  uploadEventsStatus: null | string;
  eventUpdateStatus: null | string;
  isTranscriptSupported: boolean;
  isSpeechInProgress: boolean;
};

export type EventsResponse = {
  events: EventDataType[];
};

export type EventInteractions = {
  id: string;
  event: string;
  action: string;
  tag: string;
  annotation: string | null;
  start_time: string | null;
  stop_time: string | null;
  insert_time: string | null;
  created_by: string | null;
};

export type FetchEventDetailsAction = {
  type: typeof FETCH_EVENT_DATA;
  promise: Promise<EventDataType>;
};

export type UpdateEventDetailsAction = {
  type: typeof UPDATE_EVENT_DETAILS;
  eventDetails: EventDataType;
};

export type AddNewEventActionType = {
  type: typeof ADDING_NEW_EVENTS;
  isAddingEvent: boolean;
};
export type SetEventIDAction = {
  type: typeof SET_ACTIVE_EVENT_ID;
  activeEventID: string | null;
};

export type SetEventStatusAction = {
  type: typeof EVENT_UPDATE_STATUS;
  eventUpdateStatus: string | null;
};

export type SetTranscriptAction = {
  type: typeof SET_TRANSCRIPT_STATUS;
  isTranscriptSupported: boolean;
};
