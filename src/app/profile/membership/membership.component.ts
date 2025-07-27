import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { DebtService } from 'src/app/services/debt/debt.service';



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

  constructor(
    private store: Store<{ auth: AuthState }>,
    private debtService: DebtService,
    private spinner: NgxSpinnerService,
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }


  openPaymentModal() {
    this.showPaymentModal = true;
  }

  ngOnInit(): void {
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile && profile.user?.id) {
          this.profileId = profile.user.id;
          this.loadMemberDebtSummary();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMemberDebtSummary(): void {
    if (!this.profileId) return;

    this.spinner.show();
    this.error = null;

    const lookBackMonths = this.calculateLookBackMonths();
    const reportDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    this.debtService.getMemberDebtSummary(this.profileId, lookBackMonths, reportDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: DebtSummaryResponse) => {
          this.debtSummary = response;
          this.spinner.hide();
        },
        error: (error) => {
          this.error = 'Failed to load debt summary';
          this.spinner.hide();
          console.error('Error loading debt summary:', error);
        }
      });
  }

  private calculateLookBackMonths(): number {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1

    // Calculate months from January 1st of current year to current month
    return currentMonth;
  }

  // Method to refresh the data
  refreshDebtSummary(): void {
    this.loadMemberDebtSummary();
  }

  // TrackBy function for performance optimization
  trackByMonth(index: number, report: MonthlyReport): string {
    return report.month_year;
  }

  initiatePayment(): void {
    const amount = this.getLatestRunningDebt();
    console.log('Initiating payment for latest running debt:', amount);
    // Your payment logic here
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
