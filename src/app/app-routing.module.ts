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
import { PaymentComponent } from './payment/payment.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LandingComponent } from './landing/landing.component';
import { authGuard } from './guards/auth/auth.guard';
import { RegistrationComponent } from './registration/registration.component';
import { TermsComponent } from './terms/terms.component';
import { PaymentRecordsComponent } from './payment-records/payment-records.component';


const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },

  { path: 'signup', component: SignupComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'registration', component: RegistrationComponent },
  {path:'terms', component:TermsComponent},

  // member
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'membership', component: MembershipComponent, canActivate: [authGuard] },
  { path: 'bio', component: BioComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentComponent},
  {path: 'payment-records', component:PaymentRecordsComponent},


  // shared
  { path: 'spinner', component: SpinnerComponent },
  { path: 'footer', component: FooterComponent },

  //admin
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },

  //payment
  { path: 'payment', component: PaymentComponent },

  { path: '**', component: PageNotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
