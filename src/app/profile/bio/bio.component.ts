import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ResponsesService } from 'src/app/services/responses.service';
import { updateUserProfileSection } from 'src/app/store/auth/auth.actions';
import { AuthState } from 'src/app/store/auth/auth.reducer';


@Component({
  selector: 'app-bio',
  templateUrl: './bio.component.html',
  styleUrls: ['./bio.component.css']
})
export class BioComponent implements OnInit {
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();

  basicForm!: FormGroup;
  addressForm!: FormGroup;
  contactForm!: FormGroup;

  originalProfile: any;
  genderOptions = [
    { label: 'Select Gender', value: null },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  selectedGender: string | null = null;
  profileId: string | null = null;
  today: Date = new Date();


  constructor(
    private response: ResponsesService,
    private actions$: Actions,
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
          gender: [profile.gender || ''],
          dob: [profile.dob ? new Date(profile.dob) : null],
        });

        this.addressForm = this.fb.group({
          city: [profile.city || ''],
          county: [profile.county || ''],
        });

        this.contactForm = this.fb.group({
          phone_number: [profile.phone_number || '', [Validators.pattern(/^$|^\d{10}$/)]],
          emergency_phone: [profile.emergency_phone || '', [Validators.pattern(/^$|^\d{10}$/)]],
          work_phone: [profile.work_phone || '', [Validators.pattern(/^$|^\d{10}$/)]],

        });
      }
    });

    this.store
      .pipe(select('auth'), takeUntil(this.destroy$))
      .subscribe((state) => {
        this.profileId = state.user?.id || null;
      });


  }

  resetForm(section: 'basic' | 'address' | 'contact') {
    if (section === 'basic') {
      this.basicForm.reset({
        first_name: this.originalProfile.first_name || '',
        last_name: this.originalProfile.last_name || '',
        middle_name: this.originalProfile.middle_name || '',
        gender: this.originalProfile.gender || '',
        dob: this.originalProfile.dob || '',
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
        emergency_phone: this.originalProfile.emergency_phone || '',
        work_phone: this.originalProfile.work_phone || '',

      });
    }
  }

  saveBasic(userId: string | number) {
    const updated = {
      ...this.basicForm.value,
      dob: this.basicForm.value.dob ? this.basicForm.value.dob.toISOString().split('T')[0] : null
    };

    if (this.basicForm.invalid) {
      this.response.showWarning('Please fix the errors in the form.');
      return;
    }

    this.store.dispatch(updateUserProfileSection({ section: 'basic', data: updated, userId }));
  }

  saveAddress(userId: string | number) {
    const updated = this.addressForm.value;
    // console.log('Saving address info:', updated);
    this.addressForm.markAsPristine();
    this.store.dispatch(updateUserProfileSection({ section: 'address', data: updated, userId: userId }));
    this.basicForm.markAsPristine();
  }

  saveContact(userId: string | number) {
    const updated = this.contactForm.value;
    // console.log('Saving contact info:', updated);
    if (this.contactForm.invalid) {
      this.response.showWarning("contact must be exactly 10 digits");
      return;
    }

    this.contactForm.markAsPristine();
    this.store.dispatch(updateUserProfileSection({ section: 'contact', data: updated, userId: userId }));
    this.basicForm.markAsPristine();

  }



}
