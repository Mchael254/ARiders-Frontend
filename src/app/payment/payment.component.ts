import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponsesService } from 'src/app/services/utilities/responses.service';
import { SocketService } from 'src/app/services/utilities/socket.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  displayConfirmDialog = false;
  currentStatus: string | null = null;
  loading = false;
  transactionDetails: any = null;
  private currentOrderId: string | null = null;
  private socketSub: Subscription | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  onDialogClose() {
    this.visibleChange.emit(false);
    this.clearTransactionDetails(); 
  }

  constructor(
    private fb: FormBuilder,
    private response: ResponsesService,
    private socketService: SocketService,
    private paymentService: PaymentService,
    private toastr:ToastrService
  ) {
    this.paymentForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(07|01)\d{8}$/)]],
      amount: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.socketSub = this.socketService.onMessage().subscribe((data: any) => {
      console.log('📨 Socket message received:', data);

      if (!data || data.event !== 'payment_status') {
        console.log('❌ Invalid event or missing data');
        return;
      }

      if (data.orderId !== this.currentOrderId) {
        console.log(`❌ Order ID mismatch. Expected: ${this.currentOrderId}, Got: ${data.orderId}`);
        return;
      }

      console.log(`✅ Processing payment status for order: ${data.orderId}`);

      this.loading = false;
      this.response.hideSpinner();

      switch (data.status) {
        case 'success':
          this.transactionDetails = {
            receipt: data.receipt,
            transactionId: data.transactionId,
            amount: data.amount,
            phoneNumber: data.phoneNumber,
            transactionDate: data.transactionDate
          };
          this.currentStatus = `✅ Payment successful! Receipt: ${data.receipt}`;
          this.response.showSuccess('Payment completed successfully!');
          this.paymentForm.reset();

          // ✅ Leave the room after successful payment
          if (this.currentOrderId) {
            this.socketService.leavePaymentRoom(this.currentOrderId);
          }
          this.currentOrderId = null;
          console.log('💳 Transaction completed:', this.transactionDetails);
          break;

        case 'failed':
          this.currentStatus = `❌ ${data.message}`;
          this.response.showError(data.message);

          // ✅ Leave the room after failed payment
          if (this.currentOrderId) {
            this.socketService.leavePaymentRoom(this.currentOrderId);
          }
          this.currentOrderId = null;
          this.transactionDetails = null;
          break;

        case 'pending':
          this.currentStatus = `⌛ ${data.message}`;
          break;
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.displayConfirmDialog = true;
    }
  }

  confirmPayment(): void {
    this.displayConfirmDialog = false;
    this.loading = true;
    this.transactionDetails = null;
    this.response.showSpinner();
    this.currentStatus = "⌛ Initiating payment...";

    const orderId = uuidv4();
    this.currentOrderId = orderId;

    // ✅ Join the payment room BEFORE making the API call
    this.socketService.joinPaymentRoom(orderId);

    const payload = {
      phone: this.getFormattedInputPhone(),
      amount: this.paymentForm.value.amount,
      Order_ID: orderId
    };

    console.log('🚀 Initiating payment with payload:', payload);

    this.paymentService.initiateSTKPush(payload).subscribe({
      next: (res) => {
        console.log('📤 STK Push response:', res);
        if (res.CheckoutRequestID) {
          this.currentStatus = "📲 Check your phone and enter your M-Pesa PIN to complete payment.";
          this.toastr.success('Payment request sent! Check your phone.');
        } else {
          this.failWithMessage("❌ Failed to initiate payment. Please try again.");
        }
      },
      error: (err) => {
        console.error('❌ STK Push error:', err);
        const msg = err?.error?.message || err?.message || 'Payment request failed. Please try again.';
        this.failWithMessage(`❌ ${msg}`);
      }
    });
  }

  private failWithMessage(message: string): void {
    this.loading = false;
    this.response.hideSpinner();
    this.currentStatus = message;
    this.response.showError(message);

    // ✅ Leave the room on failure
    if (this.currentOrderId) {
      this.socketService.leavePaymentRoom(this.currentOrderId);
      this.currentOrderId = null;
    }
  }

  getFormattedInputPhone(): string {
    const phone = this.paymentForm.value.phoneNumber;
    return phone ? phone.replace(/^0/, '254') : '';
  }

  cancelPayment(): void {
    this.displayConfirmDialog = false;
    this.currentStatus = "🚫 Payment cancelled.";
    this.response.showError('Payment cancelled.');
    this.paymentForm.reset();
  }

  getFormattedTransactionDate(): string {
    const dateStr = this.transactionDetails?.transactionDate?.toString();
    if (dateStr?.length === 14) {
      return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}/${dateStr.slice(0, 4)} ${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}`;
    }
    return this.transactionDetails?.transactionDate || 'N/A';
  }

  getFormattedPhoneNumber(): string {
    const phone = this.transactionDetails?.phoneNumber?.toString();
    return phone?.startsWith('254') ? phone.replace('254', '0') : phone || 'N/A';
  }

  clearTransactionDetails(): void {
    this.transactionDetails = null;
    this.currentStatus = null;
  }

  ngOnDestroy(): void {
    // ✅ Leave current room before destroying component
    if (this.currentOrderId) {
      this.socketService.leavePaymentRoom(this.currentOrderId);
    }

    this.socketSub?.unsubscribe();
    this.socketService.disconnect();
  }
}