import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResponsesService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private messageService: MessageService) {}

  // Toast notifications
  showSuccess(message: string, summary = 'Success') {
    this.messageService.add({ severity: 'success', summary, detail: message, life: 3000 });
  }

  showError(message: string, summary = 'Error') {
    this.messageService.add({ severity: 'error', summary, detail: message, life: 3000 });
  }

  showWarning(message: string, summary = 'Warning') {
    this.messageService.add({ severity: 'warn', summary, detail: message, life: 3000 });
  }

  clearMessage() {
    this.messageService.clear();
  }

  // Spinner controls
  showSpinner() {
    this.loadingSubject.next(true);
  }

  hideSpinner() {
    this.loadingSubject.next(false);
  }
}
