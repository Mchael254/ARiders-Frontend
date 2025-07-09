import { createReducer, on } from '@ngrx/store';
import * as PanelActions from './actions';

export interface PanelState {
  currentView: string;
  selectedMemberId: string | null;
  viewData: Record<string, any>;
}

export const initialState: PanelState = {
  currentView: 'debts',
  selectedMemberId: null,
  viewData: {}
};

export const panelReducer = createReducer(
  initialState,
  on(PanelActions.setPanelView, (state, { view, data }) => ({
    ...state,
    currentView: view,
    selectedMemberId: view === 'memberDebt' && data?.memberId ? data.memberId : null,
    viewData: data ? { ...state.viewData, [view]: data } : state.viewData
  }))
);
