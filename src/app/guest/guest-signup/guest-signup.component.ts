import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { signupForm, guestSignupForm } from '../../interfaces/authInterface';
import { ToastrService } from 'ngx-toastr';
import { MailMessageService } from '../../services/email/mail-message.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-guest-signup',
  templateUrl: './guest-signup.component.html',
  styleUrls: ['./guest-signup.component.css']
})
export class GuestSignupComponent {
  constructor(private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private emailService: MailMessageService,
    private spinner: NgxSpinnerService,
    private router: Router) { }

  guestSignupForm = this.fb.group({
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
    Object.values(this.guestSignupForm.controls).forEach(control => {
      control.markAsTouched();
    })
    return;
  }

  //password validator
  passwordMatch(): boolean {
    this.loadingLine = true

    const password = this.guestSignupForm.get('password')?.value;
    const confirmPassword = this.guestSignupForm.get('confirmPassword')?.value;

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

  onGuestSignUp() {
    this.loadingLine = true;
    const form = this.guestSignupForm.getRawValue() as guestSignupForm;
    const userData = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      password: form.password,
      phone_number: form.phoneNumber,
      role: 'guest' // Specify guest role
    };

    //validate form after 3 seconds
    setTimeout(() => {
      this.allFieldsValidator();

      if (!this.guestSignupForm.valid) {
        this.loadingLine = false;
        return;
      }

      if (!this.passwordMatch()) {
        this.loadingLine = false;
        return;
      }

      this.loadingLine = false;
      this.spinner.show();

      this.auth.registerGuest(userData).subscribe({
        next: async (result) => {
          this.toastr.success("Guest registration successful! Welcome to A Riders Club");
          this.spinner.hide();
          this.router.navigate(['/guest-signin']);

          // Load template for guest welcome email
          const templateHtml = await this.emailService.generateWelcomeEmail(form.firstName);

          this.emailService.sendWelcomeEmail({
            first_name: form.firstName,
            email: form.email,
            templateHtml
          }).subscribe({
            next: () => console.log('Guest welcome email sent!'),
            error: (err: any) => console.error('Error sending guest welcome email:', err)
          });
        },
        error: (err) => {
          const errorMessage = err?.error?.message || err?.error?.error || 'An unexpected error occurred during guest registration';
          this.toastr.error(errorMessage);
          console.error('Guest registration error:', err);
          this.loadingLine = false;
          this.spinner.hide();
        }
      });
    }, 3000);
  }
}
