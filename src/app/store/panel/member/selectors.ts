import { createFeatureSelector, createSelector } from "@ngrx/store";
import { MemberPanelState } from "./reducer";

export const selectPanelState = createFeatureSelector<MemberPanelState>('memberPanel');

export const selectMemberCurrentView = createSelector(
  selectPanelState,
  (state) => state.currentView
);

export const selectMemberSelectedMemberId = createSelector(
  selectPanelState,
  (state) => state.selectedMemberId
);

export const selectMemberViewData = createSelector(
  selectPanelState,
  (state) => state.viewData
);
