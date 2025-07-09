import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponsesService } from 'src/app/services/utilities/responses.service';
import { SocketService } from 'src/app/services/utilities/socket.service';
import { PaymentService } from 'src/app/services/payment/payment.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {

  paymentForm: FormGroup;
  displayConfirmDialog = false;
  message: string | null = null;
  loading = false;
  private currentOrderId: string | null = null;

  private socketSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private response: ResponsesService,
    private socketService: SocketService,
    private paymentService: PaymentService
  ) {
    this.paymentForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(07|01)\d{8}$/)]],
      amount: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.socketSub = this.socketService.onMessage().subscribe((data: any) => {
      if (!data || data.event !== 'payment_status') return;

      this.response.hideSpinner();

      if (data.orderId !== this.currentOrderId) return;

      if (data.status === 'success') {
        this.response.showSuccess(`Payment successful: ${data.receipt}`);
        this.paymentForm.reset();
      } else {
        this.response.showError(data.message || 'Payment failed');
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
    this.response.showSpinner();

    const Order_ID = uuidv4();
    this.currentOrderId = Order_ID;

    const payload = {
      ...this.paymentForm.value,
      phone: this.paymentForm.value.phoneNumber.replace(/^0/, '254'),
      Order_ID
    };

    this.paymentService.initiateSTKPush(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.response.hideSpinner();

        if (res.CheckoutRequestID) {
          this.response.showSuccess('Check your phone.');
        } else {
          this.response.showError('Failed to initiate STK Push. Try again.');
        }
      },
      error: (err) => {
        this.loading = false;
        this.response.hideSpinner();
        console.error('Full error:', err);
        const message = err?.error?.message || err?.message || 'Payment request failed.';
        this.response.showError(message);
      }
    });
  }

  cancelPayment(): void {
    this.displayConfirmDialog = false;
    this.response.showError('You cancelled the payment');
    this.paymentForm.reset();
  }

  ngOnDestroy(): void {
    this.socketSub?.unsubscribe();
  }
}
