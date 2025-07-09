import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // render
  // private apiUrl = 'https://a-riders-backend.onrender.com/api';
  // local
  private apiUrl = 'http://localhost:5300/api';



 constructor(private http: HttpClient) {}
  initiateSTKPush(payload: { phoneNumber: string; amount: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/stkPush`, payload);
  };
  
}
