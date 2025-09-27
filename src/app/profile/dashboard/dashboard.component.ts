import { Component } from '@angular/core';
import { faBars, faBicycle } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as MemberPanelActions from '../../store/panel/member/actions';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectMemberCurrentView } from 'src/app/store/panel/member/selectors';
import { selectAdminSelectedMemberId, selectAdminViewData } from 'src/app/store/panel/admin/selectors';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  currentView$: Observable<string> = this.store.select(selectMemberCurrentView);
  selectedMemberId$: Observable<string | null> = this.store.select(selectAdminSelectedMemberId);
  viewData$: Observable<{ [key: string]: any }> = this.store.select(selectAdminViewData);


  sideNavOpen = false;
  faBars = faBars;
  faBicycle = faBicycle;
  logoutDialogVisible = false;

  constructor(private store: Store) { }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string, data?: any): void {
    this.store.dispatch(MemberPanelActions.setMemberPanelView({ view, data }));
    this.sideNavOpen = false;
  }

  ngOnInit() { }

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



}
