export interface DebtSummaryResponse {
  raw_data: Member[];
  analysis: DebtAnalysis;
}

export interface DebtAnalysis {
  debt_segmentation: DebtSegmentation;
  payment_analysis: PaymentAnalysis;
  dashboard_metrics: DashboardMetrics;
}

export interface PaymentBehavior {
  totalDebt: number;
  totalPaid: number;
}

export interface DashboardMetrics {
  summary: DashboardSummary;
  debt_distribution: DebtDistribution;
  payment_behavior: PaymentBehavior;
  top_defaulters: Member[];
  improving_members: Member[];
  monthly_trends: MonthlyTrend[];
}

export interface DebtSummaryRequest {
  dateRangeStart: string;
  dateRangeEnd: string;
}


export interface DebtDistribution {
  severe: DistributionItem;
  high: DistributionItem;
  moderate: DistributionItem;
  low: DistributionItem;
  none: DistributionItem;
}

export interface DistributionItem {
  label: string;     // e.g., "Severe Debt"
  count: number;     // number of members in this category
  total: number;     // total amount of debt in this category
  percentage: number; // optional: % of total debt or members
}

export interface DebtDistribution {
  buckets: DistributionBucket[];
}

export interface DistributionBucket {
  range: string;     // e.g. "0-100", "101-500", etc.
  count: number;
  total: number;
}


export interface DashboardSummary {
  total_members: number;
  total_debt: number;
  average_debt: number;
  collection_rate: number;
}

export interface DebtSegmentation {
  severe_debt: DebtSegmentStats;
  high_debt: DebtSegmentStats;
  moderate_debt: DebtSegmentStats;
  low_debt: DebtSegmentStats;
  no_debt: DebtSegmentStats;
}

export interface DebtSegmentStats {
  count: number;
  total: number;
}

export interface PaymentAnalysis {
  fully_paid: {
    count: number;
    total: number;
  };
  partially_paid: {
    count: number;
    total: number;
  };
  unpaid: {
    count: number;
    total: number;
  };
}

export interface MonthlyTrend {
  month: string; // Format: '2025-06' or 'June 2025'
  total_expected: number;
  total_paid: number;
  total_debt: number;
  member_count: number;
  collection_rate: number;
}

export interface Member {
  member_id: string;
  first_name: string;
  last_name: string;
  role: string;
  expected_amount: string; 
  email:string;
  payment_status:string;
  current_month_debt:number;
  total_expected:number;
  total_paid:number;
  days_late:number;
  monthly_breakdown:[];
}
