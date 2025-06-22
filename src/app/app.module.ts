import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { FooterComponent } from './footer/footer.component';
import { NavigationComponent } from './navigation/navigation.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admins/admin/admin.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DashboardComponent } from './profile/dashboard/dashboard.component';
import { BioComponent } from './profile/bio/bio.component';
import { HttpClientModule } from '@angular/common/http';
import { MembershipComponent } from './profile/membership/membership.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { metaReducers, reducers } from './store';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MembersComponent } from './admins/members/members.component';
import { SettingsComponent } from './admins/settings/settings.component';
import { ContributionsComponent } from './admins/contributions/contributions.component';
import { AdminEventsComponent } from './admins/admin-events/admin-events.component';
import { ReportsComponent } from './admins/reports/reports.component';
import { PaymentComponent } from './payment/payment.component';
import { NgChartsModule } from 'ng2-charts';
import { DebtsComponent } from './admins/debts/debts.component';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';




@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SignupComponent,
    FooterComponent,
    NavigationComponent,
    HomeComponent,
    AdminComponent,
    DashboardComponent,
    BioComponent,
    MembershipComponent,
    SpinnerComponent,
    MembersComponent,
    SettingsComponent,
    ContributionsComponent,
    AdminEventsComponent,
    ReportsComponent,
    PaymentComponent,
    DebtsComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastModule,
    ProgressSpinnerModule,
    ProgressSpinnerModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    ToolbarModule,
    InputTextModule,
    DialogModule,
    CardModule,
    InputNumberModule,
    ConfirmDialogModule,
    SelectButtonModule,
    TableModule,
    ButtonModule,
    TagModule,
    AvatarModule,
    CardModule,
    NgChartsModule,
    MenuModule,
    TooltipModule,
    EffectsModule.forRoot([AuthEffects]),
    StoreModule.forRoot(reducers, { metaReducers }),

  ],
  providers: [
    MessageService,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
