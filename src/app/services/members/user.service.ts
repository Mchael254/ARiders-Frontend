import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // private readonly baseUrl = 'https://a-riders-backend.onrender.com';
  private readonly baseUrl = environment.apiUrl

  constructor(private http: HttpClient) { }
   uploadProfileImage(userId: string, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/api/user/upload-profile-picture`, formData);
    
  }
}
