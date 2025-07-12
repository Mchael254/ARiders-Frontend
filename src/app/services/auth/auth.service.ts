import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabaseKey = environment.supabaseKey;


  constructor(private http: HttpClient) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  private supabase: SupabaseClient;

  // private baseUrl = 'https://ariders-club.onrender.com/user'

  register(userData: any): Observable<any> {
    const url = `https://aidnxywieovjglfrcwty.supabase.co/functions/v1/signupMember`;

    return this.http.post(url, userData, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`
      }
    })

  }

  // Login with supabase
  login(loginData: { email: string; password: string }): Observable<any> {
    return from(this.supabase.auth.signInWithPassword(loginData)).pipe(
      switchMap(response => {
        if (response.error) {
          throw response.error;
        }

        const userId = response.data?.user?.id;
        if (!userId) {
          throw new Error('Login succeeded but user ID missing.');
        }

        return from(
          this.supabase.from('members').select('*').eq('id', userId).single()
        ).pipe(
          map(profileRes => {
            if (profileRes.error) {
              throw profileRes.error;
            }

            return {
              session: response.data.session,
              user: response.data.user,
              profile: profileRes.data,
              error: null 
            };
          })
        );
      })
    );
  }


  logout() {

  }

  sendPasswordReset(email: string): Observable<any> {
    return from(
      this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${environment.frontendUrl}/resetPassword`
      })
    );
  }

  resetPassword(password: string): Observable<any> {
    return from(
      this.supabase.auth.updateUser({ password })
    );
  }

}
