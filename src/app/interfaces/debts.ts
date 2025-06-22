export interface DebtSummaryPayload {
  lookBackMonths: number;
  reportDate: string;
}

export interface Member {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  member_role: 'member' | 'admin';
  total_expected: number;
  total_paid: number;
  total_debt: number;
  current_month_debt: number;
  days_late: number;
  arrears_30_60: number;
  arrears_61_90: number;
  arrears_90_plus: number;
  payment_status: 'no_payment' | 'partial' | 'fully_paid';
}

export interface DebtAnalysis {
  debt_segmentation: {
    severe_debt: { count: number; total: number; percentage: number };
    high_debt: { count: number; total: number; percentage: number };
    moderate_debt: { count: number; total: number; percentage: number };
    low_debt: { count: number; total: number; percentage: number };
    total_debt: number;
    member_count: number;
  };
  payment_analysis: {
    no_payment: { count: number; total_debt: number; average_debt: number; members: any[] };
    partial: { count: number; total_debt: number; average_debt: number; members: any[] };
  };
}

export interface DebtSummaryResponse {
  raw_data: Member[];
  analysis: DebtAnalysis;
}