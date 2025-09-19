import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { DebtService } from 'src/app/services/debt/debt.service';
import { UserService } from 'src/app/services/members/user.service';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { MemberReceiptsResponse } from 'src/app/services/types/memberService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



// Interfaces
interface AuthState {
  user?: {
    id: string;
  };
}

interface DebtSummary {
  total_periods: number;
  applicable_periods: number;
  total_debt: number;
  total_paid: number;
  payment_completion: number;
  average_monthly_balance: number;
}

interface MemberInfo {
  email: string;
  last_name: string;
  member_id: string;
  joined_date: string;
  first_name: string;
  full_name: string;
  member_since_days: number;
}

interface MonthlyReport {
  role: string;
  month_end: string;
  month_year: string;
  amount_paid: number;
  month_start: string;
  days_overdue: number;
  running_debt: number;
  period_status: string;
  payment_status: string;
  expected_amount: number;
  monthly_balance: number;
  payment_percentage: number;
  is_overdue: boolean;
  formatted_amount_paid: string;
  formatted_expected_amount: string;
}

interface DebtSummaryResponse {
  summary: DebtSummary;
  member_info: MemberInfo;
  monthly_reports: MonthlyReport[];
  report_parameters: {
    report_date: string;
    member_since: string;
    months_reported: number;
  };
}
@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css'],
})


export class MembershipComponent {
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();
  profileId: string | null = null;
  debtSummary: DebtSummaryResponse | null = null;
  loading: boolean = false;
  error: string | null = null;
  showPaymentModal = false;
  currentYear: any;
  paymentTypeId: string = ""
  paymentTypeMap: { [key: string]: string } = {};
  paymentTypes: { id: string; name: string; description: string }[] = [];
  paymentTypeName: string = '';

  totalReceiptsCount!: number;
  loadingReceipts: boolean = false;
  recentReceipts: any[] = [];
  receiptsData?: MemberReceiptsResponse;

  // Receipt Details Dialog Properties
  showReceiptDetailsDialog: boolean = false;
  selectedReceipt: any = null;


  constructor(
    private store: Store<{ auth: AuthState }>,
    private debtService: DebtService,
    private spinner: NgxSpinnerService,
    private paymentService: PaymentService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.paymentService.getAllPaymentTypes().subscribe(types => {
      this.paymentTypes = types;
      this.paymentTypeMap = types.reduce((acc, type) => {
        acc[type.name.toLowerCase()] = type.id;
        return acc;
      }, {} as { [key: string]: string });
    });

    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile && profile.user?.id) {
          this.profileId = profile.user.id;
          this.paymentTypeId = this.paymentTypeId
          this.loadMemberDebtSummary();
          this.fetchReceipts();
        }
      });
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
        // Update total count to only include successful receipts
        this.totalReceiptsCount = this.getSuccessfulReceipts().length;
        console.log('Receipts data:', this.receiptsData);

        this.loadingReceipts = false;
      },
      error: (err) => {
        console.error('Error fetching receipts:', err);
        this.error = 'Failed to load receipts';
        this.loadingReceipts = false;
      }
    });
  }

  viewReceiptDetails(receipt: any) {
    this.selectedReceipt = receipt;
    this.showReceiptDetailsDialog = true;
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


  openPaymentModalFor(typeName: string): void {
    const id = this.paymentTypeMap[typeName.toLowerCase()];
    if (!id) {
      this.toastr.error(`Payment type "${typeName}" not found`);
      return;
    }

    this.paymentTypeId = id;

    const paymentType = this.paymentTypes.find(t => t.id === id);
    if (paymentType) {
      this.paymentTypeName = paymentType.name;
      console.log("Selected Payment Type:", this.paymentTypeName);
    }
    this.showPaymentModal = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMemberDebtSummary(): void {
    if (!this.profileId) return;

    this.spinner.show();
    this.error = null;

    this.debtService.getMemberDebtSummary(this.profileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: DebtSummaryResponse) => {
          this.debtSummary = response;
          console.log('this is debt summary>>>', this.debtSummary);

          this.spinner.hide();
        },
        error: (error) => {
          this.error = 'Failed to load debt summary';
          this.spinner.hide();
          console.error('Error loading debt summary:', error);
        }
      });
  }

  refreshDebtSummary(): void {
    this.loadMemberDebtSummary();
  }

  trackByMonth(index: number, report: MonthlyReport): string {
    return report.month_year;
  }

  initiatePayment(): void {
    const amount = this.getLatestRunningDebt();
    console.log('Initiating payment for latest running debt:', amount);

  }


  getOverdueMonthsCount(): number {
    if (!this.debtSummary?.monthly_reports) return 0;
    return this.debtSummary.monthly_reports.filter(report => report.is_overdue).length;
  }


  getLatestRunningDebt(): number {
    if (!this.debtSummary?.monthly_reports || this.debtSummary.monthly_reports.length === 0) {
      return 0;
    }

    const sortedReports = [...this.debtSummary.monthly_reports].sort((a, b) =>
      new Date(b.month_end).getTime() - new Date(a.month_end).getTime()
    );

    return sortedReports[0].running_debt;
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
    doc.text('Thank you for your payment!', centerX, + 155, { align: 'center' });

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
        ['Amount Paid:', `KES ${this.formatCurrency(receipt.amount)}`],
        ['Phone Number:', this.getFormattedPhoneNumber(receipt.phone_number)],
        ['Transaction Date:', this.getFormattedTransactionDate(receipt.transaction_date)],
        ['Transaction ID:', receipt.order_id || 'N/A'],
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
