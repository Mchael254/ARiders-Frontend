import { createReducer, on } from "@ngrx/store";
import * as PanelActions from './actions';

export interface MemberPanelState {
  currentView: string;
  selectedMemberId: string | null;
  viewData: Record<string, any>;
}

export const initialState: MemberPanelState = {
  currentView: 'bio',
  selectedMemberId: null,
  viewData: {}
};

export const memberPanelReducer = createReducer(
  initialState,
  on(PanelActions.setMemberPanelView, (state, { view, data }) => ({
    ...state,
    currentView: view,
    selectedMemberId: view === 'memberDebt' && data?.memberId ? data.memberId : null,
    viewData: data ? { ...state.viewData, [view]: data } : state.viewData
  }))
);
