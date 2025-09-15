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
  rider_type_id?: string | null;
  riderTypes: { id: string; type_name: string }[];
  updateRiderTypeLoading: boolean;
  updateRiderTypeSuccess: boolean;
  updateRiderTypeError: string | null;
  profileUpdating?: boolean;


  profile_image?: string;
  city?: string;
  county?: string;
  phone_number?: string;
  emergency_phone?: string;
  work_phone?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  gender?: string;
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
  error: null,

  riderTypes: [],
  updateRiderTypeLoading: false,
  updateRiderTypeSuccess: false,
  updateRiderTypeError: null,
  profileUpdating: false,

};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { user, token, role, profile_image, city, county, phone_number, emergency_phone, work_phone, first_name, last_name, middle_name, gender, membership_status, dob, role_activated }) => ({
    ...state,
    user: { ...user, role_activated },
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
    dob
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AuthActions.logout, () => initialState),

  on(AuthActions.loadSessionSuccess, (state, { user, token, role, profile_image, city, county, phone_number, emergency_phone, work_phone, first_name, last_name, middle_name, gender, membership_status, dob, role_activated }) => ({
    ...state,
    user: { ...user, role_activated },
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



  // update user profile,
  on(AuthActions.updateUserProfileSection, (state) => ({
    ...state,
    profileUpdating: true
  })),

  on(AuthActions.updateUserProfileSuccess, (state, { updatedData }) => ({
    ...state,
    user: {
      ...state.user,
      ...updatedData
    },
    profileUpdating: false
  })),

  on(AuthActions.updateUserProfileFailure, (state, { error }) => ({
    ...state,
    error,
    profileUpdating: false
  })),


  //load rider category
  on(AuthActions.loadRiderTypesSuccess, (state, { riderTypes }) => ({
    ...state,
    riderTypes
  })),


  //update ride category
  on(AuthActions.updateRiderType, (state) => ({
    ...state,
    updateRiderTypeLoading: true,
    updateRiderTypeSuccess: false,
    updateRiderTypeError: null
  })),

  on(AuthActions.updateRiderTypeSuccess, (state, { riderTypeId }) => ({
    ...state,
    user: state.user ? { ...state.user, rider_type_id: riderTypeId } : null,
    updateRiderTypeLoading: false,
    updateRiderTypeSuccess: true
  })),

  on(AuthActions.updateRiderTypeFailure, (state, { error }) => ({
    ...state,
    updateRiderTypeLoading: false,
    updateRiderTypeSuccess: false,
    updateRiderTypeError: error
  })),

  on(AuthActions.clearUpdateRiderTypeStatus, (state) => ({
    ...state,
    updateRiderTypeSuccess: false,
    updateRiderTypeError: null
  })),





);
