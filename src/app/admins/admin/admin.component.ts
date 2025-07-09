import { Component } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { DebtService } from 'src/app/services/debt.service';
import { Store } from '@ngrx/store';
import { selectCurrentView, selectSelectedMemberId, selectViewData } from 'src/app/store/panel/selectors';
import { setPanelView } from 'src/app/store/panel/actions';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  currentView$ = this.store.select(selectCurrentView);
  selectedMemberId$ = this.store.select(selectSelectedMemberId);
  viewData$ = this.store.select(selectViewData);

  sideNavOpen = false;
  faBars = faBars;

  constructor(private store: Store) {}

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  setView(view: string, data?: any) {
    this.store.dispatch(setPanelView({ view, data }));
    this.sideNavOpen = false;
  }

  ngOnInit() {}

  logOut(){

  }



}
