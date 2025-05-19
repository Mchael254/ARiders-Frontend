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
    ReportsComponent

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
    EffectsModule.forRoot([AuthEffects]),
    StoreModule.forRoot(reducers, { metaReducers }),
  ],
  providers: [
    MessageService,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
