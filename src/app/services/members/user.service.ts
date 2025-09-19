import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { UserProfile } from 'src/app/interfaces/members';
import { environment } from 'src/environments/environment.development';
import { handleError } from '../utilities/error-handler/error-handler';
import { MemberReceiptsResponse } from '../types/memberService';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private readonly baseUrl = environment.localUrl

  constructor(private http: HttpClient) { }

  uploadProfileImage(userId: string, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/api/user/upload-profile-picture`, formData);

  }

  updateRiderType(memberId: string, riderTypeId: string) {
    return this.http.put<{ message: string }>(`${this.baseUrl}/api/user/update-rider-type`, {
      memberId,
      riderTypeId
    });
  }

  getRiderTypes(): Observable<{ id: string, type_name: string }[]> {
    return this.http.get<{ data: { id: string, type_name: string }[] }>(`${this.baseUrl}/api/user/get-rider-types`)
      .pipe(map(response => response.data));
  }

  getUserProfile(memberId: string): Observable<UserProfile> {
    const url = `${this.baseUrl}/api/user/profile/${memberId}`;

    return this.http.get<UserProfile>(url).pipe(
      catchError(handleError)
    );
  }

  getMemberReceipts(memberId: string): Observable<MemberReceiptsResponse> {
    return this.http.get<MemberReceiptsResponse>(`${this.baseUrl}/api/user/receipts/${memberId}`);
  }



}
