import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { signupForm } from '../interfaces/authInterface';
import { ToastrService } from 'ngx-toastr';
import { MailMessageService } from '../services/email/mail-message.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  constructor(private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private emailService: MailMessageService,
    private spinner: NgxSpinnerService,
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
      this.toastr.error('Passwords do not match ⚠️');
      this.loadingLine = false;
      return false;
    }

    setTimeout(() => {
      this.loadingLine = false;
    }, 3000);

    return true;

  }

  onSignUp() {
    this.loadingLine = true;
    const form = this.signupForm.getRawValue() as signupForm;
    const userData = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      password: form.password,
      phone_number: form.phoneNumber
    };

    //validate form after 3 seconds
    setTimeout(() => {
      this.allFieldsValidator();

      if (!this.signupForm.valid) {
        this.loadingLine = false;
        return;
      }

      if (!this.passwordMatch()) {
        this.loadingLine = false;
        return;
      }

      this.loadingLine = false;
      this.spinner.show();

      this.auth.register(userData).subscribe({
        next: async (result) => {
          this.toastr.success("Success, check your email for more details");
          this.spinner.hide();
          this.router.navigate(['/signin']);

          // Load template
          const templateHtml = await this.emailService.generateWelcomeEmail(form.firstName);

          this.emailService.sendWelcomeEmail({
            first_name: form.firstName,
            email: form.email,
            templateHtml
          }).subscribe({
            next: () => console.log('Welcome email sent!'),
            error: (err: any) => console.error('Error sending welcome email:', err)
          });
        },
        error: (err) => {
          const errorMessage = err?.error?.message || err?.error?.error || 'An unexpected error occurred';
          this.toastr.error(errorMessage);
          console.error('Registration error:', err);
          this.loadingLine = false;
          this.spinner.hide();
        }
      });
    }, 3000);
  }

}
