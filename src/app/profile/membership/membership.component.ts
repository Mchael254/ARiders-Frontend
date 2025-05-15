import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { faPen } from '@fortawesome/free-solid-svg-icons';

import { ResponsesService } from 'src/app/services/responses.service';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css'],
})
export class MembershipComponent {
  constructor(private http: HttpClient, private response: ResponsesService) { }
  previewImage: string | null = null;
  faPen = faPen;
  profileBtn: boolean = true;
  fileInput: any;
  selectedFile: File | null = null;

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
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    const userId = '99443178-66b5-44bb-9b0a-f119e6b4083e';

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('userId', userId);
    this.http
      .post<any>('http://localhost:3000/user/upload-profile-picture', formData)
      .subscribe({
        next: (response) => {
          this.previewImage = null;
          this.response.showSuccess('profile pic updated');
        },
        error: (err) => {
          console.error('Upload failed', err);
        },
      });
  }
}
