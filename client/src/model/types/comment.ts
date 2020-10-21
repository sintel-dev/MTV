export const GET_EVENT_COMMENTS = 'GET_EVENT_COMMENTS';
export const SPEECH_STATUS = 'SPEECH_STATUS';
/**
 * The data fetched from server with RESTAPI
 */
export type CommentDataType = {
  id: string;
  text: string;
  created_by: string;
  insert_time: string;
  event?: string;
};

export type CommentsResponse = {
  comments: CommentDataType[];
};

export type EventCommentsType = {
  comments?: {
    created_by: string;
    event: string;
    id: string;
    insert_time: string;
    text: string;
  };
};

export type GetEventCommentsActionType = {
  type: typeof GET_EVENT_COMMENTS;
  promise: Promise<CommentDataType>;
  result?: CommentsResponse;
};

export type RecordCommentType = {
  type: typeof SPEECH_STATUS;
  isSpeechInProgress: boolean;
};
