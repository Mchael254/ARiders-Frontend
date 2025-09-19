import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { DebtService } from '../../services/debt/debt.service';
import { UserService } from '../../services/members/user.service';
import { PaymentService } from '../../services/payment/payment.service';
import { NgxSpinnerService } from 'ngx-spinner';

// Interfaces
interface AuthState {
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    city: string;
    county: string;
    profile_image: string;
    membership_status: string;
    role: string;
    joined_date: string;
  };
}

interface DebtSummary {
  total_debt: number;
  total_paid: number;
  expected_total: number;
  payment_completion: number;
  average_monthly_balance: number;
  role_breakdown: any;
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
  month: string;
  month_end: string;
  month_start: string;
  amount_paid: number;
  days_overdue: number;
  running_debt: number;
  payment_status: string;
  expected_amount: number;
  monthly_balance: number;
  payment_percentage: number;
  is_overdue: boolean;
  formatted_amount_paid: string;
  formatted_expected_amount: string;
  role_changes_in_month: any[];
  role_selection_reason: string;
}

interface DebtSummaryResponse {
  summary: DebtSummary;
  member_info: MemberInfo;
  monthly_reports: MonthlyReport[];
  date_range: {
    start: string;
    end: string;
  };
  report_parameters: {
    latest_role: string;
    report_date: string;
    member_since: string;
    current_month: string;
    months_reported: number;
    eligibility_status: string;
    next_month_warning: string | null;
    current_role_eligible: boolean;
    first_reporting_month: string;
    earliest_eligible_role: string;
    eligible_for_debt_analysis: boolean;
  };
}

@Component({
  selector: 'app-dashbaod-content',
  templateUrl: './dashbaod-content.component.html',
  styleUrls: ['./dashbaod-content.component.css']
})
export class DashbaodContentComponent implements OnInit, OnDestroy {
  @Output() viewChange = new EventEmitter<string>();

  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();

  profileId: string | null = null;
  debtSummary: DebtSummaryResponse | null = null;
  loading: boolean = false;
  error: string | null = null;
  currentYear: number = new Date().getFullYear();

  // Computed properties for dashboard
  welcomeName: string = 'Member';
  membershipStatus: string = 'Active';
  memberSinceYear: string = '';
  outstandingDebt: number = 0;
  totalPaid: number = 0;
  paymentCompletion: number = 0;
  overdueMonthsCount: number = 0;
  paidMonthsCount: number = 0;

  // Date range tracking
  applicableDateRange: { start: Date; end: Date } | null = null;

  // Recent activity data
  recentActivities: any[] = [];
  recentReceipts: any[] = [];

  // Month names for the payment grid
  monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private store: Store<{ auth: AuthState }>,
    private debtService: DebtService,
    private userService: UserService,
    private paymentService: PaymentService,
    private spinner: NgxSpinnerService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile && profile.user?.id) {
          this.profileId = profile.user.id;
          this.welcomeName = profile.user.first_name || 'Member';
          this.membershipStatus = profile.user.membership_status || 'Active';
          this.memberSinceYear = profile.user.joined_date
            ? new Date(profile.user.joined_date).getFullYear().toString()
            : new Date().getFullYear().toString();

          this.loadMemberDebtSummary();
          this.fetchReceipts();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMemberDebtSummary(): void {
    if (!this.profileId) return;

    this.loading = true;
    this.error = null;

    this.debtService.getMemberDebtSummary(this.profileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: DebtSummaryResponse) => {
          this.debtSummary = response;
          this.updateDashboardData();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Failed to load debt summary';
          this.loading = false;
          console.error('Error loading debt summary:', error);
        }
      });
  }

  private updateDashboardData(): void {
    if (!this.debtSummary) return;

    this.outstandingDebt = this.debtSummary.summary.total_debt;
    this.totalPaid = this.debtSummary.summary.total_paid;

    // Set applicable date range
    if (this.debtSummary.date_range) {
      this.applicableDateRange = {
        start: new Date(this.debtSummary.date_range.start),
        end: new Date(this.debtSummary.date_range.end)
      };
    }

    // Calculate payment completion based on applicable months in current year
    this.paymentCompletion = this.calculateAnnualProgress();

    // Calculate paid and overdue months - only fully paid months count as paid
    if (this.debtSummary.monthly_reports) {
      this.overdueMonthsCount = this.debtSummary.monthly_reports.filter(report => report.is_overdue).length;
      // Only count months where payment_status is 'paid' (fully paid)
      this.paidMonthsCount = this.debtSummary.monthly_reports.filter(report =>
        report.payment_status === 'paid'
      ).length;
    }

    // Generate recent activities
    this.generateRecentActivities();
  }

  private fetchReceipts(): void {
    if (!this.profileId) return;

    this.userService.getMemberReceipts(this.profileId).subscribe({
      next: (data: any) => {
        this.recentReceipts = data.receipts?.filter((receipt: any) =>
          receipt.status && receipt.status.toLowerCase() === 'success'
        ).slice(0, 3) || [];
      },
      error: (err: any) => {
        console.error('Error fetching receipts:', err);
      }
    });
  }

  private generateRecentActivities(): void {
    this.recentActivities = [];

    // Add recent payment activity
    if (this.recentReceipts.length > 0) {
      const latestReceipt = this.recentReceipts[0];
      this.recentActivities.push({
        type: 'payment',
        title: 'Payment Received',
        description: `${latestReceipt.payment_type || 'Membership fee'} - KES ${this.formatCurrency(latestReceipt.amount)}`,
        date: this.getRelativeDate(latestReceipt.transaction_date),
        icon: 'check',
        color: 'green'
      });
    }

    // Add profile update activity (simulated)
    this.recentActivities.push({
      type: 'profile',
      title: 'Profile Updated',
      description: 'Contact information updated',
      date: '2 weeks ago',
      icon: 'user',
      color: 'yellow'
    });

    // Add event activity (simulated)
    this.recentActivities.push({
      type: 'event',
      title: 'Event Registration',
      description: 'Registered for Weekend Ride',
      date: '1 week ago',
      icon: 'calendar',
      color: 'blue'
    });
  }

  // Calculate annual progress considering applicable date range
  private calculateAnnualProgress(): number {
    if (!this.debtSummary || !this.applicableDateRange) return 0;

    const currentYear = new Date().getFullYear();
    const startDate = this.applicableDateRange.start;
    const endDate = this.applicableDateRange.end;

    // Only consider months within the current year and applicable date range
    const applicableMonthsInYear = this.getApplicableMonthsInYear(currentYear, startDate, endDate);

    if (applicableMonthsInYear.length === 0) return 0;

    // Calculate expected total for applicable months
    let totalExpected = 0;
    let totalPaid = 0;

    this.debtSummary.monthly_reports.forEach(report => {
      const reportDate = new Date(report.month + '-01');
      if (reportDate.getFullYear() === currentYear &&
        applicableMonthsInYear.includes(reportDate.getMonth())) {
        totalExpected += report.expected_amount;
        totalPaid += report.amount_paid;
      }
    });

    return totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;
  }

  private getApplicableMonthsInYear(year: number, startDate: Date, endDate: Date): number[] {
    const months: number[] = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      // Check if this month overlaps with the applicable date range
      if (monthStart <= endDate && monthEnd >= startDate) {
        months.push(month);
      }
    }

    return months;
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return amount?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0.00';
  }

  private getRelativeDate(dateStr: string): string {
    if (!dateStr) return 'Recently';

    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  }

  getMonthlyPaymentStatus(monthIndex: number): { status: string; color: string; icon: string } {
    if (!this.debtSummary?.monthly_reports || !this.applicableDateRange) {
      return { status: 'unknown', color: 'gray', icon: '-' };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Check if this month is within the applicable date range
    const monthStart = new Date(currentYear, monthIndex, 1);
    const monthEnd = new Date(currentYear, monthIndex + 1, 0);

    const isWithinApplicableRange = monthStart <= this.applicableDateRange.end &&
      monthEnd >= this.applicableDateRange.start;

    // For current year, be more lenient - if month is after the start date, consider it applicable
    // This ensures future months in current year show as "upcoming" rather than "N/A"
    const isCurrentYear = monthStart.getFullYear() === currentYear;
    const isAfterApplicableStart = monthStart >= this.applicableDateRange.start;

    if (!isWithinApplicableRange && !(isCurrentYear && isAfterApplicableStart)) {
      return { status: 'not_applicable', color: 'gray', icon: 'N/A' };
    }

    // Check if we have data for this month
    const monthReport = this.debtSummary.monthly_reports.find(report => {
      const reportDate = new Date(report.month + '-01');
      return reportDate.getMonth() === monthIndex && reportDate.getFullYear() === currentYear;
    });

    if (!monthReport) {
      if (monthIndex > currentMonth) {
        // Future months within applicable range should show as upcoming/pending
        return { status: 'upcoming', color: 'blue', icon: '○' };
      }
      return { status: 'unknown', color: 'gray', icon: '?' };
    }

    if (monthReport.is_overdue) {
      return { status: 'overdue', color: 'red', icon: '!' };
    }

    // Only show as paid if payment_status is 'paid' (fully paid)
    if (monthReport.payment_status === 'paid') {
      return { status: 'paid', color: 'green', icon: '✓' };
    }

    // Partial payment or other statuses
    if (monthReport.amount_paid > 0) {
      return { status: 'partial', color: 'yellow', icon: '◐' };
    }

    if (monthIndex === currentMonth) {
      return { status: 'current', color: 'yellow', icon: '⏳' };
    }

    return { status: 'pending', color: 'yellow', icon: '⏳' };
  }

  getMonthTooltip(monthIndex: number): string {
    const status = this.getMonthlyPaymentStatus(monthIndex);
    const monthName = this.monthNames[monthIndex];

    switch (status.status) {
      case 'paid':
        return `${monthName}: Fully paid`;
      case 'partial':
        return `${monthName}: Partially paid`;
      case 'overdue':
        return `${monthName}: Overdue payment`;
      case 'current':
        return `${monthName}: Current month`;
      case 'not_applicable':
        return `${monthName}: Not applicable for membership period`;
      case 'upcoming':
        return `${monthName}: Upcoming payment month`;
      case 'future':
        return `${monthName}: Future month`;
      default:
        return `${monthName}: No payment data`;
    }
  }

  getNextEvent(): { name: string; date: string } {
    // This would normally come from an events service
    return {
      name: 'Weekend Ride',
      date: 'Sept 21, 2024'
    };
  }

  // Navigation methods
  navigateToMembership(): void {
    this.viewChange.emit('profile');
  }

  navigateToEvents(): void {
    this.viewChange.emit('events');
  }

  navigateToProfile(): void {
    this.viewChange.emit('bio');
  }

  openPaymentModal(): void {
    // Navigate to membership where payment functionality exists
    this.viewChange.emit('profile');
  }
}
