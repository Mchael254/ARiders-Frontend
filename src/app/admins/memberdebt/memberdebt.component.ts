import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { DebtService } from 'src/app/services/debt/debt.service';
import { AuthState } from 'src/app/store/auth/auth.reducer';

export interface MemberInfo {
  member_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  joined_date: string;
  member_since_days: number;
}

export interface RoleChange {
  role: string;
  start_date: string;
  end_date: string;
  days_in_month: number;
  effective_start_in_month: string;
  effective_end_in_month: string;
}

export interface MonthlyReport {
  month: string;
  month_start: string;
  month_end: string;
  role: string;
  expected_amount: number;
  amount_paid: number;
  monthly_balance: number;
  running_debt: number;
  days_overdue: number;
  payment_percentage: number;
  is_overdue: boolean;
  payment_status: 'paid_full' | 'partial_payment' | 'minimal_payment' | 'no_payment';
  formatted_amount_paid: string;
  formatted_expected_amount: string;
  role_changes_in_month: RoleChange[] | null;
  role_selection_reason: string;
}

export interface RoleBreakdownData {
  total_expected: number;
  total_paid: number;
  total_debt: number;
  months_count: number;
  avg_monthly_expected: number;
}

export interface RoleBreakdown {
  [roleName: string]: RoleBreakdownData;
}

export interface Summary {
  total_debt: number;
  total_paid: number;
  expected_total: number;
  role_breakdown: RoleBreakdown;
  payment_completion: number;
  average_monthly_balance: number;
}

export interface ReportParameters {
  report_date: string;
  member_since: string;
  first_reporting_month: string;
  current_month: string;
  months_reported: number;
  eligible_for_debt_analysis: boolean;
  earliest_eligible_role: string;
  current_role_eligible: boolean;
  latest_role: string;
  next_month_warning?: string;
  eligibility_status: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface MemberDebtData {
  member_info: MemberInfo;
  monthly_reports: MonthlyReport[];
  report_parameters: ReportParameters;
  summary: Summary;
  date_range: DateRange;
  error?: string;
  message?: string;
  reason?: string;
}

@Component({
  selector: 'app-memberdebt',
  templateUrl: './memberdebt.component.html',
  styleUrls: ['./memberdebt.component.css']
})
export class MemberdebtComponent implements OnInit, OnChanges {

  profileId: string | null = null;
  @Input() memberId: string | null = null;
  @Input() viewData: any = {};
  @Output() backToDebts = new EventEmitter<void>();

  isLoading = true;
  error: string | null = null;
  data: MemberDebtData | null = null;

  constructor(
    private debtService: DebtService,
    private store: Store<{ auth: AuthState }>
  ) { }

  ngOnInit(): void {
    if (this.memberId) {
      this.loadMemberDebtData();
    }
  }

  ngOnChanges(): void {
    if (this.memberId) {
      console.log('Loading debt data for member:', this.memberId);
      this.loadMemberDebtData();
    }
  }

  loadMemberDebtData(): void {
    if (!this.memberId) {
      console.warn('No member ID provided');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.debtService.getMemberDebtSummary(this.memberId).subscribe({
      next: (response) => {
        this.data = response;
        console.log("member debt >>>", this.data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading member debt data:', error);
        this.error = 'Failed to load member debt data';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.backToDebts.emit();
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'partial_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid_full':
        return 'bg-green-100 text-green-800';
      case 'minimal_payment':
        return 'bg-orange-100 text-orange-800';
      case 'no_payment':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'partial_payment':
        return 'Partial Payment';
      case 'paid_full':
        return 'Paid Full';
      case 'minimal_payment':
        return 'Minimal Payment';
      case 'no_payment':
        return 'No Payment';
      default:
        return 'Unknown';
    }
  }

  formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
  }

  formatDaysSince(days: number): string {
    return days === 1 ? '1 day' : `${days} days`;
  }

  formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
              ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - 
            ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  formatCurrency(amount: number): string {
    return `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getRoleBreakdownArray(): { role: string; data: any }[] {
    if (!this.data?.summary?.role_breakdown) return [];
    
    return Object.entries(this.data.summary.role_breakdown).map(([role, data]) => ({
      role,
      data
    }));
  }

  formatMonth(monthString: string): string {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getMemberStatusClass(): string {
    if (!this.data?.report_parameters) return 'bg-gray-100 text-gray-800';
    
    if (this.data.report_parameters.current_role_eligible) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  }

  getMemberStatusText(): string {
    if (!this.data?.report_parameters) return 'Unknown';
    
    if (this.data.report_parameters.current_role_eligible) {
      return 'Eligible for Contributions';
    } else {
      return 'Not Eligible for Contributions';
    }
  }

  hasNextMonthWarning(): boolean {
    return !!(this.data?.report_parameters?.next_month_warning);
  }

  getOverdueMonthsCount(): number {
    if (!this.data?.monthly_reports) return 0;
    return this.data.monthly_reports.filter((report: any) => report.is_overdue).length;
  }

  getTotalDaysOverdue(): number {
    if (!this.data?.monthly_reports) return 0;
    return this.data.monthly_reports.reduce((total: number, report: any) => {
      return total + (report.days_overdue || 0);
    }, 0);
  }

  isCurrentMonth(monthString: string): boolean {
    const reportMonth = new Date(monthString + '-01');
    const currentDate = new Date();
    return reportMonth.getFullYear() === currentDate.getFullYear() && 
           reportMonth.getMonth() === currentDate.getMonth();
  }

  getRoleChangesSummary(roleChanges: any[]): string {
    if (!roleChanges || roleChanges.length <= 1) {
      return 'Single role for entire month';
    }
    
    const roles = roleChanges.map(change => change.role);
    return `Multiple roles: ${roles.join(' → ')}`;
  }
}