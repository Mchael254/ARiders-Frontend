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
import { environment } from 'src/environments/environment.development';
import { UserService } from 'src/app/services/members/user.service';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'src/app/services/utilities/local-storage/local-storage.service';


@Injectable()
export class AuthEffects {
  baseUrl = environment.apiUrl
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private storage: LocalStorageService,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private toastr: ToastrService,
  ) { }
  updateUrl = environment.localUrl

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
              dob: profile.dob,
              membership_status: profile.membership_status,
              rider_type_id: profile.rider_type_id,
              role_activated: profile.role_activated
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
              dob: profile.dob,
              membership_status: profile.membership_status,
              rider_type_id: profile.rider_type_id,
              role_activated: profile.role_activated
            });
          }),
          catchError((err) => {
            console.error('Login error:', err);

            let message = 'Login failed';
            if (err.message) {
              message = err.message;
              this.toastr.error(message)
            } else if (err.error && err.error.message) {
                this.toastr.error(message)
              message = err.error.message;
            } else if (typeof err === 'string') {
              this.toastr.error(message)
              message = err;
            }

            return of(AuthActions.loginFailure({ error: message }));
          })

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
      switchMap(() =>
        this.authService.logout().pipe(
          tap(() => this.storage.removeItem('auth_session')),
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutFailure()))
        )
      )
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

  //update profile details
  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserProfileSection),
      // tap(() => this.responsesService.showSpinner()),
      switchMap(({ section, data, userId }) =>
        this.http.put(`${this.updateUrl}/api/user/update-user-profile`, { section, data, userId }).pipe(
          tap((response: any) => {
            console.log('Update Response:', response);

            if (!response || Object.keys(response).length === 0) {
              this.toastr.warning('No changes detected');
            } else {
              this.toastr.success(`${section} updated successfully`);

            }
          }),
          map((response: any) => {
            if (!response || Object.keys(response).length === 0) {
              return updateUserProfileFailure({ error: 'No changes detected' });
            }
            return updateUserProfileSuccess({ updatedData: response });

          }),
          catchError((error) => {
            this.toastr.error(error.message);
            return of(updateUserProfileFailure({ error: error.message }));
          })
        )
      )

    )
  );

  //load rider category
  loadRiderTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadRiderTypes),
      switchMap(() =>
        this.userService.getRiderTypes().pipe(
          map(riderTypes => AuthActions.loadRiderTypesSuccess({ riderTypes })),
          catchError(error => of(AuthActions.loadRiderTypesFailure({ error })))
        )
      )
    )
  );

  // update ride category
  updateRiderType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateRiderType),
      switchMap(({ memberId, riderTypeId }) =>
        this.userService.updateRiderType(memberId, riderTypeId).pipe(
          map(() => AuthActions.updateRiderTypeSuccess({ riderTypeId })),
          catchError(error => of(AuthActions.updateRiderTypeFailure({ error })))
        )
      )
    )
  );


  //refresh profile
  refreshUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshUserProfile),
      switchMap(({ memberId }) =>
        this.userService.getUserProfile(memberId).pipe(
          map(updatedData =>
            AuthActions.refreshUserProfileSuccess({ updatedData })
          ),
          catchError(error => {
            console.error('[RefreshUserProfile Effect] Error:', error); // <-- Add this
            return of(AuthActions.refreshUserProfileFailure({ error }));
          })
        )
      )
    )
  );








}
