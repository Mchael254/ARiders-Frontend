import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { handleError } from '../utilities/error-handler/error-handler';
import { Member } from 'src/app/interfaces/members';
import { ApiResponse, ChangeMemberRoleRequest, ChangeMemberRoleResponse, Role, updateRolePayload } from '../types/memberService';


@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private baseApiUrl = `${environment.localUrl}/api/members`;
  roles: Role[] = [];

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

  async deactivateMember(id: string, deactivatedBy: string, reason: string, permanent = false): Promise<any> {
    const payload = {
      member_id: id,
      deactivated_by: deactivatedBy,
      initiator: 'admin', 
      reason,
      permanent
    };

    return firstValueFrom(
      this.http.post<any>(`${this.baseApiUrl}/deactivate`, payload)
    );
  }




  //activate member
  markMemberAsActive(id: string) {
    return this.http.patch(`${this.baseApiUrl}/members/${id}`, {
      membership_status: 'active',
    }).toPromise();
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseApiUrl}/allRoles`).pipe(
      map(response => {
        return response.data.map(role => ({
          value: role.id,
          label: role.name
        }));
      })
    );
  }

  updateMemberRole(updateRolePayload: updateRolePayload): Observable<any> {
    return this.http.post(`${this.baseApiUrl}/change-role`, updateRolePayload).pipe(
      catchError(handleError)
    );
  }




}
