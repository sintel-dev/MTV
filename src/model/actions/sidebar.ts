import { getIsRelativeScaleEnabled, getIsSummaryViewActive } from '../selectors/sidebar';
import {
  SetActivePanelActionType,
  SET_ACTIVE_PANEL,
  ToggleEvtSummaryActionType,
  ToggleRelScaleActionType,
  TOGGLE_EVENT_SUMMARY,
  TOGGLE_RELATIVE_SCALE,
} from '../types';

export function setActivePanelAction(activePanel: string) {
  return (dispatch) => {
    const action: SetActivePanelActionType = { type: SET_ACTIVE_PANEL, activePanel };
    dispatch(action);
  };
}

export function toggleRelativeScaleAction() {
  return function (dispatch, getState) {
    const isRelativeScaleEnabled: boolean = getIsRelativeScaleEnabled(getState());
    const action: ToggleRelScaleActionType = { type: TOGGLE_RELATIVE_SCALE, relativeScale: !isRelativeScaleEnabled };
    dispatch(action);
  };
}

export function toggleEventSummaryAction() {
  return function (dispatch, getState) {
    const summaryViewState: boolean = getIsSummaryViewActive(getState());
    const action: ToggleEvtSummaryActionType = { type: TOGGLE_EVENT_SUMMARY, isSummaryVisible: !summaryViewState };
    dispatch(action);
  };
}
