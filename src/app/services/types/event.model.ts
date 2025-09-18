export interface Event {
  id: string;
  event_type_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  is_paid: boolean;
  fee?: number;
  created_at: string;
  created_by: string;
  image?: string;
  event_type_name?: string; // joined from event_types
}

export interface CreateEventResponse {
  message: string;
  eventId: string;
}

export interface CreateEventPayload {
  creatorId: string;
  eventTypeId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isPaid: boolean;
  fee: number;
  image: string;
}

export interface EventType {
  id: string;
  name: string;
  description?: string;
}

export interface EventTypesResponse {
  eventTypes: EventType[];
}

export interface EventsResponse {
  events: Event[];
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  registration_date: string;
  status: string;
  payment_status: string;
  amount_paid: number;
  notes?: string;
}

export interface EventDetails {
  registration_id: string;
  registration_date: string;
  status: string;
  payment_status: string;
  amount_paid: number;
  notes?: string;
  event_id: string;
  event_name: string;
  event_description: string;
  start_date: string;
  end_date: string;
  location: string;
  is_paid: boolean;
  fee: number;
  event_image?: string;
}

export interface EventParticipant {
  registration_id: string;
  event_id: string;
  member_id: string;
  registration_date: string;
  status: string;
  payment_status: string;
  amount_paid: number;
  notes: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  membership_status: string;
  dob: string | null;
  gender: string | null;
  city: string | null;
  county: string | null;
}
