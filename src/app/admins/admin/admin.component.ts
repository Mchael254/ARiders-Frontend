import { Component } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store';
import * as AuthActions from '../../store/auth/auth.actions';

import * as AdminPanelActions from '../../store/panel/admin/actions';
import { selectAdminCurrentView, selectAdminSelectedMemberId, selectAdminViewData } from 'src/app/store/panel/admin/selectors';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  currentView$: Observable<string> = this.store.select(selectAdminCurrentView);
  selectedMemberId$: Observable<string | null> = this.store.select(selectAdminSelectedMemberId);
  viewData$: Observable<{ [key: string]: any }> = this.store.select(selectAdminViewData);

  sideNavOpen = false;
  faBars = faBars;

  constructor(private store: Store<AppState>) { }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string, data?: any): void {
    this.store.dispatch(AdminPanelActions.setAdminPanelView({ view, data }));
    this.sideNavOpen = false;
  }

  ngOnInit() { }

  logOut() {
    if (confirm('Are you sure you want to logout?')) {
      this.store.dispatch(AuthActions.logout());
    }
  }


}
