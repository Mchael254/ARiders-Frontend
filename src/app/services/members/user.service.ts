import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

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
}
