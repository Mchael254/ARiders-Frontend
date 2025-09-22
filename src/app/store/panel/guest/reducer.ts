import { createReducer, on } from '@ngrx/store';
import * as GuestPanelActions from './actions';

export interface GuestPanelState {
    currentView: string;
    viewData: Record<string, any>;
}

export const initialState: GuestPanelState = {
    currentView: 'dashboard',
    viewData: {}
};

export const guestPanelReducer = createReducer(
    initialState,
    on(GuestPanelActions.setGuestPanelView, (state, { view, data }) => ({
        ...state,
        currentView: view,
        viewData: data ? { ...state.viewData, [view]: data } : state.viewData
    }))
);
