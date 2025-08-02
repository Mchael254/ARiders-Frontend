import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Member } from '../../interfaces/members';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private baseApiUrl = `${environment.localUrl}/api/members`;

  constructor(private http: HttpClient) { }

  // GET: fetch members with filters
  getAllMembers(
    status?: string,
    role?: string,
    gender?: string,
    search?: string,
    limit: number = 100,
    offset: number = 0
  ): Observable<{ data: Member[]; count: number }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (status) params = params.set('status', status);
    if (role) params = params.set('role', role);
    if (gender) params = params.set('gender', gender);
    if (search) params = params.set('search', search);

    return this.http.get<{ data: Member[]; count: number }>(
      `${this.baseApiUrl}/getAllMembers`,
      { params }
    );
  }

  // update member role or status
  updateMemberRoleStatus(id: string, data: { role?: string; membership_status?: string }) {
    return this.http.patch(`${this.baseApiUrl}/members/${id}`, data).toPromise();
  }

  //deactivate member
  deactivateMember(id: string) {
    return this.http.patch(`${this.baseApiUrl}/members/${id}`, { membership_status: 'inactive' }).toPromise();
  }

  //activate member
  markMemberAsActive(id: string) {
    return this.http.patch(`${this.baseApiUrl}/members/${id}`, {
      membership_status: 'active',
    }).toPromise();
  }




}
