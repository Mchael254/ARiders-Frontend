import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabaseKey = environment.supabaseKey;


  constructor(private http: HttpClient, private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  private supabase: SupabaseClient;

  private baseUrl = 'https://ariders-club.onrender.com/user'

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
        const userId = response.data?.user?.id;
        if (!userId) {
          throw new Error('Login failed or user ID missing.');
        }

        // Fetch profile from members table
        return from(
          this.supabase.from('members').select('*').eq('id', userId).single()
        ).pipe(
          map(profileRes => ({
            session: response.data.session,
            user: response.data.user,
            profile: profileRes.data,
            error: response.error || profileRes.error
          }))
        );
      })
    );
  }



  logout() {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_profile_image');
  }

}
