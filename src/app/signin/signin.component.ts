import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponsesService } from '../services/utilities/responses.service';
import { Router } from '@angular/router';
import { combineLatest, filter } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAuthError, selectAuthRole, selectIsAuthenticated } from '../store/auth/auth.selector';
import * as AuthActions from '../store/auth/auth.actions';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {

  isLoading = false;
  loadingLine: boolean = false;
  visible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private requestPasswordChange: AuthService,
    private router: Router,
    private store: Store,
    private toastr: ToastrService,
  ) { }

  // Signin form 
  signinForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  // Forgot password form 
  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)]]
  });


  ngOnInit(): void {
    combineLatest([
      this.store.select(selectIsAuthenticated),
      this.store.select(selectAuthRole),
      this.store.select(selectAuthError)
    ])
      .pipe(filter(([auth, role, error]) => auth || !!error))
      .subscribe(([authenticated, role, error]) => {
        this.loadingLine = false;

        if (authenticated) {
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (role === 'member') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        }

        if (error) {
          this.toastr.error(error);
        }
      });
  }

  inputValidator(): boolean {
    const email = this.signinForm.get('email')?.value || '';
    const password = this.signinForm.get('password')?.value || '';

    if (password === '' || email === '' || password.length < 8) {
      this.toastr.warning('Check fields ⚠️');
      return false;
    }

    return true;
  }

  onSignIn(): void {
    if (!this.inputValidator()) {
      this.loadingLine = false;
      return;
    }

    this.isLoading = true;
    this.loadingLine = true;

    setTimeout(() => {
      const form = this.signinForm.getRawValue();
      this.store.dispatch(AuthActions.login({
        email: form.email!,
        password: form.password!
      }));

      this.isLoading = false;
      this.loadingLine = false;
    }, 3000);
  }

  showDialog() {
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
    this.forgotPasswordForm.reset();
  }

  forgotPasswordValidator(): boolean {
    const email = this.forgotPasswordForm.get('email')?.value || '';

    if (email === '' || this.forgotPasswordForm.get('email')?.invalid) {
      return false;
    }

    return true;
  }

  passwordValue: string = '';
  onForgotPasswordSubmit() {
    this.forgotPasswordForm.markAllAsTouched();

    if (!this.forgotPasswordValidator()) {
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value ?? '';

    this.spinner.show();
    this.requestPasswordChange.sendPasswordReset(email).subscribe({
      next: ({ error }) => {
        this.spinner.hide();
        if (error) {
          this.toastr.error('Failed to send password reset email');
        } else {
          this.toastr.success(`Password reset email sent to ${email}`);
          this.closeDialog()
        }
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Something went wrong');
      }
    });
  }

  get forgotPasswordEmail() {
    return this.forgotPasswordForm.get('email');
  }
}
