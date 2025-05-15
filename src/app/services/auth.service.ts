import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  supabaseUrl = import.meta.env.NG_APP_PUBLIC_SUPABASE_URL;
  supabaseKey = import.meta.env.NG_APP_PUBLIC_SUPABASE_ANON_KEY
  
  constructor(private http: HttpClient, private router: Router) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
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
      tap(response => console.log('Supabase response from service:', response))
    );
  }

  logout() {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_profile_image');
  }

}
