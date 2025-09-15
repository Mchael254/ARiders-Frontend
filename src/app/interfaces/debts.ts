export interface DebtSummaryResponse {
  raw_data: Member[];
  analysis: DebtAnalysis;
  filter: {
    applied: boolean;
  };
}

export interface Member {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  member_role: string;
  total_expected: number;
  total_paid: number;
  total_debt: number;
  current_month_debt: number;
  days_late: number;
  arrears_30_60: number;
  arrears_61_90: number;
  arrears_90_plus: number;
  payment_status: 'no_payment' | 'partial' | 'fully_paid';
  monthly_breakdown: MonthlyBreakdown[];
}

export interface MonthlyBreakdown {
  debt: number;
  paid: number;
  role: string;
  month: string; // "YYYY-MM"
  expected: number;
  days_late: number;
  payment_status: 'no_payment' | 'partial' | 'fully_paid';
}

export interface DebtAnalysis {
  debt_segmentation: DebtSegmentation;
  payment_analysis: PaymentAnalysis;
  dashboard_metrics: DashboardMetrics;
}

export interface DebtSegmentation {
  severe_debt: DebtLevel;
  high_debt: DebtLevel;
  moderate_debt: DebtLevel;
  low_debt: DebtLevel;
  total_debt: number;
  member_count: number;
}

export interface DebtLevel {
  count: number;
  total: number;
  percentage: number;
}

export interface PaymentAnalysis {
  no_payment: PaymentCategory;
  partial: PaymentCategory;
}

export interface PaymentCategory {
  count: number;
  total_debt: number;
  average_debt: number;
  members: PaymentMember[];
}

export interface PaymentMember {
  member_id: string;
  name: string;
  amount: number;
}

export interface DashboardMetrics {
  summary: DashboardSummary;
  debt_distribution: DebtSegmentation;
  payment_behavior: {
    totalDebt: number;
    totalPaid: number;
  };
  top_defaulters: Member[];
  improving_members: Member[];
  monthly_trends: MonthlyTrend[];
}

export interface DashboardSummary {
  total_members: number;
  total_debt: number;
  average_debt: number;
  collection_rate: number;
}

export interface MonthlyTrend {
  month: string; // "YYYY-MM"
  total_expected: number;
  total_paid: number;
  total_debt: number;
  member_count: number;
  collection_rate: number;
}


export interface DebtSummaryRequest {
  start_date: string;      // ISO format: 'YYYY-MM-DD'
  end_date: string;        // ISO format: 'YYYY-MM-DD'
  group_id?: string;       // Optional: if filtering by member group
  member_id?: string;      // Optional: for individual member summary
  filters?: {
    status?: 'no_payment' | 'partial' | 'fully_paid';
    role?: string;
  };
}
