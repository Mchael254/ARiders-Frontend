import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectAnyLoading, selectAuthState } from './store/auth/auth.selector';
import * as AuthActions from './store/auth/auth.actions';
import { filter } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from './services/utilities/local-storage/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
// export class AppComponent implements OnInit {
//   title = 'ariders';
//   constructor(private store: Store,
//     private localStorage: LocalStorageService,
//     private router: Router,
//     private spinner: NgxSpinnerService) {
//     this.store.dispatch(AuthActions.loadSession());

//     this.store.select(selectAuthState)
//       .pipe(
//         filter(state => !state.loading)
//       )
//       .subscribe(state => {
//         const noSession = !state.isAuthenticated && !!state.error && state.error === 'No active session found';
//         const isLoggedOut = !state.isAuthenticated && !state.loading;

//         if (noSession || isLoggedOut) {
//           this.localStorage.clear();
//           this.router.navigate(['/landing']);
//         }
//       });

//   }

//   ngOnInit() {
//     this.store.select(selectAnyLoading).subscribe(isLoading => {
//       if (isLoading) {
//         this.spinner.show();
//       } else {
//         this.spinner.hide();
//       }
//     });
//   }
// }
export class AppComponent implements OnInit {
  title = 'ariders';

  constructor(
    private store: Store,
    private localStorage: LocalStorageService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    this.store.dispatch(AuthActions.loadSession());

    this.store.select(selectAuthState)
      .pipe(filter(state => !state.loading))
      .subscribe(state => {
        const currentUrl = this.router.url; 

        const noSession =
          !state.isAuthenticated &&
          !!state.error &&
          state.error === 'No active session found';
        const isLoggedOut = !state.isAuthenticated && !state.loading;

        // Check if we're on reset password route or if there are auth tokens in URL
        const isOnResetPassword = currentUrl.startsWith('/resetPassword');
        const hasAuthTokensInUrl = this.hasAuthTokensInCurrentUrl();

        // 👇 Skip redirect if on /resetPassword route or if auth tokens are present
        if ((noSession || isLoggedOut) && !isOnResetPassword && !hasAuthTokensInUrl) {
          this.localStorage.clear();
          this.router.navigate(['/landing']);
        }
      });
  }

  private hasAuthTokensInCurrentUrl(): boolean {
    const currentUrl = window.location.href;
    const hasFragment = window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery');
    const hasQuery = currentUrl.includes('access_token') || currentUrl.includes('type=recovery');
    return hasFragment || hasQuery;
  }

  ngOnInit() {
    this.store.select(selectAnyLoading).subscribe(isLoading => {
      if (isLoading) {
        this.spinner.show();
      } else {
        this.spinner.hide();
      }
    });
  }
}
