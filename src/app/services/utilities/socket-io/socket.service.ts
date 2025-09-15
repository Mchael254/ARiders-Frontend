import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket;
  private messageSubject = new Subject<any>();

  constructor() {
    this.socket = io('wss://mpesa-dogr.onrender.com', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.registerSocketEvents();
  }

  private registerSocketEvents(): void {
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('❌ Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ Socket.IO connection error:', error);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Attempting to reconnect... (#${attempt})`);
    });

    this.socket.on('paymentStatus', (data) => {
      console.log('📨 Payment status received:', data);
      this.messageSubject.next(data);
    });
  }

  // ✅ NEW METHOD: Join a specific room for payment tracking
  public joinPaymentRoom(orderId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join', orderId);
      console.log(`🏠 Joined payment room: ${orderId}`);
    }
  }

  // ✅ NEW METHOD: Leave a specific room
  public leavePaymentRoom(orderId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave', orderId);
      console.log(`🚪 Left payment room: ${orderId}`);
    }
  }

  public onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  public disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.messageSubject.complete();
  }
}