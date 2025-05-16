import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

import * as fromAuth from './auth/auth.reducer';

export interface AppState {
  auth: fromAuth.AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
};

// 👇 Meta-reducer for syncing 'auth' slice with localStorage
export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync({
    keys: ['auth'],
    rehydrate: true,
  })(reducer);
}

export const metaReducers: MetaReducer[] = [localStorageSyncReducer];
