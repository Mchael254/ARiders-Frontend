export interface User {
  id: string;
  email: string;
  phone?: string;
  role?: string; 
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
  profile_image?:string;
    membership_status?:string;
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

export interface AuthSession {
  user: User;
  token: string;
  role: string;
  profile_image?: string;
  city?: string;
  county?: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  middle_name: string;
    membership_status?:string;
}

export interface AppUser {
  id: string;
  email: string;
  role?: string;
  profile_image?: string;
  city?: string;
  county?: string;
  phone_number?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  membership_status?:string;
}
