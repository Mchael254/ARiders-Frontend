import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, take } from 'rxjs';
import { selectAuthRole, selectIsAuthenticated } from '../../store/auth/auth.selector';

const ROLE_PERMISSIONS = {
  chairman: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'financial_reports', 'manage_meetings', 'manage_documents'],
  secretary: ['view_all', 'edit_meetings', 'manage_documents', 'view_users'],
  treasurer: ['view_all', 'financial_reports', 'manage_finances', 'view_users'],
  user: ['view_own', 'edit_own'],
  member: ['view_limited'],
  guest: ['view_guest', 'register_events'],
  developer: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'financial_reports', 'manage_meetings', 'manage_documents']
};

const ADMIN_ROLES = ['chairman', 'secretary', 'treasurer', 'developer'];

const ROUTE_PERMISSIONS = {
  '/admin': ['view_all'],
  '/dashboard': [],
  '/home': []
};

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);

  return combineLatest([
    store.select(selectIsAuthenticated),
    store.select(selectAuthRole)
  ]).pipe(
    filter(([isAuthenticated, role]) => isAuthenticated !== null && role !== null),
    take(1),
    map(([isAuthenticated, role]) => {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.navigate(['/landing']);
        return false;
      }

      const requestedPath = state.url;
      const userPermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

      // Check if route requires specific permissions
      const requiredPermissions = getRequiredPermissions(requestedPath);

      // If no specific permissions required, allow access
      if (requiredPermissions.length === 0) {
        return true;
      }

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        if (ADMIN_ROLES.includes(role as string)) {
          router.navigate(['/admin']);
        } else if (role === 'user') {
          router.navigate(['/registration']);
        } else if (role === 'member') {
          router.navigate(['/dashboard']);
        } else if (role === 'guest') {
          router.navigate(['/guest-dashboard']);
        } else {
          router.navigate(['/landing']);
        }
        return false;
      }

      return true;
    })
  );

  function getRequiredPermissions(path: string): string[] {
    const routes = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);

    for (const routePath of routes) {
      if (path.startsWith(routePath)) {
        return ROUTE_PERMISSIONS[routePath as keyof typeof ROUTE_PERMISSIONS];
      }
    }

    return [];
  }

};


export function getRedirectPath(role: string): string {
  const adminRoles = ['chairman', 'secretary', 'treasurer', 'developer'];

  if (adminRoles.includes(role)) {
    return '/admin';
  } else if (role === 'user') {
    return '/registration';
  } else if (role === 'member') {
    return '/dashboard';
  } else if (role === 'guest') {
    return '/guest-dashboard';
  } else {
    return '/landing';
  }
}
