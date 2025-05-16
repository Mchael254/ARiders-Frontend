import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

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
    if (!this.selectedFile) return;

    this.response.showSpinner();

    const userId = '99443178-66b5-44bb-9b0a-f119e6b4083e';

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('userId', userId);
    this.http
      .post<any>('http://localhost:3000/user/upload-profile-picture', formData)
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
