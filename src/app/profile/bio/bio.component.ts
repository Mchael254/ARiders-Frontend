import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthState } from 'src/app/store/auth/auth.reducer';


@Component({
  selector: 'app-bio',
  templateUrl: './bio.component.html',
  styleUrls: ['./bio.component.css']
})
export class BioComponent implements OnInit {
  profile$: Observable<AuthState>;

  basicForm!: FormGroup;
  addressForm!: FormGroup;
  contactForm!: FormGroup;

  originalProfile: any;

  constructor(
    private store: Store<{ auth: AuthState }>,
    private fb: FormBuilder
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.profile$.subscribe((profile) => {
      if (profile) {
        this.originalProfile = profile;

        this.basicForm = this.fb.group({
          first_name: [profile.first_name || ''],
          last_name: [profile.last_name || ''],
          middle_name: [profile.middle_name || ''],
        });

        this.addressForm = this.fb.group({
          city: [profile.city || ''],
          county: [profile.county || ''],
        });

        this.contactForm = this.fb.group({
          phone_number: [profile.phone_number || ''],
        });
      }
    });
  }


  resetForm(section: 'basic' | 'address' | 'contact') {
    if (section === 'basic') {
      this.basicForm.reset({
        first_name: this.originalProfile.first_name || '',
        last_name: this.originalProfile.last_name || '',
        middle_name: this.originalProfile.middle_name || '',
      });
    }

    if (section === 'address') {
      this.addressForm.reset({
        city: this.originalProfile.city || '',
        county: this.originalProfile.county || '',
      });
    }

    if (section === 'contact') {
      this.contactForm.reset({
        phone_number: this.originalProfile.phone_number || '',
      });
    }
  }

  saveBasic() {
    const updated = this.basicForm.value;
    console.log('Saving basic info:', updated);
    this.basicForm.markAsPristine();
    // dispatch updateProfile({ ...updated }) action here
  }

  saveAddress() {
    const updated = this.addressForm.value;
    console.log('Saving address info:', updated);
    this.addressForm.markAsPristine();
    // dispatch updateProfile({ ...updated }) action here
  }

  saveContact() {
    const updated = this.contactForm.value;
    console.log('Saving contact info:', updated);
    this.contactForm.markAsPristine();
    // dispatch updateProfile({ ...updated }) action here
  }

}
