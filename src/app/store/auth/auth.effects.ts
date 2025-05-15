import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service'; // adjust path if needed
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private storage: LocalStorageService,
    private router: Router,
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap((action) =>
        this.authService
          .login({ email: action.email, password: action.password })
          .pipe(
            map(({ data, error }) => {
              console.log('Supabase response:', { data, error });
              if (error) {
                return AuthActions.loginFailure({ error: error.message });
              }

              const user = data.user;
              const token = data.session.access_token;
              const role = user.user_metadata?.role || 'member';
              const phone_number = user.metadata?.phone_number
              const profile_image = user.user_metadata?.profile_image;
              const county = user.metadata?.county;
              const city = user.metadata?.city;
              const first_name = user.metadata?.first_name;
              const last_name = user.metadata?.first_name;
              const middle_name = user.metadata?.first_name



              // Persist to encrypted localStorage
              this.storage.setItem('auth_user', user);
              this.storage.setItem('auth_token', token);
              this.storage.setItem('auth_role', role);
              this.storage.setItem('auth_profile_image', profile_image);
              this.storage.setItem('city', city);
              this.storage.setItem('phone_number', phone_number);
              this.storage.setItem('first_name', first_name);
              this.storage.setItem('last_name', last_name);
              this.storage.setItem('middle_name', middle_name)




              return AuthActions.loginSuccess({
                user,
                token,
                role,
                profile_image,
                city,
                phone_number,
                first_name,
                last_name,
                middle_name

              });
            }),
            catchError((err) =>
              of(
                AuthActions.loginFailure({
                  error: err.message || 'Login failed',
                }),
              ),
            ),
          ),
      ),
    ),
  );

  // New: Session restoration effect on app init
  loadSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadSession),
      map(() => {
        const user = this.storage.getItem('auth_user');
        const token = this.storage.getItem('auth_token');
        const role = this.storage.getItem('auth_role');
        const profile_image = this.storage.getItem('auth_profile_image');
        const phone_number = this.storage.getItem('phone_number');
        const first_name = this.storage.getItem('first_name');
        const last_name = this.storage.getItem('phone_number');
        const middle_name = this.storage.getItem('middle_name');



        if (user && token) {
          return AuthActions.loadSessionSuccess({
            user,
            token,
            role,
            profile_image,
            phone_number,
            middle_name,
            first_name,
            last_name
          });
        }

        return AuthActions.loadSessionSkipped();
      }),
    ),
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.logout();
      }),
      map(() => AuthActions.logoutSuccess()),
      catchError(() => of(AuthActions.logoutFailure())),
    ),
  );

  logoutRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => this.router.navigate(['/signin'])),
      ),
    { dispatch: false },
  );
}
