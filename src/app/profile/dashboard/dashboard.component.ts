import { Component } from '@angular/core';
import { faBars, faPen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  sideNavOpen: boolean = false;
  currentView = 'bio';
  faBars = faBars;
  faPen = faPen;
  previewImage: string | null = null;
  editProfileBtn: boolean = true;
  selectedFile: File | null = null;
  
  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string): void {
    this.currentView = view;
    this.sideNavOpen = false;
  }

    logout() {
    // this.store.dispatch(AuthActions.logout());
  }

   cancelImageChange(): void {
    this.previewImage = null;
    this.selectedFile = null;
  }

}
