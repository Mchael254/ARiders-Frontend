import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../services/auth/auth.service';
import { selectAuthError, selectAuthRole, selectIsAuthenticated } from '../../store/auth/auth.selector';
import * as AuthActions from '../../store/auth/auth.actions';

@Component({
  selector: 'app-guest-signin',
  templateUrl: './guest-signin.component.html',
  styleUrls: ['./guest-signin.component.css']
})
export class GuestSigninComponent implements OnInit {
  guestSigninForm: FormGroup;
  forgotPasswordForm: FormGroup;
  passwordValue = '';
  loadingLine = false;
  visible = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: Store,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {
    // Initialize forms with proper validation
    this.guestSigninForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)]]
    });
  }

  ngOnInit(): void {
    // Listen for authentication state changes
    combineLatest([
      this.store.select(selectIsAuthenticated),
      this.store.select(selectAuthRole),
      this.store.select(selectAuthError)
    ]).pipe(
      filter(([authenticated, role, error]) => authenticated !== null)
    ).subscribe(([authenticated, role, error]) => {
      if (authenticated && role) {
        this.handleSuccessfulAuth(role);
      } else if (error) {
        this.loadingLine = false;
        this.isLoading = false;
        this.spinner.hide();
      }
    });
  }

  onGuestSignIn(): void {
    if (this.guestSigninForm.valid) {
      this.loadingLine = true;
      this.isLoading = true;
      this.spinner.show();

      const { email, password } = this.guestSigninForm.value;

      // Dispatch login action using the same endpoint as member signin
      this.store.dispatch(AuthActions.login({ email, password }));
    } else {
      this.markFormGroupTouched(this.guestSigninForm);
      this.toastr.error('Please fill in all required fields correctly');
    }
  }

  handleSuccessfulAuth(role: string): void {
    this.loadingLine = false;
    this.isLoading = false;
    this.spinner.hide();

    // Check if user is a guest and redirect accordingly
    if (role === 'guest') {
      this.toastr.success('Welcome back, Guest!');
      this.router.navigate(['/guest-dashboard']);
    } else {
      // If it's a member/other role, redirect to appropriate dashboard
      this.toastr.success('Welcome back!');
      this.redirectBasedOnRole(role);
    }
  }

  redirectBasedOnRole(role: string): void {
    const adminRoles = ['chairman', 'secretary', 'treasurer', 'developer'];

    if (adminRoles.includes(role)) {
      this.router.navigate(['/admin']);
    } else if (role === 'user') {
      this.router.navigate(['/registration']);
    } else if (role === 'member') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/landing']);
    }
  }

  showDialog(): void {
    this.visible = true;
  }

  closeDialog(): void {
    this.visible = false;
    this.forgotPasswordForm.reset();
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.spinner.show();
      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.sendPasswordReset(email).subscribe({
        next: (response) => {
          this.spinner.hide();
          this.toastr.success('Password reset email sent! Please check your inbox.');
          this.closeDialog();
        },
        error: (error) => {
          this.spinner.hide();
          const errorMessage = error?.error?.message || error?.message || 'Failed to send reset email';
          this.toastr.error(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched(this.forgotPasswordForm);
      this.toastr.error('Please enter a valid email address');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
