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

  selectedMemberId: string | null = null;
  viewData: any = {};

  constructor(private debtService: DebtService) { }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string, data?: any): void {
    this.currentView = view;
    this.sideNavOpen = false;
    
    // Store the data for the specific view
    if (data) {
      this.viewData[view] = data;
      
      // For memberDebt specifically, store the member ID
      if (view === 'memberDebt' && data.memberId) {
        this.selectedMemberId = data.memberId;
      }
    }
  }

  getViewData(view: string): any {
    return this.viewData[view] || {};
  }

  // Method to clear view data when needed
  clearViewData(view: string): void {
    delete this.viewData[view];
    if (view === 'memberDebt') {
      this.selectedMemberId = null;
    }
  }

  logOut() {

  }

  ngOninit(){
    this.debtService.viewChange$.subscribe(view => {
    this.setView('debts');
  });
  }



}
