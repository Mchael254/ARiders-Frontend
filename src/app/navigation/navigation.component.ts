import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthState } from '../store/auth/auth.reducer';
import * as AuthActions from '../../app/store/auth/auth.actions';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  isMobileMenuOpen: boolean = false;
  items: any | undefined;
  private mobileMenuElement: HTMLElement | null = null;
  private menuButtonElement: HTMLElement | null = null;
  isActive: boolean = true
  isUserMenuOpen = false;

  constructor(private route: Router, private store: Store<{ auth: AuthState }>,) { }

  ngAfterViewInit() {
    this.mobileMenuElement = document.getElementById('mobile-menu');
    this.menuButtonElement = document.querySelector('[aria-controls="mobile-menu"]');
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.isMobileMenuOpen) return;

    const target = event.target as HTMLElement;
    const isClickInsideMenu = this.mobileMenuElement?.contains(target);
    const isClickOnMenuButton = this.menuButtonElement?.contains(target);

    if (!isClickInsideMenu && !isClickOnMenuButton) {
      this.isMobileMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  ngOnDestroy() {
    this.mobileMenuElement = null;
    this.menuButtonElement = null;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Get started',
        items: [
          {
            label: 'sign up',
            icon: 'pi pi-plus',
            command: () => {
              this.route.navigate(['/signup'])
            }
          },
          {
            label: 'sign in',
            icon: 'pi pi-sign-in',
            command: () => {
              this.route.navigate(['/signin'])
            }
          }
        ]
      }
    ];
  }

  logOut() {
    if (confirm('Are you sure you want to logout?')) {
      this.store.dispatch(AuthActions.logout());
    }
  }

}
