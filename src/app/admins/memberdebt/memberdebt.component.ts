import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DebtService } from 'src/app/services/debt/debt.service';
import { AuthState } from 'src/app/store/auth/auth.reducer';

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
  month:string;
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

interface Summary {
  total_periods: number;
  applicable_periods: number;
  total_debt: number;
  total_paid: number;
  payment_completion: number;
  average_monthly_balance: number;
}

interface ReportParameters {
  report_date: string;
  member_since: string;
  lookback_months: number;
}

interface MemberDebtData {
  summary: Summary;
  member_info: MemberInfo;
  monthly_reports: MonthlyReport[];
  report_parameters: ReportParameters;
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

  // Removed lookBackOptions since we don't need them anymore
  // Removed filterForm since we don't need date filters

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

    // Simplified API call - only needs memberId now
    this.debtService.getMemberDebtSummary(this.memberId).subscribe({
      next: (response) => {
        this.data = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading member debt data:', error);
        this.error = 'Failed to load member debt data';
        this.isLoading = false;
      }
    });
  }

  // Helper methods remain the same
  goBack(): void {
    this.backToDebts.emit();
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'partial_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid_full': // Updated to match new status from RPC
        return 'bg-green-100 text-green-800';
      case 'no_payment': // Updated to match new status from RPC
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatPercentage(value: number): string {
    return (value * 100).toFixed(1) + '%';
  }

  formatDaysSince(days: number): string {
    return days === 1 ? '1 day' : `${days} days`;
  }

  // New helper to format the automatic date range
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
}
