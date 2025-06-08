import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: WebSocket;
  private messageSubject = new Subject<any>();

  constructor() {
    this.socket = new WebSocket('ws://localhost:5300/ws');

    this.socket.onopen = () => {
      console.log('✅ WebSocket connection opened');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };

    this.socket.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('❌ WebSocket connection closed');
    };
  }

  // Public observable to subscribe to messages
  public onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // Send a message (optional if you want client to emit)
  public send(data: any): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not open yet.');
    }
  }

  // Close the socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }

  // Angular lifecycle hook
  ngOnDestroy(): void {
    this.disconnect();
    this.messageSubject.complete();
  }
}
