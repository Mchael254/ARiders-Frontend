
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class MailMessageService {

  baseUrl = environment.localUrl

  constructor(private http: HttpClient) { }
  
  async generateWelcomeEmail(firstName: string): Promise<string> {
    const template = await firstValueFrom(
      this.http.get('/assets/email-templates/welcome-email.html', { responseType: 'text' })
    );
    return template.replace('{{firstName}}', firstName);
  }


  sendWelcomeEmail(emailData: { first_name: string; email: string; templateHtml: string }): Observable<any> {
    const url = `${this.baseUrl}/api/emails/sendWelcomeEmail`;
    return this.http.post(url, emailData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }



}
