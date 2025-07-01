import { Component } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { DebtService } from 'src/app/services/debt.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  sideNavOpen: boolean = false;
  currentView = 'debts';
  faBars = faBars;

  constructor(private debtService: DebtService) { }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string): void {
    this.currentView = view;
    this.sideNavOpen = false;
  }

  logOut() {

  }

  ngOninit(){
    this.debtService.viewChange$.subscribe(view => {
    this.setView('debts');
  });
  }



}
