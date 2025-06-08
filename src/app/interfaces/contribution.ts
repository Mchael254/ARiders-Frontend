export interface ContributionAnalysis {
  success: boolean;
  message: string;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    reportDate: string;
    reportPeriod: string;
    quartersIncluded: number;
    total_contributions_period: string;
    total_contributions_all_time: string;
    total_expected_contributions: string;
    zero_contributors: string;
    highest_contributor: string;
    [key: string]: any;
  };
  quarters: {
    [key: string]: {
      quarter: number;
      totalExpected: number;
      totalCollected: number;
      averageCollectionRate: string;
      totalExpectedFormatted: string;
      totalCollectedFormatted: string;
      averageContributors: string;
    };
  };
  monthly: Array<{
    monthName: string;
    expected: string;
    collected: string;
    contributors: number;
    collection_rate: string;
    shortfall: string;
    shortfallPercentage: string;
    performance: string;
  }>;
  insights: {
    trendDirection: string;
    bestQuarter: any;
    worstQuarter: any;
    totalQuarters: number;
    monthsAnalyzed: number;
    consistencyScore: string;
  };
  charts: {
    quarterlyComparison: Array<any>;
    monthlyTrend: Array<any>;
    contributorTrend: Array<any>;
  };
}