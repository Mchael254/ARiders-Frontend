import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { DashboardComponent } from './profile/dashboard/dashboard.component';
import { MembershipComponent } from './profile/membership/membership.component';
import { BioComponent } from './profile/bio/bio.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { AdminComponent } from './admins/admin/admin.component';
import { SettingsComponent } from './admins/settings/settings.component';
import { AdminEventsComponent } from './admins/admin-events/admin-events.component';
import { ContributionsComponent } from './admins/contributions/contributions.component';
import { MembersComponent } from './admins/members/members.component';
import { PaymentComponent } from './payment/payment.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LandingComponent } from './landing/landing.component';
import { ResetPasswordComponent } from './profile/reset-password/reset-password.component';
import { MembershippComponent } from './membershipp/membershipp.component';

const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },

  //landing components
  {path:'landing', component:LandingComponent},
  

  { path: 'signup', component: SignupComponent },
  { path: 'signin', component: SigninComponent },

  // member
  { path: 'dashboard', component: DashboardComponent },
  { path: 'membership', component: MembershipComponent },
  { path: 'bio', component: BioComponent },
  {path:'resetPassword', component:ResetPasswordComponent},
  {path:'payment', component:PaymentComponent},


  // shared
  { path: 'spinner', component: SpinnerComponent },
  { path: 'footer', component: FooterComponent },

  //admin
  { path: 'admin', component: AdminComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'admin-events', component: AdminEventsComponent },
  { path: 'contributions', component: ContributionsComponent },
  {path: 'members', component:MembersComponent},
  {path: 'membershipp', component:MembershippComponent},


  //payment
  {path: 'payment', component:PaymentComponent},

  {path: '**', component:PageNotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
