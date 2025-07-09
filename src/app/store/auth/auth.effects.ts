import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthSession } from './auth.Model';
import { updateUserProfileFailure, updateUserProfileSection, updateUserProfileSuccess } from './auth.actions';
import { HttpClient } from '@angular/common/http';
import { ResponsesService } from 'src/app/services/utilities/responses.service';
import { LocalStorageService } from 'src/app/services/utilities/local-storage.service';
import { environment } from 'src/environments/environment.development';


@Injectable()
export class AuthEffects {
  baseUrl = environment.apiUrl
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private storage: LocalStorageService,
    private router: Router,
    private http: HttpClient,
    private responsesService: ResponsesService
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

            // console.log('[AuthEffect] Profile data:', profile);

            // Save user in storage as a whole object
            const authUser = {
              id: user.id,
              email: user.email,
              role: profile.role,
              profile_image: profile.profile_image,
              city: profile.city,
              county: profile.county,
              phone_number: profile.phone_number,
              emergency_phone: profile.emergency_phone,
              work_phone: profile.work_phone,
              first_name: profile.first_name,
              last_name: profile.last_name,
              middle_name: profile.middle_name,
              gender: profile.gender,
              membership_status: profile.membership_status
            };

            return AuthActions.loginSuccess({
              user: authUser,
              token,
              role: profile.role,
              profile_image: profile.profile_image,
              city: profile.city,
              county: profile.county,
              phone_number: profile.phone_number,
              emergency_phone: profile.emergency_phone,
              work_phone: profile.work_phone,
              first_name: profile.first_name,
              last_name: profile.last_name,
              middle_name: profile.middle_name,
              gender: profile.gender,
              membership_status: profile.membership_status
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

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserProfileSection),
      tap(() => this.responsesService.showSpinner()),
      switchMap(({ section, data, userId }) =>
        this.http.put(`${this.baseUrl}/api/user/update-user-profile`, { section, data, userId }).pipe(
          tap((response: any) => {
            console.log('Update Response:', response);
            this.responsesService.hideSpinner();

            if (!response || Object.keys(response).length === 0) {
              this.responsesService.showWarning('No changes detected');
            } else {
              this.responsesService.showSuccess(`${section} updated successfully`);
            }
          }),
          map((response: any) => {
            if (!response || Object.keys(response).length === 0) {
              return updateUserProfileFailure({ error: 'No changes detected' });
            }
            return updateUserProfileSuccess({ updatedData: response });
            // response is the updated member object
          }),
          catchError((error) => {
            this.responsesService.hideSpinner();
            this.responsesService.showError(error.message);
            return of(updateUserProfileFailure({ error: error.message }));
          })
        )
      )

    )
  );





}
