import { createAction, props } from '@ngrx/store';
import { AuthSession } from './auth.Model';

// login
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<AuthSession>() 
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// logout
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const logoutFailure = createAction('[Auth] Logout Failure');


// session
export const loadSession = createAction('[Auth] Load Session');

export const loadSessionSuccess = createAction(
  '[Auth] Load Session Success',
  props<AuthSession>()
);

export const loadSessionSkipped = createAction('[Auth] Load Session Skipped');

//update profile pic 
export const updateProfileImage = createAction(
  '[Auth] Update Profile Image',
  props<{ profile_image: string }>()
);

//update profile section
export const updateUserProfileSection = createAction(
  '[Auth] Update User Profile Section',
  props<{ section: 'basic' | 'address' | 'contact' | 'rider_type'; data: any; userId: string | number }>()
);

export const updateUserProfileSuccess = createAction(
  '[Profile] Update Section Success',
  props<{ updatedData: any }>()
);

export const updateUserProfileFailure = createAction(
  '[Profile] Update Section Failure',
  props<{ error: any }>()
);

//load rider category
export const loadRiderTypes = createAction('[Auth] Load Rider Types');
export const loadRiderTypesSuccess = createAction(
  '[Auth] Load Rider Types Success',
  props<{ riderTypes: { id: string, type_name: string }[] }>()
);
export const loadRiderTypesFailure = createAction(
  '[Auth] Load Rider Types Failure',
  props<{ error: any }>()
);

//update ride category
export const updateRiderType = createAction(
  '[Auth] Update Rider Type',
  props<{ memberId: string; riderTypeId: string }>()
);

export const updateRiderTypeSuccess = createAction(
  '[Auth] Update Rider Type Success',
  props<{ riderTypeId: string }>()
);

export const updateRiderTypeFailure = createAction(
  '[Auth] Update Rider Type Failure',
  props<{ error: any }>()
);

export const clearUpdateRiderTypeStatus = createAction(
  '[Auth] Clear Update Rider Type Status'
);

//refresh profile
export const refreshUserProfile = createAction(
  '[Auth] Refresh User Profile',
  props<{ memberId: string }>()
);


export const refreshUserProfileSuccess = createAction(
  '[Auth] Refresh User Profile Success',
  props<{ updatedData: any }>()
);

export const refreshUserProfileFailure = createAction(
  '[Auth] Refresh User Profile Failure',
  props<{ error: any }>()
);
