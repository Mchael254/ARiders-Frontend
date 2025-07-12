import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { ResponsesService } from 'src/app/services/utilities/responses.service';
import { clearUpdateRiderTypeStatus, loadRiderTypes, updateProfileImage, updateRiderType, updateUserProfileSection } from 'src/app/store/auth/auth.actions';
import { AuthState } from 'src/app/store/auth/auth.reducer';
import { format } from 'date-fns';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/members/user.service';
import { selectRiderType, selectRiderTypes, selectUpdateRiderTypeError, selectUpdateRiderTypeLoading, selectUpdateRiderTypeSuccess } from 'src/app/store/auth/auth.selector';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-bio',
  templateUrl: './bio.component.html',
  styleUrls: ['./bio.component.css']
})
export class BioComponent implements OnInit {
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  riderTypes$ = this.store.pipe(select(selectRiderTypes));
  selectedRiderType$ = this.store.pipe(select(selectRiderType));
  updateRiderTypeLoading$ = this.store.pipe(select(selectUpdateRiderTypeLoading));
  updateRiderTypeSuccess$ = this.store.pipe(select(selectUpdateRiderTypeSuccess));
  updateRiderTypeError$ = this.store.pipe(select(selectUpdateRiderTypeError));
  clickedRiderType = false;
  successMessageVisible = false;
  selectedRiderTypeId: string | null = null;


  basicForm!: FormGroup;
  addressForm!: FormGroup;
  contactForm!: FormGroup;

  previewImage: string | null = null;
  faPen = faPen;
  profileBtn: boolean = true;
  fileInput: any;
  selectedFile: File | null = null;
  isUploading = false;
  profileId: string | null = null;
  email: string | null = null

  originalProfile: any;
  genderOptions = [
    { label: 'Select Gender', value: null },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];
  selectedGender: string | null = null;
  today: Date = new Date();


  constructor(
    private response: ResponsesService,
    private userService: UserService,
    private store: Store<{ auth: AuthState }>,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private requestPasswordChange: AuthService,
    private toastr: ToastrService,
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile) {
          this.originalProfile = profile;
          this.profileId = profile.user?.id || null;
          this.email = profile.user?.email || null;

          this.basicForm = this.fb.group({
            first_name: [profile.user?.first_name || ''],
            last_name: [profile.user?.last_name || ''],
            middle_name: [profile.user?.middle_name || ''],
            gender: [profile.user?.gender || ''],
            dob: [profile.user?.dob ? new Date(profile.user?.dob) : null],
          });

          this.addressForm = this.fb.group({
            city: [profile.user?.city || ''],
            county: [profile.user?.county || ''],
          });

          this.contactForm = this.fb.group({
            phone_number: [profile.user?.phone_number || '', [Validators.pattern(/^$|^\d{10}$/)]],
            emergency_phone: [profile.user?.emergency_phone || '', [Validators.pattern(/^$|^\d{10}$/)]],
            work_phone: [profile.user?.work_phone || '', [Validators.pattern(/^$|^\d{10}$/)]],
          });
        }
      });

    this.store.dispatch(loadRiderTypes());

    this.store.select(selectUpdateRiderTypeSuccess).pipe(
      distinctUntilChanged()
    ).subscribe(success => {
      if (success) {
        this.successMessageVisible = true;
        setTimeout(() => {
          this.successMessageVisible = false;
          this.store.dispatch(clearUpdateRiderTypeStatus());
        }, 3000);
      }
    });

    this.updateRiderTypeLoading$
      .pipe(distinctUntilChanged())
      .subscribe(loading => {
        if (loading) {
          this.spinner.show();
        } else {
          this.spinner.hide();
        }
      });

  }

  selectRiderType(type: { id: string, type_name: string }) {
    this.clickedRiderType = true;
    this.selectedRiderTypeId = type.id;

    this.store.dispatch(updateRiderType({
      memberId: this.profileId!,
      riderTypeId: type.id
    }));

    // Subscribe once to success to toggle success message
    this.store.select(selectUpdateRiderTypeSuccess).pipe(
      filter(success => success === true),
      take(1)
    ).subscribe(() => {
      this.successMessageVisible = true;
      setTimeout(() => this.successMessageVisible = false, 3000);
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
    const dobDate: Date = this.basicForm.value.dob;
    const dobStr = dobDate ? format(dobDate, 'yyyy-MM-dd') : null;

    const updated = {
      ...this.basicForm.value,
      dob: dobStr
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

    // Check validity
    if (this.contactForm.invalid) {
      this.response.showWarning("Each contact must be exactly 10 digits.");
      return;
    }

    // Check for duplicate numbers
    const numbers = [
      updated.phone_number?.trim(),
      updated.emergency_phone?.trim(),
      updated.work_phone?.trim()
    ].filter(Boolean);

    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      this.response.showWarning("You cannot use the same number in more than one field.");
      return;
    }

    // If all checks pass, save
    this.contactForm.markAsPristine();
    this.store.dispatch(updateUserProfileSection({
      section: 'contact',
      data: updated,
      userId
    }));
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.selectedFile = file;
    }
  }

  cancelImageChange(): void {
    this.previewImage = null;
    this.selectedFile = null;
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  uploadImage(userId: string): void {
    if (!this.selectedFile) return;

    this.response.showSpinner();

    this.userService.uploadProfileImage(userId, this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.previewImage = null;
          this.selectedFile = null;
          this.fileInputRef.nativeElement.value = '';
          this.response.showSuccess('Profile picture updated');
          this.store.dispatch(updateProfileImage({ profile_image: response.imageUrl }));
          this.response.hideSpinner();
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.response.showError('Upload failed');
          this.previewImage = null;
          this.selectedFile = null;
          this.fileInputRef.nativeElement.value = '';
          this.response.hideSpinner();

        },
      });
  }

  selectedTheme: string = 'System';
  selectedUnit: string = 'Metric';


  selectTheme(theme: string) {
    this.selectedTheme = theme;
    // Add theme change logic here
  }

  selectUnit(unit: string) {
    this.selectedUnit = unit;
  }

  openNotificationSettings() {
    // Add notification settings logic here
  }

  requestPasswordReset(email: string) {
    this.spinner.show();
    this.requestPasswordChange.sendPasswordReset(email).subscribe({
      next: ({ error }) => {
        this.spinner.hide();
        if (error) {
          this.toastr.error('Failed to send password reset email');
        } else {
          this.toastr.success('Password reset email sent');
        }
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Something went wrong');
      }
    });
  }




}
