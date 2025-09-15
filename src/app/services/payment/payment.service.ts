import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  paymentUrl = environment.paymentUrl;
  baseUrl = environment.localUrl;

  constructor(private http: HttpClient) { }

  initiateSTKPush(payload: { phone: string; amount: number; Order_ID: string }): Observable<any> {
    return this.http.post(`${this.paymentUrl}/api/stkPush`, payload);
  }

  confirmPayment(checkoutRequestId: string): Observable<any> {
    const url = `${this.paymentUrl}/api/confirmPayment/${checkoutRequestId}`;
    return this.http.post(url, {});
  }

  getAllPaymentTypes(): Observable<{ id: string, name: string, description: string }[]> {
    return this.http.get<{ id: string, name: string, description: string }[]>(`${this.baseUrl}/api/mpesa/getPaymentTypes`);
  }

  warmupMpesa(): Observable<any> {
    return this.http.post(`${this.paymentUrl}/api/warmupMpesa`, {});
  }

}
