export interface AnalysisPeriod {
  startDate: string;
  endDate: string;
}

export interface SummaryData {
  reportDate: string;
  reportPeriod: string;
  quartersIncluded: number;
  total_contributions_period: string;
  total_contributions_all_time: string;
  total_expected_contributions: string;
  zero_contributors: string;
  highest_contributor: string;
  lowest_collection_month: string;
  average_contributors_per_month: string;
  consistent_contributors: string;
  last_month_growth: string;
  best_collection_month: string;
  analysisPeriod?: {
    startDate: string;
    endDate: string;
    periodLabel: string;
  };
}

export interface Insights {
  trendDirection: string;
  bestQuarter: any | null;
  worstQuarter: any | null;
  bestMonthOverall: {
    monthName: string;
    amount: number;
    amountFormatted: string;
    collectionRate: string;
  } | null;
  totalQuarters: number;
  monthsAnalyzed: number;
  consistencyScore: string;
  analysisPeriod?: {
    startDate: string;
    endDate: string;
    periodLabel: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  message?: string;
  period: AnalysisPeriod;
  summary: SummaryData;
  quarters: Record<string, any>;
  monthly: any[];
  insights: Insights;
  charts: any;
  metadata?: {
    requestedPeriod: AnalysisPeriod;
    processingTime: string;
    dataPointsProcessed: number;
    quartersAnalyzed: number;
    monthsWithData: number;
  };
}