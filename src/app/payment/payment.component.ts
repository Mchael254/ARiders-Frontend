import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, Observable, Subject, Subscription, switchMap, takeUntil, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponsesService } from 'src/app/services/utilities/toaster/responses.service';
import { SocketService } from 'src/app/services/utilities/socket-io/socket.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { ToastrService } from 'ngx-toastr';
import { AuthState } from '../store/auth/auth.reducer';
import { select, Store } from '@ngrx/store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {
  profile$: Observable<AuthState>;
  paymentForm: FormGroup;
  displayConfirmDialog = false;
  currentStatus: string | null = null;
  loading = false;
  transactionDetails: any = null;
  pdfTitle: string = ''
  private currentOrderId: string | null = null;
  private socketSub: Subscription | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() paymentSuccess = new EventEmitter<void>();
  @Output() paymentClosed = new EventEmitter<void>();
  @Input() prefilledAmount: number | null = null;

  @Input() paymentTypeId!: string;
  @Input() paymentTypeName: string = '';
  memberId = '';
  private destroy$ = new Subject<void>();
  get isAmountPrefilled(): boolean {
    return this.prefilledAmount !== null && this.prefilledAmount > 0;
  }

  onDialogClose() {
    this.visibleChange.emit(false);
    this.clearTransactionDetails();
  }

  constructor(
    private fb: FormBuilder,
    private response: ResponsesService,
    private socketService: SocketService,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private store: Store<{ auth: AuthState }>,
  ) {
    this.profile$ = this.store.pipe(select('auth'));
    this.paymentForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(07|01)\d{8}$/)]],
      amount: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.paymentTypeName = sessionStorage.getItem("selectedPaymentTypeName") || 'General Payment';
    if (this.prefilledAmount) {
      this.paymentForm.patchValue({ amount: this.prefilledAmount });
    }

    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile) {
          this.memberId = profile.user?.id || '';

        }
      });

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
            transactionDate: data.transactionDate,
          };
          this.currentStatus = `✅ Payment successful! Receipt: ${data.receipt}`;
          this.response.showSuccess('Payment completed successfully!');
          this.paymentForm.reset();

          this.paymentSuccess.emit();

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

   ngOnChanges(changes: SimpleChanges): void {
    if (changes['prefilledAmount'] && changes['prefilledAmount'].currentValue !== null) {
      const amount = changes['prefilledAmount'].currentValue;
      this.paymentForm.patchValue({ amount: amount });
      
      if (this.isAmountPrefilled) {
        this.paymentForm.get('amount')?.disable();
      } else {
        this.paymentForm.get('amount')?.enable();
      }
    }
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
    this.currentStatus = "⏳ Getting things ready...";

    const orderId = uuidv4();
    this.currentOrderId = orderId;

    // ⬇️ Step 1: Warm up first
    this.paymentService.warmupMpesa().pipe(
      catchError((err) => {
        this.failWithMessage("⚠️ Payment service is not ready. Please try again.");
        return throwError(() => err);
      }),
      switchMap(() => {
        // ✅ Step 2: Join the room only after warmup
        this.socketService.joinPaymentRoom(orderId);

        const payload = {
          phone: this.getFormattedInputPhone(),
          amount: this.paymentForm.getRawValue().amount,
          Order_ID: orderId,
          memberId: this.memberId,
          payment_type_id: this.paymentTypeId,
        };

        console.log('🚀 Initiating payment with payload:', payload);

        return this.paymentService.initiateSTKPush(payload);
      })
    ).subscribe({
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
    this.paymentClosed.emit();
  }

  closePayment() {

  }

  downloadReceipt() {
    const doc = new jsPDF();
    const img = new Image();
    img.src = 'assets/ariders.jpg';

    img.onload = () => {
      // Page setup
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;
      const receipt = this.transactionDetails;

      // Colors
      const primaryColor = '#2C3E50'; 
      const secondaryColor = '#30B54A'; 
      const lightColor = '#7F8C8D';     

      // Logo and Header
      doc.addImage(img, 'JPEG', centerX - 10, 10, 20, 20); 
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('A RIDERS CLUB', centerX, 35, { align: 'center' });

      // Receipt title with underline
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor);
      doc.text('M-PESA PAYMENT RECEIPT', centerX, 65, { align: 'center' });
      doc.setDrawColor(secondaryColor);
      doc.line(centerX - 45, 67, centerX + 45, 67);

      // Receipt Details Table
      const receiptData = [
        ['Receipt No:', receipt.receipt],
        ['Transaction ID:', receipt.transactionId],
        ['Payment For:', this.paymentTypeName || 'General Payment'],
        ['Amount Paid:', `KES ${this.formatCurrency(receipt.amount)}`],
        ['Phone Number:', this.getFormattedPhoneNumber()],
        ['Transaction Date:', this.getFormattedTransactionDate()],
      ];

      autoTable(doc, {
        startY: 75,
        theme: 'grid',
        margin: { left: 20, right: 20 },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255, 
          fontStyle: 'bold'
        },
        body: receiptData.map(([label, value]) => [label, value]),
        styles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: primaryColor
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { cellWidth: 'auto' }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            doc.setTextColor(lightColor);
          }
        }
      });

      // Thank you message
      doc.setFontSize(11);
      doc.setTextColor(lightColor);
      doc.text('Thank you for your payment!', centerX, + 175, { align: 'center' });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerY = pageHeight - 20;

      doc.setDrawColor(220); 
      doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);

      doc.setFontSize(8);
      doc.setTextColor(lightColor);
      doc.text('© 2023 A Riders Club — All rights reserved ', 20, footerY);
      doc.text('• Official Receipt', centerX, footerY, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, footerY, { align: 'right' });

      doc.save(`ARiders_Receipt_${receipt.receipt}.pdf`);
    };

    img.onerror = () => {
      this.toastr.error('Could not load club logo.');
    };
  }

  //format currency
  formatCurrency(amount: number): string {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  ngOnDestroy(): void {
    if (this.currentOrderId) {
      this.socketService.leavePaymentRoom(this.currentOrderId);
    }

    this.socketSub?.unsubscribe();
    this.socketService.disconnect();
  }
}