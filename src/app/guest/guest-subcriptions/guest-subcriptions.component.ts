import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserService } from 'src/app/services/members/user.service';
import { MemberReceiptsResponse } from 'src/app/services/types/memberService';
import { AuthState } from 'src/app/store/auth/auth.reducer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-guest-subcriptions',
  templateUrl: './guest-subcriptions.component.html',
  styleUrls: ['./guest-subcriptions.component.css']
})
export class GuestSubcriptionsComponent implements OnInit, OnDestroy {
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();
  profileId: string | null = null;

  totalReceiptsCount!: number;
  loadingReceipts: boolean = false;
  recentReceipts: any[] = [];
  receiptsData?: MemberReceiptsResponse;

  // Receipt Details Dialog Properties
  showReceiptDetailsDialog: boolean = false;
  selectedReceipt: any = null;

  // Filter Properties
  searchTerm: string = '';
  selectedPaymentType: string = '';

  constructor(
    private store: Store<{ auth: AuthState }>,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile && profile.user?.id) {
          this.profileId = profile.user.id;
          this.fetchReceipts();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchReceipts(): void {
    if (!this.profileId) {
      console.error('Profile ID is not available');
      return;
    }

    this.loadingReceipts = true;
    this.userService.getMemberReceipts(this.profileId).subscribe({
      next: (data) => {
        this.receiptsData = data;
        this.recentReceipts = data.receipts || [];
        
        this.totalReceiptsCount = this.getSuccessfulReceipts().length;
        console.log('Receipts data:', this.receiptsData);

        this.loadingReceipts = false;
      },
      error: (err) => {
        console.error('Error fetching receipts:', err);
        this.loadingReceipts = false;
      }
    });
  }

  viewReceiptDetails(receipt: any) {
    this.selectedReceipt = receipt;
    this.showReceiptDetailsDialog = true;
  }

  closeReceiptModal() {
    this.showReceiptDetailsDialog = false;
    this.selectedReceipt = null;
  }

  trackByReceiptId(index: number, receipt: any) {
    return receipt.id || receipt.receipt_number;
  }

  getSuccessfulReceipts(): any[] {
    if (!this.recentReceipts || this.recentReceipts.length === 0) {
      return [];
    }

    return this.recentReceipts.filter(receipt =>
      receipt.status && receipt.status.toLowerCase() === 'success'
    );
  }

  // Filter Methods
  getFilteredReceipts(): any[] {
    let filteredReceipts = this.getSuccessfulReceipts();

    // Filter by search term (receipt number)
    if (this.searchTerm) {
      filteredReceipts = filteredReceipts.filter(receipt =>
        receipt.receipt_number && 
        receipt.receipt_number.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by payment type
    if (this.selectedPaymentType) {
      filteredReceipts = filteredReceipts.filter(receipt =>
        receipt.payment_type === this.selectedPaymentType
      );
    }

    return filteredReceipts;
  }

  getUniquePaymentTypes(): string[] {
    const paymentTypes = this.getSuccessfulReceipts()
      .map(receipt => receipt.payment_type)
      .filter(type => type && type.trim() !== '');
    
    return [...new Set(paymentTypes)];
  }

  onSearchChange(): void {
    // Method called when search term changes
    // The filtering is handled by getFilteredReceipts()
  }

  onPaymentTypeChange(): void {
    // Method called when payment type filter changes
    // The filtering is handled by getFilteredReceipts()
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPaymentType = '';
  }

  formatCurrency(amount: number): string {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getFormattedPhoneNumber(phone: string): string {
    if (!phone) return 'N/A';
    const phoneStr = phone.toString();
    return phoneStr.startsWith('254') ? phoneStr.replace('254', '0') : phoneStr;
  }

  getFormattedTransactionDate(dateStr: string): string {
    if (!dateStr) return 'N/A';

    // Handle different date formats
    if (dateStr.length === 14) {
      return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}/${dateStr.slice(0, 4)} ${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}`;
    }

    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (error) {
      return dateStr;
    }
  }

  // Fallback method to generate receipt without logo
  generateReceiptWithoutLogo(receipt: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Colors
    const primaryColor = '#2C3E50';
    const secondaryColor = '#30B54A';
    const lightColor = '#7F8C8D';

    // Header without logo
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('A RIDERS CLUB', centerX, 25, { align: 'center' });

    // Receipt title with underline
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor);
    doc.text('M-PESA PAYMENT RECEIPT', centerX, 45, { align: 'center' });
    doc.setDrawColor(secondaryColor);
    doc.line(centerX - 45, 47, centerX + 45, 47);

    // Receipt Details Table
    const receiptData = [
      ['Receipt No:', receipt.receipt_number || receipt.order_id || 'N/A'],
      ['M-Pesa Receipt:', receipt.mpesa_receipt_number || 'N/A'],
      ['Payment Type:', receipt.payment_type || 'General Payment'],
      ...(receipt.payment_type === 'event_fee' && receipt.event_name ? [['Event:', receipt.event_name]] : []),
      ['Amount Paid:', `KES ${this.formatCurrency(receipt.amount)}`],
      ['Phone Number:', this.getFormattedPhoneNumber(receipt.phone_number)],
      ['Transaction Date:', this.getFormattedTransactionDate(receipt.transaction_date)],
      ['Transaction ID:', receipt.transaction_id || 'N/A'],
      ['Status:', receipt.status || 'N/A'],
    ];

    autoTable(doc, {
      startY: 55,
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
    });

    // Thank you message
    doc.setFontSize(11);
    doc.setTextColor(lightColor);
    doc.text('Thank you for your payment!', centerX, + 165, { align: 'center' });

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

    // Generate filename based on receipt data
    const receiptId = receipt.receipt_number || receipt.order_id || receipt.id || 'receipt';
    doc.save(`ARiders_Receipt_${receiptId}.pdf`);
  }

  downloadReceipt(receipt: any) {
    const doc = new jsPDF();
    const img = new Image();
    img.src = 'assets/ariders.jpg';

    img.onload = () => {
      // Page setup
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

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
        ['M-Pesa Receipt:', receipt.receipt_number || receipt.order_id || 'N/A'],
        ['Payment Type:', receipt.payment_type || 'General Payment'],
        ...(receipt.payment_type === 'event_fee' && receipt.event_name ? [['Event:', receipt.event_name]] : []),
        ['Amount Paid:', `KES ${this.formatCurrency(receipt.amount)}`],
        ['Phone Number:', this.getFormattedPhoneNumber(receipt.phone_number)],
        ['Transaction Date:', this.getFormattedTransactionDate(receipt.transaction_date)],
        ['Transaction ID:', receipt.order_id || 'N/A'],
      ];

      // Generate table and get final Y position
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

      // Calculate position for thank you message with margin below table
      const tableEndY = (doc as any).lastAutoTable.finalY; // Get the Y position after the table
      const marginBelowTable = 15; // Adjust this value to increase/decrease spacing
      const thankYouMessageY = tableEndY + marginBelowTable;

      // Thank you message - positioned after table with margin
      doc.setFontSize(11);
      doc.setTextColor(lightColor);
      doc.text('Thank you for your payment!', centerX, thankYouMessageY, { align: 'center' });

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

      // Generate filename based on receipt data
      const receiptId = receipt.receipt_number || receipt.order_id || receipt.id || 'receipt';
      doc.save(`ARiders_Receipt_${receiptId}.pdf`);
    };

    img.onerror = () => {
      this.toastr.error('Could not load club logo for receipt generation.');
      // Generate PDF without logo as fallback
      this.generateReceiptWithoutLogo(receipt);
    };
  }
}
