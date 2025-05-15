import { Injectable } from '@angular/core';
import { AES, enc } from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly encryptionKey = '9iun09jkpo39f3-dk&%#21gfhYYhjUP0(*@!RYEH5500%';

  constructor() { }

  public encrypt(data: any): string {
    return AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  public decrypt(encryptedData: string): any {
    const bytes = AES.decrypt(encryptedData, this.encryptionKey);
    return JSON.parse(bytes.toString(enc.Utf8));
  }
}
