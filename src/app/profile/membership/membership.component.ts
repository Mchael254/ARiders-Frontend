import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { DebtService } from 'src/app/services/debt/debt.service';
import { PaymentService } from 'src/app/services/payment/payment.service';



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
  created_at: string;
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
    lookback_months: number;
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
  // paymentTypeId: string = "63538f70-39e1-4590-84db-1329c9591785"
  paymentTypeId: string = ""
  paymentTypeMap: { [key: string]: string } = {};
  paymentTypes: { id: string; name: string; description: string }[] = [];
  paymentTypeName: string = '';



  constructor(
    private store: Store<{ auth: AuthState }>,
    private debtService: DebtService,
    private spinner: NgxSpinnerService,
    private paymentService: PaymentService,
    private toastr: ToastrService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.paymentTypeName = sessionStorage.getItem("selectedPaymentTypeName") || '';
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
        }
      });
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
      sessionStorage.setItem("selectedPaymentTypeName", paymentType.name);
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

  // Calculate months from January 1st of current year to current month
  private calculateLookBackMonths(): number {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    this.currentYear = currentYear;
    const currentMonth = currentDate.getMonth() + 1;


    return currentMonth;
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
}
