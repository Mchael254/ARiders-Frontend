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