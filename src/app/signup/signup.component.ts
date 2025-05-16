import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ResponsesService } from '../services/responses.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { signupForm } from '../interfaces/authInterface';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  constructor(private fb: FormBuilder,
    private response: ResponsesService,
    private auth: AuthService,
    private router: Router) { }

  signupForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    role: []

  });

  loadingLine: boolean = false

  //all fields validator
  allFieldsValidator() {
    Object.values(this.signupForm.controls).forEach(control => {
      control.markAsTouched();
    })
    return;
  }

  //password validator
  passwordMatch(): boolean {
    this.loadingLine = true

    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.response.showError('Passwords do not match ⚠️');
      this.loadingLine = false;
      return false;
    }

    setTimeout(() => {
      this.loadingLine = false;
    }, 3000);

    return true;

  }

  onSignUp() {
    this.allFieldsValidator()

    if (!this.signupForm.valid) {
      return;
    }

    if (!this.passwordMatch()) {
      return;
    }

    const form = this.signupForm.getRawValue() as signupForm
    console.log(form);
    const userData = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      password: form.password,
      phone_number: form.phoneNumber
    }

    this.auth.register(userData).subscribe({
      next: (result) => {
        this.response.showSuccess(result.message);

        this.router.navigate(['/signin']);
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.error?.error || 'An unexpected error occurred';
        this.response.showError(errorMessage);
        console.error('Registration error:', err);
        this.loadingLine = false
      }

    })

  }

}
