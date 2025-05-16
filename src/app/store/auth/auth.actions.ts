import { createAction, props } from '@ngrx/store';
import { User } from '@supabase/supabase-js';
import { AuthSession } from './auth.Model';

// login
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<AuthSession>() // or destructure if needed
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

