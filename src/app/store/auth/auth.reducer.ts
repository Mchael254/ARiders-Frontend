import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AppUser } from './auth.Model';


export interface AuthState {
  user: AppUser | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  profile_image?: string;
  city?: string;
  county?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  membership_status?:string;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { user, token, role, profile_image, city, county, phone_number, first_name, last_name, middle_name,membership_status }) => ({
    ...state,
    user,
    token,
    role,
    isAuthenticated: true,
    loading: false,
    profile_image,
    city,
    county,
    phone_number,
    first_name,
    last_name,
    middle_name,
    membership_status
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AuthActions.logout, () => initialState),

  on(AuthActions.loadSessionSuccess, (state, { user, token, role, profile_image, city, county, phone_number, first_name, last_name, middle_name, membership_status }) => ({
    ...state,
    user,
    token,
    role,
    isAuthenticated: true,
    loading: false,
    profile_image,
    city,
    county,
    phone_number,
    first_name,
    last_name,
    middle_name,
    membership_status
  })),

  on(AuthActions.loadSessionSkipped, (state) => ({
    ...state,
    loading: false
  }))
);
