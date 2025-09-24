import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { selectAdminCurrentView, selectAdminSelectedMemberId, selectAdminViewData } from 'src/app/store/panel/admin/selectors';
import { selectAuthRole } from 'src/app/store/auth/auth.selector';
import { AppState } from 'src/app/store';
import * as AuthActions from '../../store/auth/auth.actions';

import * as AdminPanelActions from '../../store/panel/admin/actions';
import { Toast, ToastrService } from 'ngx-toastr';

// Role permissions configuration
const ROLE_PERMISSIONS = {
  chairman: ['dashboard', 'members', 'contributions', 'debts', 'events', 'reports', 'settings'],
  secretary: ['dashboard', 'members', 'events', 'reports'],
  treasurer: ['dashboard', 'members', 'contributions', 'debts', 'reports'],
};

interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  requiredRoles: string[];
  requiredPermissions?: string[];
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  currentView$: Observable<string> = this.store.select(selectAdminCurrentView);
  selectedMemberId$: Observable<string | null> = this.store.select(selectAdminSelectedMemberId);
  viewData$: Observable<{ [key: string]: any }> = this.store.select(selectAdminViewData);
  userRole$: Observable<string> = this.store.select(selectAuthRole).pipe(
    map(role => role ?? '')
  );

  sideNavOpen = false;
  faBars = faBars;
  logoutDialogVisible = false;

  // Tab configuration with role-based access
  tabsConfig: TabConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      requiredRoles: ['chairman', 'secretary', 'treasurer', 'developer']
    },
    {
      id: 'members',
      label: 'Members',
      requiredRoles: ['chairman', 'secretary', 'treasurer', 'developer']
    },
    {
      id: 'contributions',
      label: 'Contributions',
      requiredRoles: ['chairman', 'treasurer', 'developer']
    },
    {
      id: 'debts',
      label: 'Debts',
      requiredRoles: ['chairman', 'treasurer', 'developer']
    },
    {
      id: 'admin-events',
      label: 'Events',
      requiredRoles: ['chairman', 'secretary', 'developer']
    },
    {
      id: 'reports',
      label: 'Reports',
      requiredRoles: ['chairman', 'secretary', 'treasurer', 'developer']
    },
    {
      id: 'settings',
      label: 'Settings',
      requiredRoles: ['chairman', 'developer']
    },
    {
      id: 'mpesa-payments',
      label: 'M-Pesa Payments',
      requiredRoles: ['chairman', 'treasurer', 'developer']
    },
    {
      id: 'memberDebt',
      label: "memberDebt",
      requiredRoles: ['chairman', 'treasurer', 'developer']
    },
    {
      id: 'eventDetails',
      label: "Event Details",
      requiredRoles: ['chairman', 'secretary', 'treasurer', 'developer']
    },
    {
      id: 'memberDetails',
      label: "Member Details",
      requiredRoles: ['chairman', 'secretary', 'treasurer', 'developer']
    }
  ];

  accessibleTabs$: Observable<TabConfig[]> = this.userRole$.pipe(
    map(userRole => this.getAccessibleTabs(userRole))
  );

  canAccessCurrentView$: Observable<boolean> = combineLatest([
    this.currentView$,
    this.userRole$
  ]).pipe(
    map(([currentView, userRole]) => this.canAccessTab(currentView, userRole))
  );

  constructor(private store: Store<AppState>, private toastr: ToastrService,) { }

  ngOnInit() {
    this.canAccessCurrentView$.subscribe(canAccess => {
      if (!canAccess) {
        this.setView('dashboard');
      }
    });
  }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string, data?: any): void {
    this.userRole$.pipe(
      map(userRole => this.canAccessTab(view, userRole))
    ).subscribe(canAccess => {
      if (canAccess) {
        this.store.dispatch(AdminPanelActions.setAdminPanelView({ view, data }));
        this.sideNavOpen = false;
      } else {
        // this.toastr.warning(`Access denied to ${view} for current user role`);
      }
    });
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

  private getAccessibleTabs(userRole: string): TabConfig[] {
    return this.tabsConfig.filter(tab => this.canAccessTab(tab.id, userRole));
  }

  private canAccessTab(tabId: string, userRole: string): boolean {
    const tab = this.tabsConfig.find(t => t.id === tabId);
    if (!tab) return false;

    return tab.requiredRoles.includes(userRole);
  }

  canAccessView(viewId: string): Observable<boolean> {
    return this.userRole$.pipe(
      map(userRole => this.canAccessTab(viewId, userRole))
    );
  }

  hasPermission(permission: string): Observable<boolean> {
    return this.userRole$.pipe(
      map(userRole => {
        const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
        return permissions.includes(permission);
      })
    );
  }

  getRoleDisplayName(): Observable<string> {
    return this.userRole$.pipe(
      map(role => {
        switch (role) {
          case 'chairman': return 'Chairman';
          case 'secretary': return 'Secretary';
          case 'treasurer': return 'Treasurer';
          default: return 'Admin';
        }
      })
    );
  }
}