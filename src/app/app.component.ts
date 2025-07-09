import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectAuthState } from './store/auth/auth.selector';
import * as AuthActions from './store/auth/auth.actions';
import { filter } from 'rxjs';
import { LocalStorageService } from './services/utilities/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ariders';
    constructor(private store: Store, private localStorage: LocalStorageService, private router: Router) {
    this.store.dispatch(AuthActions.loadSession());

    this.store.select(selectAuthState)
      .pipe(
        filter(state => !state.loading) 
      )
      .subscribe(state => {
        const noSession = !state.isAuthenticated && !!state.error && state.error === 'No active session found';
        const isLoggedOut = !state.isAuthenticated && !state.loading;

        if (noSession || isLoggedOut) {
          this.localStorage.clear();
          this.router.navigate(['/signin']);
        }
      });
  }
}
