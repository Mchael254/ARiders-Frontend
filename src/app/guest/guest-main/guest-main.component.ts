import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { selectGuestCurrentView, selectGuestViewData } from 'src/app/store/panel/guest/selectors';
import { selectAuthRole } from 'src/app/store/auth/auth.selector';
import { AppState } from 'src/app/store';
import * as AuthActions from '../../store/auth/auth.actions';
import * as GuestPanelActions from '../../store/panel/guest/actions';
import { ToastrService } from 'ngx-toastr';

interface TabConfig {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-guest-main',
  templateUrl: './guest-main.component.html',
  styleUrls: ['./guest-main.component.css']
})
export class GuestMainComponent implements OnInit {
  currentView$: Observable<string> = this.store.select(selectGuestCurrentView);
  viewData$: Observable<{ [key: string]: any }> = this.store.select(selectGuestViewData);
  userRole$: Observable<string> = this.store.select(selectAuthRole).pipe(
    map(role => role ?? '')
  );

  sideNavOpen = false;
  faBars = faBars;
  logoutDialogVisible = false;

  // Tab configuration for guest users
  tabsConfig: TabConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard'
    },
    {
      id: 'events',
      label: 'Events'
    },
    {
      id: 'profile',
      label: 'Profile'
    },
    {
      id: 'registrations',
      label: 'My Registrations'
    }
  ];

  constructor(
    private store: Store<AppState>,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // Set default view on component initialization
    this.setView('dashboard');
  }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string, data?: any): void {
    this.store.dispatch(GuestPanelActions.setGuestPanelView({ view, data }));
    this.sideNavOpen = false;
  }

  showLogoutDialog() {
    this.logoutDialogVisible = true;
  }

  closeLogoutDialog() {
    this.logoutDialogVisible = false;
  }

  confirmLogout() {
    this.logoutDialogVisible = false;
    this.store.dispatch(AuthActions.logout());
  }

  getRoleDisplayName(): Observable<string> {
    return this.userRole$.pipe(
      map(role => {
        switch (role) {
          case 'guest': return 'Guest';
          default: return 'Guest User';
        }
      })
    );
  }
}
