import { CommentDataType, EventCommentsType } from './comment';

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
export const IS_CHANGING_EVENT_RANGE = 'IS_CHANGING_EVENT_RANGE';

export type UpdatedEventDetailsType = {
  id?: string;
  start_time?: number;
  stop_time?: number;
  tag?: string;
  commentsDraft?: string;
  score?: number;
} | null;

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
  commentsDraft?: string;
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
  newEventDetails: UpdatedEventDetailsType;
  filterTags: any;
  isEventModeEnabled: boolean;
  uploadEventsStatus: null | string;
  eventUpdateStatus: null | string;
  isTranscriptSupported: boolean;
  isSpeechInProgress: boolean;
  addingNewEvent: string;
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

export type EventInteractionsResponse = {
  records: EventInteractions[];
};

export type FetchEventDetailsActionType = {
  type: typeof FETCH_EVENT_DATA;
  promise: Promise<EventDataType>;
};

export type UpdateEventDetailsActionType = {
  type: typeof UPDATE_EVENT_DETAILS;
  eventDetails: EventDataType;
};

export type UpdateNewEventDetailsActionType = {
  type: typeof NEW_EVENT_DETAILS;
  newEventDetails: UpdatedEventDetailsType;
};

export type AddNewEventActionType = {
  type: typeof ADDING_NEW_EVENTS;
  isAddingEvent: boolean;
};
export type SetEventIDActionType = {
  type: typeof SET_ACTIVE_EVENT_ID;
  activeEventID: string | null;
};

export type SetEventStatusActionType = {
  type: typeof EVENT_UPDATE_STATUS;
  eventUpdateStatus: string | null;
};

export type SetTranscriptActionType = {
  type: typeof SET_TRANSCRIPT_STATUS;
  isTranscriptSupported: boolean;
};

export type FetchEventHistoryActionType = {
  type: typeof FETCH_EVENT_HISTORY;
  promise: Promise<EventInteractionsResponse>;
  result?: EventInteractionsResponse;
  error?: string;
};

export type SetTranscriptStatusActionType = {
  type: typeof SET_TRANSCRIPT_STATUS;
  isTranscriptSupported: boolean;
};

export type ToggleEventModeActionType = {
  type: typeof TOGGLE_EVENT_MODE;
  isEventModeEnabled: boolean;
};

export type IsEditingEventRangeActionType = {
  type: typeof IS_CHANGING_EVENT_RANGE;
  isEditingEventRange: boolean;
};

export type SetFilterTagsActionType = {
  type: typeof SET_FILTER_TAGS;
  filterTags: string | Array<[]> | null;
};

export type AddNewEventResultActionType = {
  type: typeof ADDING_NEW_EVENT_RESULT;
  result: string;
};
