export interface User {
  id: string;
  email: string;
  phone?: string;
  role?: string; // Supabase doesn't include role by default unless in metadata
  [key: string]: any;
  first_name?:string;
  middle_name?:string;
  last_name?:string;
  county?:string;
  city?:string;
  home_phone?:string;
  work_phone?:string;
  emergency_phone?:string;
  gender?:string;
}

export interface SupabaseSession {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  user: User;
}

export interface LoginResponse {
  data: {
    user: User;
    session: SupabaseSession;
  };
  error: any;
}
