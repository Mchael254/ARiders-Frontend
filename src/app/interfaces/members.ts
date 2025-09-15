export interface Member {
  id: string;
  joined: string; 
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  role: 'member' | 'admin' | string; 
  membership_status: 'active' | 'inactive' | string; 
  membership_contribution: number;
  dob: string | null; 
  work_phone: string | null;
  emergency_phone: string | null;
  middle_name: string | null;
  gender: string | null;
  city: string | null;
  county: string | null;
}

export interface Role {
  name: string;
  role_id: string;
  end_date: string | null;
  created_at: string;
  start_date: string;
}

export interface Member {
  id: string;
  dob: string | null;
  city: string | null;
  email: string;
  county: string | null;
  gender: string | null;
  joined: string;
  password: string | null;
  last_name: string;
  first_name: string;
  work_phone: string | null;
  middle_name: string | null;
  phone_number: string;
  profile_image: string;
  rider_type_id: string | null;
  role_activated: boolean;
  emergency_phone: string | null;
  membership_status: string;
  membership_contribution: number;
  role_label?: string;
}

export interface UserProfile {
  role: Role;
  member: Member;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

