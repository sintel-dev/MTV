import createReducer from '../store/createReducer';
import { SearchSimilarEventsAction, ComputingState } from '../types';

const initialState: ComputingState = {
  similarEvents: [],
  isSimilarEventsLoading: false,
  lastSearchedDatarunID: null
};

function SEARCH_SIMILAR_EVENTS_REQUEST(nextState: ComputingState) {
  nextState.isSimilarEventsLoading = true;
}

function SEARCH_SIMILAR_EVENTS_SUCCESS(nextState: ComputingState, action: SearchSimilarEventsAction) {
  nextState.isSimilarEventsLoading = false;
  nextState.lastSearchedDatarunID = action.datarunID;
  if (action.result) {
    nextState.similarEvents = action.result.windows;
  }
}

function CLEAN_MATCHED_EVENTS(nextState: ComputingState) {
  nextState.similarEvents = [];
  nextState.lastSearchedDatarunID = null;
}

export default createReducer<ComputingState>(initialState, {
  SEARCH_SIMILAR_EVENTS_REQUEST,
  SEARCH_SIMILAR_EVENTS_SUCCESS,
  CLEAN_MATCHED_EVENTS
});
