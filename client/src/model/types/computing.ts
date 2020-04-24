export const SEARCH_SIMILAR_EVENTS = 'SEARCH_SIMILAR_EVENTS';
export const CLEAN_MATCHED_EVENTS = 'CLEAN_MATCHED_EVENTS';

export type SearchSimilarEventsAction = {
  type: typeof SEARCH_SIMILAR_EVENTS;
  promise: Promise<SimilarEventsResponse>;
  result?: SimilarEventsResponse; // only exist when promise gets resolved
  error?: string; // only exist when promise gets rejected
  datarunID: string;
};

export type CleanMatchedEvents = {
  type: typeof CLEAN_MATCHED_EVENTS;
}

/**
 * Pipeline State format
 */
export type ComputingState = {
  isSimilarEventsLoading: boolean;
  similarEvents: any;
  lastSearchedDatarunID: string;
};

export type SimilarEventsResponse = { 
  windows: any;
}
