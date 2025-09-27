import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth/auth.service';



@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  newPassword = '';
  confirmPassword = '';
  loading = false;
  isValidSession = false;
  initializing = true;

  constructor(
    private resetPassword: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Try Angular's ActivatedRoute first, fallback to window.location if needed
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.validateResetSession(fragment);
      } else {
        // Fallback to window.location.hash if Angular route fragment is empty
        setTimeout(() => {
          const windowFragment = window.location.hash.substring(1);
          if (windowFragment) {
            this.validateResetSession(windowFragment);
          } else {
            this.handleInvalidSession();
          }
        }, 1000);
      }
    });
  }

  private validateResetSession(fragment: string) {
    const hasAuthTokens = fragment.includes('access_token') && fragment.includes('type=recovery');
    
    if (hasAuthTokens) {
      // Parse the URL fragment to get token details
      const params = new URLSearchParams(fragment);
      const type = params.get('type');
      const accessToken = params.get('access_token');
      
      if (type === 'recovery' && accessToken) {
        // Valid reset session detected - only set these once
        if (!this.isValidSession) {
          this.initializing = false;
          this.isValidSession = true;
          this.toastr.info('Please enter your new password');
        }
      } else {
        this.handleInvalidSession(`Invalid reset link format`);
      }
    } else {
      this.handleInvalidSession('Invalid reset link. Please request a new password reset.');
    }
  }

  private handleInvalidSession(message: string = 'Invalid reset link. Please request a new password reset.') {
    if (!this.isValidSession) { // Only show error if we haven't already validated successfully
      this.initializing = false;
      this.toastr.error(message);
      this.router.navigate(['/signin']);
    }
  }

  changePassword() {
    if (!this.isValidSession) {
      this.toastr.error('Invalid session. Please request a new password reset.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastr.error('Password must be at least 6 characters long');
      return;
    }

    this.spinner.show();
    this.loading = true;
    
    this.resetPassword.resetPassword(this.newPassword).subscribe({
      next: ({ error }) => {
        this.loading = false;
        this.spinner.hide();
        if (error) {
          this.handleSupabaseAuthError(error);
        } else {
          this.toastr.success('Password updated successfully! Please sign in with your new password.');
          this.router.navigate(['/signin']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.spinner.hide();
        this.handleSupabaseAuthError(error);
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

