import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MailMessageService {

  baseUrl = environment.apiUrl

  constructor(private authService: AuthService) { }

  

  


}
