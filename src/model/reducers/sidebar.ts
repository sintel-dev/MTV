import createReducer from '../store/createReducer';
import { SetActivePanelActionType, SidebarState, ToggleEvtSummaryActionType, ToggleRelScaleActionType } from '../types';

const initialState: SidebarState = {
  activePanel: 'periodicalView',
  relativeScale: false,
  isSummaryVisible: true,
};

function SET_ACTIVE_PANEL(nextState, action: SetActivePanelActionType) {
  nextState.activePanel = action.activePanel;
}

function TOGGLE_RELATIVE_SCALE(nextState, action: ToggleRelScaleActionType) {
  nextState.relativeScale = action.relativeScale;
}

function TOGGLE_EVENT_SUMMARY(nextState, action: ToggleEvtSummaryActionType) {
  nextState.isSummaryVisible = action.isSummaryVisible;
}

export default createReducer<SidebarState>(initialState, {
  SET_ACTIVE_PANEL,
  TOGGLE_RELATIVE_SCALE,
  TOGGLE_EVENT_SUMMARY,
});
