import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

import * as fromAuth from './auth/auth.reducer';
import { AES, enc } from 'crypto-js';

import { adminPanelReducer, AdminPanelState } from './panel/admin/reducer';
import { memberPanelReducer, MemberPanelState } from './panel/member/reducer';
import { guestPanelReducer, GuestPanelState } from './panel/guest/reducer';


export interface AppState {
  auth: fromAuth.AuthState;
  adminPanel: AdminPanelState;
  memberPanel: MemberPanelState;
  guestPanel: GuestPanelState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  adminPanel: adminPanelReducer,
  memberPanel: memberPanelReducer,
  guestPanel: guestPanelReducer
};


const encryptionKey = '9iun09jkpo39f3-dk&%#21gfhYYhjUP0(*@!RYEH5500%';

function encrypt(data: any): string {
  return AES.encrypt(JSON.stringify(data), encryptionKey).toString();
}

function decrypt(encryptedData: string): any {
  try {
    const bytes = AES.decrypt(encryptedData, encryptionKey);
    return JSON.parse(bytes.toString(enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// 👇 Meta-reducer for syncing 'auth' slice with localStorage
export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync({
    keys: ['auth'],
    rehydrate: true,
    storage: {
      setItem: (key: string, value: string): void => {
        const encrypted = encrypt(value);
        localStorage.setItem(key, encrypted);
      },
      getItem: (key: string): string | null => {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        return decrypt(encrypted);
      },
      removeItem: (key: string): void => {
        localStorage.removeItem(key);
      },
      clear(): void {
        localStorage.clear();
      },
      key(index: number): string | null {
        return localStorage.key(index);
      },
      get length(): number {
        return localStorage.length;
      }
    } satisfies Storage
  })(reducer);
}


export const metaReducers: MetaReducer[] = [localStorageSyncReducer];
