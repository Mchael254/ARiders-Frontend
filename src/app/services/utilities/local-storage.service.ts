import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor(private en: EncryptionService) { }

  setItem(key: string, value: any): void {
    const encryptedValue = this.en.encrypt(value);
    localStorage.setItem(key, encryptedValue)
  }

  getItem(key: string): any {
    const encryptedValue = localStorage.getItem(key);
    return encryptedValue ? this.en.decrypt(encryptedValue) : null;

  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
