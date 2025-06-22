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
  emergency_phone?:string;
  work_phone?:string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  gender?:string;
  membership_status?: string;
  emergency_number?: string;
  dob?: string;
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

  on(AuthActions.loginSuccess, (state, { user, token, role, profile_image, city, county, phone_number, emergency_phone, work_phone, first_name, last_name, middle_name, gender, membership_status,dob }) => ({
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
    emergency_phone,
    work_phone,
    first_name,
    last_name,
    middle_name,
    gender,
    membership_status,
    dob,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AuthActions.logout, () => initialState),

  on(AuthActions.loadSessionSuccess, (state, { user, token, role, profile_image, city, county, phone_number, emergency_phone, work_phone, first_name, last_name, middle_name, gender, membership_status, dob }) => ({
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
    emergency_phone,
    work_phone,
    first_name,
    last_name,
    middle_name,
    gender,
    membership_status,
    dob,
  })),

  on(AuthActions.loadSessionSkipped, (state) => ({
    ...state,
    loading: false
  })),

  //update profile pic
  on(AuthActions.updateProfileImage, (state, { profile_image }) => ({
    ...state,
    profile_image
  })),



  // update user profile
  on(AuthActions.updateUserProfileSuccess, (state, { updatedData }) => ({
    ...state,
    ...updatedData
  })),


  on(AuthActions.updateUserProfileFailure, (state, { error }) => ({
    ...state,
    error
  }))




);
