import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { DebtSummaryRequest } from 'src/app/interfaces/debts';
import { environment } from 'src/environments/environment.development';



@Injectable({
  providedIn: 'root'
})
export class DebtService {

  private readonly BASE_URL = `${environment.localUrl}/api/debts`;

  constructor(private http: HttpClient) { }

  getMembersDebtSummary(payload: DebtSummaryRequest): Observable<any> {
    return this.http.post(`${this.BASE_URL}/getMembersDebtSummary`, payload);
  }

  getMemberDebtSummary(memberId: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/getMemberDebtSummary`, {memberId});
  }

 



}
