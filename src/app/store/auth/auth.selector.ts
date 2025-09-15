import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';


export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState, state => state.user);
export const selectIsAuthenticated = createSelector(selectAuthState, state => state.isAuthenticated);
export const selectAuthToken = createSelector(selectAuthState, state => state.token);
export const selectAuthError = createSelector(selectAuthState, state => state.error);
export const selectAuthLoading = createSelector(selectAuthState, state => state.loading);
export const selectAuthRole = createSelector(
  selectAuthState,
  state => state.role
);

export const selectRiderTypes = createSelector(
  selectAuthState,
  state => state.riderTypes
);

export const selectRiderType = createSelector(
  selectAuthState,
  state => state.user?.rider_type_id
);

export const selectUpdateRiderTypeLoading = createSelector(
  selectAuthState,
  state => state.updateRiderTypeLoading
);

export const selectUpdateRiderTypeSuccess = createSelector(
  selectAuthState,
  state => state.updateRiderTypeSuccess
);

export const selectUpdateRiderTypeError = createSelector(
  selectAuthState,
  state => state.updateRiderTypeError
);

export const selectProfileUpdating = createSelector(
  selectAuthState,
  state => state.profileUpdating
);

export const selectAnyLoading = createSelector(
  selectAuthLoading,
  selectUpdateRiderTypeLoading,
  selectProfileUpdating,
  (authLoading, updateRiderLoading, profileUpdating) =>
    authLoading || updateRiderLoading || profileUpdating
);
