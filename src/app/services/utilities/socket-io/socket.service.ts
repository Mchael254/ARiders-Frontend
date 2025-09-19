import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket;
  private messageSubject = new Subject<any>();
  private connectionStateSubject = new BehaviorSubject<boolean>(false);
  private reconnectingStateSubject = new BehaviorSubject<boolean>(false);
  private currentPaymentRoom: string | null = null;

  constructor() {
    this.socket = io('wss://mpesa-dogr.onrender.com', {
      transports: ['websocket'],
      reconnectionAttempts: 10, // Increased attempts
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 15000,
      forceNew: true
    });

    this.registerSocketEvents();
  }

  private registerSocketEvents(): void {
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      this.connectionStateSubject.next(true);
      this.reconnectingStateSubject.next(false);

      // Rejoin payment room if we were in one before disconnection
      if (this.currentPaymentRoom) {
        console.log(`🔄 Rejoining payment room: ${this.currentPaymentRoom}`);
        this.socket.emit('join', this.currentPaymentRoom);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('❌ Socket.IO disconnected:', reason);
      this.connectionStateSubject.next(false);

      // Only trigger reconnecting state if it's an unexpected disconnect
      if (reason !== 'io client disconnect') {
        this.reconnectingStateSubject.next(true);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ Socket.IO connection error:', error);
      this.connectionStateSubject.next(false);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Attempting to reconnect... (#${attempt})`);
      this.reconnectingStateSubject.next(true);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ Successfully reconnected after ${attempt} attempts`);
      this.reconnectingStateSubject.next(false);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts');
      this.reconnectingStateSubject.next(false);
    });

    this.socket.on('paymentStatus', (data) => {
      console.log('📨 Payment status received:', data);
      this.messageSubject.next(data);
    });
  }

  // ✅ NEW METHOD: Join a specific room for payment tracking
  public joinPaymentRoom(orderId: string): void {
    this.currentPaymentRoom = orderId;
    if (this.socket?.connected) {
      this.socket.emit('join', orderId);
      console.log(`🏠 Joined payment room: ${orderId}`);
    } else {
      console.warn(`⚠️ Socket not connected, will join room ${orderId} on reconnect`);
    }
  }

  // ✅ NEW METHOD: Leave a specific room
  public leavePaymentRoom(orderId: string): void {
    if (this.currentPaymentRoom === orderId) {
      this.currentPaymentRoom = null;
    }
    if (this.socket?.connected) {
      this.socket.emit('leave', orderId);
      console.log(`🚪 Left payment room: ${orderId}`);
    }
  }

  public onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  public getConnectionState(): Observable<boolean> {
    return this.connectionStateSubject.asObservable();
  }

  public getReconnectingState(): Observable<boolean> {
    return this.reconnectingStateSubject.asObservable();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getCurrentPaymentRoom(): string | null {
    return this.currentPaymentRoom;
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