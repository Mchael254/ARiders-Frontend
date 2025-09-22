import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GuestPanelState } from './reducer';

export const selectGuestPanelState = createFeatureSelector<GuestPanelState>('guestPanel');

export const selectGuestCurrentView = createSelector(
    selectGuestPanelState,
    (state) => state.currentView
);

export const selectGuestViewData = createSelector(
    selectGuestPanelState,
    (state) => state.viewData
);
