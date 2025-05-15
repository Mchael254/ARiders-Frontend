import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ResponsesService {
  constructor(private messageService: MessageService) {}

  //success and error messages
  showSuccess(message: string, summary = 'Success') {
    this.messageService.add({
      severity: 'success',
      summary,
      detail: message,
      life: 3000,
    });
  }

  showError(message: string, summary = 'Error') {
    this.messageService.add({
      severity: 'error',
      summary,
      detail: message,
      life: 3000,
    });
  }

  showWarning(message: string, summary = 'Warning') {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail: message,
      life: 3000,
    });
  }

  clearMessage() {
    this.messageService.clear();
  }
}
