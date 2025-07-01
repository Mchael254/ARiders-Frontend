import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DebtSummaryPayload } from '../interfaces/debts';

@Injectable({
  providedIn: 'root'
})
export class DebtService {

  private readonly BASE_URL = 'http://localhost:5300/api/contributions';

  constructor(private http: HttpClient) { }

  getMembersDebtSummary(payload: DebtSummaryPayload): Observable<any> {
    return this.http.post(`${this.BASE_URL}/getMembersDebtSummary`, payload);
  }

  getMemberDebtSummary(memberId: string, lookBackMonths: number, reportDate: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/getMemberDebtSummary`, {
      memberId,
      lookBackMonths,
      reportDate
    });
  }

  private memberIdSubject = new BehaviorSubject<string>('');
  memberId$ = this.memberIdSubject.asObservable();

  private viewChangeSource = new Subject<string>();
  viewChange$ = this.viewChangeSource.asObservable();

  changeView(view: string) {
    this.viewChangeSource.next(view);
  }

  setMemberId(id: string) {
    this.memberIdSubject.next(id);
  }

}
