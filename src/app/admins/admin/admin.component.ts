import { Component } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  sideNavOpen: boolean = false;
  currentView = 'debts';
  faBars = faBars;

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string): void {
    this.currentView = view;
    this.sideNavOpen = false;
  }

  logOut() {

  }

}
