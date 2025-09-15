import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
   private baseApiUrl = `${environment.localUrl}/api/payment`;

  constructor(private http: HttpClient) { }

  getRegistrationAmount(): Observable<number> {
    return this.http.get<number>(`${this.baseApiUrl}/registrationAmount`);
  }
}
