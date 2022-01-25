import { RootState } from '../types';

export const getCurrentActivePanel = (state: RootState) => state.sidebar.activePanel;
export const getIsRelativeScaleEnabled = (state: RootState) => state.sidebar.relativeScale;
export const getIsSummaryViewActive = (state: RootState) => state.sidebar.isSummaryVisible;
