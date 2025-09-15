import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth/auth.service';



@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  newPassword = '';
  confirmPassword = '';
  loading = false;

  constructor(
    private resetPassword: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) { }

  changePassword() {
    this.spinner.show();
    this.loading = true;
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }
    this.resetPassword.resetPassword(this.newPassword).subscribe({
      next: ({ error }) => {
        this.loading = false;
        this.spinner.hide();
        if (error) {
          this.handleSupabaseAuthError(error);
        } else {
          this.toastr.success('Password updated successfully');
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Something went wrong');
      }
    });
  }

  handleSupabaseAuthError(error: any) {
    const msg = error?.message || '';

    if (msg.includes('Auth session missing')) {
      this.toastr.error('Link has expired. Please try again.');
    } else if (msg.includes('JWT expired')) {
      this.toastr.error('Your session token has expired. Please sign in again.');
    } else {
      this.toastr.error(msg || 'Failed to complete the action. Please try again.');
    }
  }



}

