import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DebtSummaryPayload } from '../interfaces/debts';

@Injectable({
  providedIn: 'root'
})
export class DebtService {

   private readonly BASE_URL = 'http://localhost:5300/api/contributions';

  constructor(private http: HttpClient) {}

  getMembersDebtSummary(payload: DebtSummaryPayload): Observable<any> {
    return this.http.post(`${this.BASE_URL}/getMembersDebtSummary`, payload);
  }
}
