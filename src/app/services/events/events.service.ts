import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateEventPayload, CreateEventResponse, EditEventPayload, EditEventResponse, Event, EventDetails, EventParticipant, EventRegistration, EventTypesResponse, EventsResponse, EventSummaryResponse } from '../types/event.model';
import { environment } from 'src/environments/environment.development';



@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private readonly baseUrl = environment.localUrl

  constructor(private http: HttpClient) { }

  createEvent(event: CreateEventPayload): Observable<CreateEventResponse> {
    return this.http.post<CreateEventResponse>(`${this.baseUrl}/api/events/createEvent`, event);
  }

  getEventTypes(): Observable<EventTypesResponse> {
    return this.http.get<EventTypesResponse>(`${this.baseUrl}/api/events/types`);
  }

  getEvents(): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/api/events/all`);
  }

  editEvent(payload: EditEventPayload): Observable<EditEventResponse> {
    return this.http.put<EditEventResponse>(`${this.baseUrl}/api/events/edit`, payload);
  }

  deleteEvent(adminId: string, eventId: string, reason?: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/api/events/${eventId}`,
      {
        body: {
          adminId,
          reason: reason || null
        }
      }
    );
  }

  registerForEvent(memberId: string, eventId: string, emergencyContact?: string, emergencyPhone?: string, notes?: string): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.baseUrl}/api/events/register`, {
      memberId, eventId, emergencyContact, emergencyPhone, notes
    });
  }


  getMemberEvents(memberId: string): Observable<EventDetails[]> {
    return this.http.get<EventDetails[]>(`${this.baseUrl}/api/events/member/${memberId}`);
  }

  getParticipants(eventId: string): Observable<EventParticipant[]> {
    return this.http.get<EventParticipant[]>(`${this.baseUrl}/api/events/participants/${eventId}`);
  }

  cancelRegistration(memberId: string, eventId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/api/events/registrations/${eventId}`,
      {
        body: { memberId }
      }
    );
  }

  getEventSummary(eventId: string): Observable<EventSummaryResponse> {
    return this.http.get<EventSummaryResponse>(`${this.baseUrl}/api/events/${eventId}/summary`);
  }



}
