import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';
import { AuthSession } from './auth.Model';


@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private storage: LocalStorageService,
    private router: Router,
  ) { }

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap((action) =>
        this.authService.login({ email: action.email, password: action.password }).pipe(
          map(({ session, user, profile, error }) => {
            if (error) {
              return AuthActions.loginFailure({ error: error.message });
            }

            const token = session.access_token;

            console.log('[AuthEffect] Profile data:', profile);

            // Save user in storage as a whole object
            const authUser = {
              id: user.id,
              email: user.email,
              role: profile.role,
              profile_image: profile.profile_image,
              city: profile.city,
              county: profile.county,
              phone_number: profile.phone_number,
              first_name: profile.first_name,
              last_name: profile.last_name,
              middle_name: profile.middle_name,
              membership_status:profile.membership_status
            };

            return AuthActions.loginSuccess({
              user: authUser,
              token,
              role: profile.role,
              profile_image: profile.profile_image,
              city: profile.city,
              county: profile.county,
              phone_number: profile.phone_number,
              first_name: profile.first_name,
              last_name: profile.last_name,
              middle_name: profile.middle_name,
              membership_status:profile.membership_status
            });
          }),
          catchError((err) =>
            of(AuthActions.loginFailure({ error: err.message || 'Login failed' }))
          )
        )
      )
    )
  );


  loadSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadSession),
      map(() => {
        const session: AuthSession | null = this.storage.getItem('auth_session');

        if (session && session.token) {
          return AuthActions.loadSessionSuccess(session);
        }

        return AuthActions.loadSessionSkipped();
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.logout();
        this.storage.removeItem('auth_session');
      }),
      map(() => AuthActions.logoutSuccess()),
      catchError(() => of(AuthActions.logoutFailure())),
    )
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
