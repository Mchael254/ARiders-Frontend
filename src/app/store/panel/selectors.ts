import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PanelState } from './reducer';

export const selectPanelState = createFeatureSelector<PanelState>('panel');

export const selectCurrentView = createSelector(
  selectPanelState,
  (state) => state.currentView
);

export const selectSelectedMemberId = createSelector(
  selectPanelState,
  (state) => state.selectedMemberId
);

export const selectViewData = createSelector(
  selectPanelState,
  (state) => state.viewData
);
