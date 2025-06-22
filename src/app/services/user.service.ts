import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = 'https://a-riders-backend.onrender.com';

  constructor(private http: HttpClient) { }
   uploadProfileImage(userId: string, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/user/upload-profile-picture`, formData);
    
  }
}
