import { createAction, props } from '@ngrx/store';
import { User } from '@supabase/supabase-js'; 

//login
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string; role: string; profile_image?: string; city?: string; phone_number:string; first_name:string; last_name:string; middle_name:string  }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

//logout
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const logoutFailure = createAction('[Auth] Logout Failure');


//sesssion
export const loadSession = createAction('[Auth] Load Session');

export const loadSessionSuccess = createAction(
  '[Auth] Load Session Success',
  props<{ user: User; token: string; role: string; profile_image?: string;phone_number:string; first_name:string; last_name:string; middle_name:string }>()
);

export const loadSessionSkipped = createAction(
  '[Auth] Load Session Skipped'
);
