import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminPanelState } from './reducer';

export const selectPanelState = createFeatureSelector<AdminPanelState>('adminPanel');

export const selectAdminCurrentView = createSelector(
  selectPanelState,
  (state) => state.currentView
);

export const selectAdminSelectedMemberId = createSelector(
  selectPanelState,
  (state) => state.selectedMemberId
);

export const selectAdminViewData = createSelector(
  selectPanelState,
  (state) => state.viewData
);
