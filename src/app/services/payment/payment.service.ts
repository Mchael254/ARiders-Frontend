import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  baseUrl = environment.paymentUrl;

  constructor(private http: HttpClient) {}

  initiateSTKPush(payload: { phone: string; amount: number; Order_ID: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/stkPush`, payload);
  }

  confirmPayment(checkoutRequestId: string): Observable<any> {
    const url = `${this.baseUrl}/api/confirmPayment/${checkoutRequestId}`;
    return this.http.post(url, {});
  }
}
