import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class ContributionService {

  constructor(private http: HttpClient) { }
  baseUrl = environment.localUrl
  baseContributionUrl = ` ${this.baseUrl}/api/contributions`

  getGeneralContribution(periodData: any): Observable<any> {
    const url = ` ${this.baseContributionUrl}/grandContributionSummary`;
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
