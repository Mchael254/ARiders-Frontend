import { createReducer, on } from '@ngrx/store';
import * as PanelActions from './actions';

export interface AdminPanelState {
  currentView: string;
  selectedMemberId: string | null;
  viewData: Record<string, any>;
}

export const initialState: AdminPanelState = {
  currentView: 'debts',
  selectedMemberId: null,
  viewData: {}
};

export const adminPanelReducer = createReducer(
  initialState,
  on(PanelActions.setAdminPanelView, (state, { view, data }) => ({
    ...state,
    currentView: view,
    selectedMemberId: view === 'memberDebt' && data?.memberId ? data.memberId : null,
    viewData: data ? { ...state.viewData, [view]: data } : state.viewData
  }))
);
