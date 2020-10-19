export const SET_ACTIVE_PANEL = 'SET_ACTIVE_PANEL';
export const TOGGLE_RELATIVE_SCALE = 'TOGGLE_RELATIVE_SCALE';
export const TOGGLE_EVENT_SUMMARY = 'TOGGLE_EVENT_SUMMARY';

export type SidebarState = {
  activePanel: string;
  relativeScale: boolean;
  isSummaryVisible: boolean;
};
export type SetActivePanelActionType = {
  type: typeof SET_ACTIVE_PANEL;
  activePanel: string;
};

export type ToggleRelScaleActionType = {
  type: typeof TOGGLE_RELATIVE_SCALE;
  relativeScale: boolean;
};

export type ToggleEvtSummaryActionType = {
  type: typeof TOGGLE_EVENT_SUMMARY;
  isSummaryVisible: boolean;
};
