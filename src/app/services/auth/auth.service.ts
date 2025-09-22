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

  registerGuest(userData: any): Observable<any> {
    const url = `https://aidnxywieovjglfrcwty.supabase.co/functions/v1/hyper-function`;

    return this.http.post(url, userData, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`
      }
    });
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
          throw new Error('Login succeeded but user ID is missing.');
        }

        // Fetch extended profile using your RPC
        return from(
          this.supabase.rpc('get_user_profile', { p_user_id: userId })
        ).pipe(
          map(profileRes => {
            if (profileRes.error) {
              throw profileRes.error;
            }

            const member = profileRes.data.member;
            const role = profileRes.data.role?.name || null;

            return {
              session: response.data.session,
              user: response.data.user,
              profile: {
                ...member,
                role // inject role directly for compatibility
              },
              error: null
            };
          })
        );
      })
    );
  }


  logout() {
    return from(this.supabase.auth.signOut());
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
