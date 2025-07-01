import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { DebtService } from 'src/app/services/debt.service';
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
export class MemberdebtComponent {

  profileId: string | null = null;
  memberId: string | null = null;

  isLoading = true;
  error: string | null = null;
  data: MemberDebtData | null = null
  lookBackOptions = [1, 3, 6, 12, 24]
  filterForm: FormGroup;

  constructor(private debtService: DebtService, private fb: FormBuilder, private store: Store<{ auth: AuthState }>) {
    this.filterForm = this.fb.group({
      lookBackMonths: [5], // Default value
      reportDate: [new Date().toISOString().split('T')[0]] // Today's date as default
    });
  }

  ngOnInit(): void {
    this.loadMemberDebtData();
    this.debtService.memberId$.subscribe(memberId => {
    if (memberId) {
      console.log('Received member ID:', memberId);
      this.profileId = memberId
      console.log("new id>>", this.profileId);
      
      // Use the memberId here
    }
  });
   

  }

  loadMemberDebtData(): void {
    if (this.filterForm.invalid || !this.profileId) return;
    if (this.filterForm.invalid) return;

    this.isLoading = true;
    this.error = null;

    const formValue = this.filterForm.value;
    const memberId = this.profileId

    this.debtService.getMemberDebtSummary(
      memberId,
      formValue.lookBackMonths,
      formValue.reportDate
    ).subscribe({
      next: (response) => {
        this.data = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load member debt data';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'partial_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'fully_paid':
        return 'bg-green-100 text-green-800';
      case 'overdue_unpaid':
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


}
