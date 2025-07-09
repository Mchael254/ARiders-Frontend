import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

interface ContributionMetric {
  metric: string;
  value: string;
}

interface ContributionPeriod {
  metrics: ContributionMetric[];
}

interface ContributionAnalytics {
  allTime: ContributionPeriod;
  thisYear: ContributionPeriod;
  thisMonth: ContributionPeriod;
  last6Months: ContributionPeriod;
  quarters: {
    q1?: ContributionPeriod;
    q2?: ContributionPeriod;
    q3?: ContributionPeriod;
    q4?: ContributionPeriod;
  };
}


@Injectable({
  providedIn: 'root'
})
export class ContributionService {

  constructor(private http: HttpClient) { }

  baseContributionUrl = ' http://localhost:5300/api/contributions';

  getGeneralContribution(periodData: any): Observable<any> {
    const url = `http://localhost:5300/api/contributions/grandContributionSummary`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(url, periodData, { headers }).pipe(
      catchError(err => {
        console.error('API Error:', err);
        return of({
          success: false,
          message: err.message,
          period: periodData
        });
      })
    );

  }




}
