import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { GalleriaModule } from 'primeng/galleria';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { NgxSpinnerComponent, NgxSpinnerModule } from 'ngx-spinner';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { FooterComponent } from './footer/footer.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AdminComponent } from './admins/admin/admin.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DashboardComponent } from './profile/dashboard/dashboard.component';
import { BioComponent } from './profile/bio/bio.component';
import { HttpClientModule } from '@angular/common/http';
import { MembershipComponent } from './profile/membership/membership.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthEffects } from './store/auth/auth.effects';
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
import { MemberdebtComponent } from './admins/memberdebt/memberdebt.component';
import { LandingComponent } from './landing/landing.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { WhatwedoComponent } from './whatwedo/whatwedo.component';
import { TeamComponent } from './team/team.component';
import { MissionComponent } from './mission/mission.component';
import { PartnersComponent } from './partners/partners.component';
import { ResetPasswordComponent } from './profile/reset-password/reset-password.component';
import { ToastrModule } from 'ngx-toastr';
import { PasswordModule } from 'primeng/password';
import { AccordionModule } from 'primeng/accordion';
import { MembershippComponent } from './membershipp/membershipp.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment.development';
import { RegistrationComponent } from './registration/registration.component';
import { TermsComponent } from './terms/terms.component';
import { PaymentRecordsComponent } from './payment-records/payment-records.component';


@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SignupComponent,
    FooterComponent,
    NavigationComponent,
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
    DebtsComponent,
    MemberdebtComponent,
    LandingComponent,
    PageNotFoundComponent,
    HeroSectionComponent,
    AboutusComponent,
    WhatwedoComponent,
    TeamComponent,
    MissionComponent,
    PartnersComponent,
    ResetPasswordComponent,
    MembershippComponent,
    RegistrationComponent,
    TermsComponent,
    PaymentRecordsComponent,

  ],
  imports: [
    DropdownModule,
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastModule,
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
    ButtonModule,
    TagModule,
    AvatarModule,
    NgChartsModule,
    MenuModule,
    GalleriaModule,
    CarouselModule,
    TooltipModule,
    ChartModule,
    NgxSpinnerModule,
    NgxSpinnerComponent,
    PasswordModule,
    AccordionModule,

    

    NgxSpinnerModule.forRoot({ type: 'ball-clip-rotate-multiple' }),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    EffectsModule.forRoot([AuthEffects]),
    StoreModule.forRoot(reducers, { metaReducers },),
    StoreDevtoolsModule.instrument({maxAge:25, logOnly:environment.production})

  ],
  providers: [
    MessageService,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
