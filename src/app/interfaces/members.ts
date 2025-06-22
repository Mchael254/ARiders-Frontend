export interface Member {
  id: string;
  joined: string; // or Date if you'll convert the string to Date object
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  role: 'member' | 'admin' | string; // union of known roles + string for others
  membership_status: 'active' | 'inactive' | string; // union of known statuses
  membership_contribution: number;
  dob: string | null; // or Date | null if you'll convert
  work_phone: string | null;
  emergency_phone: string | null;
  middle_name: string | null;
  gender: string | null;
  city: string | null;
  county: string | null;
}