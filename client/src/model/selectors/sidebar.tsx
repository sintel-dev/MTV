import { RootState } from '../types';

export const getCurrentActivePanel = (state: RootState) => state.sidebar.activePanel;
export const getIsRelativeScaleEnabled = (state) => state.sidebar.relativeScale;
export const getIsSummaryViewActive = (state) => state.sidebar.isSummaryVisible;
