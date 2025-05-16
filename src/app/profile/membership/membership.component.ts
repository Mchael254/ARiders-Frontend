import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ResponsesService } from 'src/app/services/responses.service';
import { updateProfileImage } from 'src/app/store/auth/auth.actions';
import { AuthState } from 'src/app/store/auth/auth.reducer';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css'],
})
export class MembershipComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  profile$!: Observable<AuthState>;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient,
    private response: ResponsesService,
    private store: Store<{ auth: AuthState }>) {
    this.profile$ = this.store.pipe(select('auth'));

  }


  previewImage: string | null = null;
  faPen = faPen;
  profileBtn: boolean = true;
  fileInput: any;
  selectedFile: File | null = null;
  isUploading = false;
  profileId: string | null = null;

  ngOnInit(): void {
    this.store
      .pipe(select('auth'), takeUntil(this.destroy$))
      .subscribe((state) => {
        this.profileId = state.user?.id || null;
      });
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

  uploadImage(): void {
    if (!this.selectedFile || !this.profileId) {
      this.response.showError('No picture selected');
      return;
    }

    this.response.showSpinner();

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('userId', this.profileId);
    this.http
      .post<any>('http://localhost:3000/user/upload-profile-picture', formData)
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
          this.response.hideSpinner();
        },
      });
  }
}
