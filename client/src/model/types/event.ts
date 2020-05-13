import { CommentDataType } from './comment';

export const FETCH_EVENT_DATA = 'FETCH_EVENT_DATA';
export const IS_UPDATE_POPUP_OPEN = 'IS_UPDATE_POPUP_OPEN';
export const UPDATE_EVENT_DETAILS = 'UPDATE_EVENT_DETAILS';
export const IS_ADDING_EVENT = 'IS_ADDING_EVENT';
export const IS_CHANGING_EVENT_RANGE = 'IS_CHANGING_EVENT_RANGE';
export const SAVE_EVENT = 'SAVE_EVENT';
export const UPDATE_EVENT_STATUS = 'UPDATE_EVENT_STATUS';
export const DELETE_EVENT = 'DELETE_EVENT';
export const UPDATE_DATARUN_EVENTS = 'UPDATE_DATARUN_EVENTS';

/**
 * The data fetched from server with RESTAPI
 */
export type EventDataType = {
  id: string;
  score: number;
  tag: string;
  start_time: number;
  stop_time: number;
  insert_time?: string;
  datarun?: string;
  comments?: CommentDataType[];
};

export type EventsResponse = {
  events: EventDataType[];
};

export type EventDataState = {
  eventDetails: EventDataType[];
  isEventDetailsLoading: boolean;
  isEditingEventRange: boolean;
  isSaveEventLoading: boolean;
  eventUpdateStatus: string | null;
  isEventDeletedSuccess: boolean | null;
};
