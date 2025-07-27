import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  faCoins,
  faBullseye,
  faUsers,
  faCrown,
  faStar,
  faChartLine,
  faArrowUp,
  faArrowDown,
  faCalendarAlt,
  faChartBar,
  faCalendarCheck,
  faTrophy,
  faPercent,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { ContributionService } from 'src/app/services/contribution/contribution.service';

interface ContributionAnalysisResponse {
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
    allTimeSummary: AllTimeSummary;
    analysisPeriod: {
      startDate: string;
      endDate: string;
      periodLabel: string;
    };
    bestMonthOverall: {
      monthName: string;
      amount: number;
      amountFormatted: string;
      collectionRate: string;
    };
    'total_contributions_(period)': string;
    'total_contributions_(all_time)': string;
    'total_expected_contributions': string;
    'zero_contributors': string;
    'highest_contributor': string;
    'lowest_collection_month': string;
    'average_contributors_per_month': string;
    'consistent_contributors_(>=_2_months)': string;
    'last_month_growth_(%)': string;
    'best_collection_month_(current_year)': string;
  };
  quarters: {
    [key: string]: any;
  };
  monthly: any[];
  insights: any;
  charts: any;
  metadata: any;
}

// Supporting interfaces
interface CurrentMonthAnalysis {
  isCurrentMonth: boolean;
  monthName: string;
  status: string;
  data: any | null;
  insights: CurrentMonthInsights;
  comparison: MonthComparison | null;
}

interface CurrentMonthInsights {
  daysRemaining: number;
  isCompleteMonth: boolean;
  projectedCollection: number;
  improvementNeeded: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  dailyTargetRemaining?: number;
  progressPercentage?: number;
}

interface MonthComparison {
  previousMonth: {
    name: string;
    collected: string;
    collectionRate: string;
  };
  growth: {
    amount: number;
    percentage: number;
    trend: 'positive' | 'negative' | 'stable';
  };
  ranking: {
    position: number;
    totalMonths: number;
    percentile: number;
  };
}

interface CurrentMonthIndicator {
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface AllTimeSummary {
    totalCollected: number;
    totalExpected: number;
    totalCollectedFormatted: string;
    totalExpectedFormatted: string;
    collectionRate: string;
    performance: string;
}

@Component({
  selector: 'app-contributions',
  templateUrl: './contributions.component.html',
  styleUrls: ['./contributions.component.css']
})
export class ContributionsComponent implements OnInit {
  // Font Awesome icons
  faCoins = faCoins;
  faBullseye = faBullseye;
  faUsers = faUsers;
  faCrown = faCrown;
  faStar = faStar;
  faChartLine = faChartLine;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faCalendarAlt = faCalendarAlt;
  faChartBar = faChartBar;
  faCalendarCheck = faCalendarCheck;
  faTrophy = faTrophy;
  faPercent = faPercent;
  faShieldAlt = faShieldAlt;

  // Component data
  loading = true;
  error: string | null = null;
  data: ContributionAnalysisResponse | null = null;
  rangeForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  currentMonth: any;
  currentMonthAnalysis: CurrentMonthAnalysis | null = null;

  constructor(private contributionService: ContributionService, private fb: FormBuilder) {
    this.rangeForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    // Set min/max dates (optional)
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 5, 0, 1);
    this.maxDate = new Date(currentYear + 5, 11, 31);
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    const defaultStart = `${currentYear}-01-01`;
    const defaultEnd = `${currentYear}-12-31`;
    
    this.rangeForm.patchValue({
      startDate: defaultStart,
      endDate: defaultEnd
    });

    this.loadData();
  }

  loadData(): void {
    if (this.rangeForm.invalid) {
      return;
    }

    const periodData = {
      startDate: this.rangeForm.value.startDate,
      endDate: this.rangeForm.value.endDate
    };

    this.loading = true;
    this.error = null;

    this.contributionService.getGeneralContribution(periodData).subscribe({
      next: (response) => {
        if (response.success) {
          this.data = response;
          this.currentMonthAnalysis = this.analyzeCurrentMonth();
          console.log('Current Month Analysis:', this.currentMonthAnalysis);
        } else {
          this.error = response.message || 'Failed to load contribution data';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'An error occurred while fetching data';
        this.loading = false;
      }
    });
  }

  /**
   * Analyzes the current month's contribution performance
   * @returns CurrentMonthAnalysis object with current month insights
   */
  analyzeCurrentMonth(): CurrentMonthAnalysis | null {
    if (!this.data?.monthly) {
      return null;
    }

    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentMonthKey = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

    // Find current month data
    const currentMonthData = this.data.monthly.find(month =>
      month.monthName === currentMonthName ||
      month.month === currentMonthKey ||
      month.monthYear === currentMonthName
    );

    if (!currentMonthData) {
      return {
        isCurrentMonth: false,
        monthName: currentMonthName,
        status: 'No data available for current month',
        data: null,
        insights: {
          daysRemaining: this.getDaysRemainingInMonth(),
          isCompleteMonth: false,
          projectedCollection: 0,
          improvementNeeded: 0,
          riskLevel: 'Critical'
        },
        comparison: null
      };
    }

    // Calculate insights for current month
    const insights = this.calculateCurrentMonthInsights(currentMonthData);

    // Compare with previous months
    const comparison = this.compareWithPreviousMonths(currentMonthData);

    return {
      isCurrentMonth: true,
      monthName: currentMonthData.monthName,
      status: this.getCurrentMonthStatus(currentMonthData, insights),
      data: currentMonthData,
      insights,
      comparison
    };
  }

  /**
   * Calculates insights specific to the current month
   */
  private calculateCurrentMonthInsights(monthData: any): CurrentMonthInsights {
    const daysRemaining = this.getDaysRemainingInMonth();
    const totalDaysInMonth = this.getTotalDaysInCurrentMonth();
    const daysPassed = totalDaysInMonth - daysRemaining;

    const expectedDaily = parseFloat(monthData.expected.replace(/[^\d.]/g, '')) / totalDaysInMonth;
    const actualDaily = parseFloat(monthData.collected.replace(/[^\d.]/g, '')) / daysPassed;

    const projectedCollection = actualDaily * totalDaysInMonth;
    const improvementNeeded = parseFloat(monthData.expected.replace(/[^\d.]/g, '')) - projectedCollection;

    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    const collectionRate = parseFloat(monthData.collection_rate.replace('%', ''));

    if (collectionRate >= 80) riskLevel = 'Low';
    else if (collectionRate >= 60) riskLevel = 'Medium';
    else if (collectionRate >= 30) riskLevel = 'High';
    else riskLevel = 'Critical';

    return {
      daysRemaining,
      isCompleteMonth: daysRemaining === 0,
      projectedCollection: Math.round(projectedCollection),
      improvementNeeded: Math.max(0, Math.round(improvementNeeded)),
      riskLevel,
      dailyTargetRemaining: daysRemaining > 0 ? Math.round(improvementNeeded / daysRemaining) : 0,
      progressPercentage: (daysPassed / totalDaysInMonth) * 100
    };
  }

  /**
   * Compares current month with previous months
   */
  private compareWithPreviousMonths(currentMonthData: any): MonthComparison | null {
    if (!this.data?.monthly || this.data.monthly.length < 2) {
      return null;
    }

    const currentIndex = this.data.monthly.findIndex(m => m.month === currentMonthData.month);
    if (currentIndex <= 0) return null;

    const previousMonth = this.data.monthly[currentIndex - 1];
    const currentCollected = parseFloat(currentMonthData.collected.replace(/[^\d.]/g, ''));
    const previousCollected = parseFloat(previousMonth.collected.replace(/[^\d.]/g, ''));

    const growthAmount = currentCollected - previousCollected;
    const growthPercentage = previousCollected > 0 ? (growthAmount / previousCollected) * 100 : 0;

    // Find best and worst performing months for context
    const sortedMonths = [...this.data.monthly]
      .filter(m => parseFloat(m.collected.replace(/[^\d.]/g, '')) > 0)
      .sort((a, b) => parseFloat(b.collection_rate.replace('%', '')) - parseFloat(a.collection_rate.replace('%', '')));

    return {
      previousMonth: {
        name: previousMonth.monthName,
        collected: previousMonth.collected,
        collectionRate: previousMonth.collection_rate
      },
      growth: {
        amount: growthAmount,
        percentage: growthPercentage,
        trend: growthAmount > 0 ? 'positive' : growthAmount < 0 ? 'negative' : 'stable'
      },
      ranking: {
        position: sortedMonths.findIndex(m => m.month === currentMonthData.month) + 1,
        totalMonths: sortedMonths.length,
        percentile: ((sortedMonths.length - sortedMonths.findIndex(m => m.month === currentMonthData.month)) / sortedMonths.length) * 100
      }
    };
  }

  /**
   * Determines the current month status message
   */
  private getCurrentMonthStatus(monthData: any, insights: CurrentMonthInsights): string {
    const collectionRate = parseFloat(monthData.collection_rate.replace('%', ''));

    if (insights.isCompleteMonth) {
      if (collectionRate >= 80) return 'Excellent performance this month!';
      if (collectionRate >= 60) return 'Good performance this month';
      if (collectionRate >= 30) return 'Below target performance';
      return 'Critical performance this month';
    } else {
      if (insights.riskLevel === 'Low') return 'On track to meet targets';
      if (insights.riskLevel === 'Medium') return 'May need additional effort';
      if (insights.riskLevel === 'High') return 'Requires immediate attention';
      return 'Critical situation - urgent action needed';
    }
  }

  /**
   * Gets the number of days remaining in the current month
   */
  private getDaysRemainingInMonth(): number {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = lastDayOfMonth.getDate() - today.getDate();
    return Math.max(0, daysRemaining);
  }

  /**
   * Gets the total number of days in the current month
   */
  private getTotalDaysInCurrentMonth(): number {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  }

  /**
   * Gets current month performance indicators
   */
  getCurrentMonthIndicators(): CurrentMonthIndicator[] {
    if (!this.currentMonthAnalysis?.data) return [];

    const data = this.currentMonthAnalysis.data;
    const insights = this.currentMonthAnalysis.insights;

    return [
      {
        label: 'Collected This Month',
        value: data.collected,
        icon: 'faCoins',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        label: 'Collection Rate',
        value: data.collection_rate,
        icon: 'faPercent',
        color: this.getCollectionRateColor(parseFloat(data.collection_rate.replace('%', ''))),
        bgColor: this.getCollectionRateBgColor(parseFloat(data.collection_rate.replace('%', '')))
      },
      {
        label: 'Contributors',
        value: data.contributors.toString(),
        icon: 'faUsers',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        label: 'Days Remaining',
        value: insights.daysRemaining.toString(),
        icon: 'faCalendarAlt',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    ];
  }

  /**
   * Helper methods for styling
   */
  private getCollectionRateColor(rate: number): string {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 30) return 'text-orange-600';
    return 'text-red-600';
  }

  private getCollectionRateBgColor(rate: number): string {
    if (rate >= 80) return 'bg-green-50';
    if (rate >= 60) return 'bg-blue-50';
    if (rate >= 30) return 'bg-orange-50';
    return 'bg-red-50';
  }

  // ... existing methods remain the same
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getQuarterKeys(): string[] {
    if (!this.data?.quarters) return [];
    return Object.keys(this.data.quarters);
  }

  getPerformanceClass(performance: string): string {
    switch (performance.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getRiskLevelBadgeClass(riskLevel: string): string {
    switch (riskLevel) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get CSS class for collection rate card background
   */
  getCollectionRateCardClass(collectionRate: string): string {
    const rate = parseFloat(collectionRate.replace('%', ''));
    if (rate >= 80) return 'bg-green-50';
    if (rate >= 60) return 'bg-blue-50';
    if (rate >= 30) return 'bg-orange-50';
    return 'bg-red-50';
  }

  /**
   * Get CSS class for collection rate icon
   */
  getCollectionRateIconClass(collectionRate: string): string {
    const rate = parseFloat(collectionRate.replace('%', ''));
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 30) return 'text-orange-600';
    return 'text-red-600';
  }

  /**
   * Get CSS class for collection rate text
   */
  getCollectionRateTextClass(collectionRate: string): string {
    const rate = parseFloat(collectionRate.replace('%', ''));
    if (rate >= 80) return 'text-green-700';
    if (rate >= 60) return 'text-blue-700';
    if (rate >= 30) return 'text-orange-700';
    return 'text-red-700';
  }

  /**
   * Get growth trend icon
   */
  getGrowthIcon(trend: string): any {
    switch (trend) {
      case 'positive':
        return this.faArrowUp;
      case 'negative':
        return this.faArrowDown;
      case 'stable':
      default:
        return this.faArrowUp; // or use a different icon for stable
    }
  }

  /**
   * Get CSS class for growth icon
   */
  getGrowthIconClass(trend: string): string {
    switch (trend) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      case 'stable':
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Get CSS class for growth text
   */
  getGrowthTextClass(trend: string): string {
    switch (trend) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'stable':
      default:
        return 'text-gray-600';
    }
  }
}

