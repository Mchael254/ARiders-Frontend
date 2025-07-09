import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { faArrowDown, faArrowUp, faBullseye, faCalendarAlt, faCalendarCheck, faChartBar, faChartLine, faCoins, faCrown, faPercent, faShieldAlt, faStar, faTrophy, faUsers } from '@fortawesome/free-solid-svg-icons';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AnalysisResponse } from 'src/app/interfaces/contribution';
import { ContributionService } from 'src/app/services/contribution/contribution.service';
import { ResponsesService } from 'src/app/services/utilities/responses.service';


@Component({
  selector: 'app-contributions',
  templateUrl: './contributions.component.html',
  styleUrls: ['./contributions.component.css']
})

export class ContributionsComponent {
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
  // Default empty state 
  emptyState: AnalysisResponse = {
    success: false,
    message: 'No data available',
    period: {
      startDate: this.formatDate(new Date()),
      endDate: this.formatDate(new Date())
    },
    summary: {
      reportDate: new Date().toISOString().split('T')[0],
      reportPeriod: 'No data',
      quartersIncluded: 0,
      total_contributions_period: "KES 0.00",
      total_contributions_all_time: "KES 0.00",
      total_expected_contributions: "KES 0.00",
      zero_contributors: "0 members",
      highest_contributor: "None",
      lowest_collection_month: "None",
      average_contributors_per_month: "0.00",
      consistent_contributors: "0",
      last_month_growth: "N/A",
      best_collection_month: "None",
      analysisPeriod: {
        startDate: this.formatDate(new Date()),
        endDate: this.formatDate(new Date()),
        periodLabel: 'No period selected'
      }
    },
    quarters: {},
    monthly: [],
    insights: {
      trendDirection: "No data",
      bestQuarter: null,
      worstQuarter: null,
      bestMonthOverall: null,
      totalQuarters: 0,
      monthsAnalyzed: 0,
      consistencyScore: "0.0"
    },
    charts: {
      quarterlyComparison: [],
      monthlyTrend: [],
      contributorTrend: [],
      quarterlyMonthlyPerformance: []
    }
  };

  analysisData: AnalysisResponse = this.emptyState;
  loading: boolean = false;
  error: string | null = null;
  startDate: string;
  endDate: string;

  periodAmount: number = 0;
  monthAnalysis: any


  constructor(private contributionService: ContributionService) {
    const today = new Date();
    this.endDate = this.formatDate(today);

    const yearStart = new Date(today.getFullYear(), 0, 1);
    this.startDate = this.formatDate(yearStart);
  }


  ngOnInit(): void {
    this.fetchAnalysis();

  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getBestMonth(): { monthName: string, amount: string } | null {
    if (!this.analysisData?.monthly || this.analysisData.monthly.length === 0) {
      return null;
    }

    if (this.analysisData.insights?.bestMonthOverall) {
      return {
        monthName: this.analysisData.insights.bestMonthOverall.monthName,
        amount: this.analysisData.insights.bestMonthOverall.amountFormatted
      };
    }

    let bestMonth = this.analysisData.monthly[0];
    let maxAmount = this.parseAmount(bestMonth.collected);

    for (const month of this.analysisData.monthly) {
      const currentAmount = this.parseAmount(month.collected);
      if (currentAmount > maxAmount) {
        maxAmount = currentAmount;
        bestMonth = month;
      }
    }

    return {
      monthName: bestMonth.monthName,
      amount: bestMonth.collected
    };
  }

  parseAmount(amountString: string): number {
    return parseFloat(amountString.replace(/[^\d.-]/g, '')) || 0;
  }


  fetchAnalysis(): void {
    this.loading = true;
    this.error = null;

    const periodData = {
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.contributionService.getGeneralContribution(periodData).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.analysisData = data;
          console.log(this.analysisData);
          const summary = this.analysisData.summary;
          const amountString = (summary as any)["total_contributions_(period)"];
          const numericAmount = parseFloat(amountString.replace(/[^\d.]/g, ''));
          this.periodAmount = numericAmount;
          console.log("this is the monthly data", this.analysisData.charts.monthlyTrend);
          this.monthAnalysis = this.analysisData.charts.monthlyTrend;

          this.updateChartData();

          // Update empty state analysisPeriod if not present
          if (!this.analysisData.summary.analysisPeriod) {
            this.analysisData.summary.analysisPeriod = {
              startDate: this.startDate,
              endDate: this.endDate,
              periodLabel: `${new Date(this.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(this.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
            };
          }
        } else {
          this.analysisData = {
            ...this.emptyState,
            period: data.period || periodData,
            message: data.message || 'No data found for the specified period'
          };
          // Clear chart data when no data available
          this.clearChartData();
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to fetch analysis data. Please try again.';
        this.analysisData = {
          ...this.emptyState,
          period: periodData,
          message: this.error ?? undefined
        };
        // Clear chart data on error
        this.clearChartData();
        this.loading = false;
        console.error('Error fetching analysis:', error);
      }
    });
  }

  onDateChange(): void {
    if (this.startDate && this.endDate) {
      this.fetchAnalysis();
    }
  }

  getQuarters(): any[] {
    if (!this.analysisData?.quarters) return [];
    return Object.values(this.analysisData.quarters);
  }


  getMonthlyTrendData(): any[] {
    return this.analysisData?.charts?.monthlyTrend || [];
  }

  getContributorTrendData(): any[] {
    return this.analysisData?.charts?.contributorTrend || [];
  }

  getPerformanceRating(rate: number): string {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Fair';
    if (rate >= 20) return 'Poor';
    return 'Critical';
  }

  hasData(): boolean {
    return this.analysisData.success &&
      this.analysisData.monthly.length > 0 &&
      Object.keys(this.analysisData.quarters).length > 0;
  }

  //CHARTS
  private updateChartData(): void {
    this.updateLineChart();
    this.updateContributorTrendLineChart();
    this.updateQuarterlyComparisonBarChart();
    this.updateQuarterlyMonthlyPerformanceBarChart();
  }

  //line chart
  private updateLineChart(): void {
    const monthlyTrendData = this.analysisData.charts.monthlyTrend;

    if (monthlyTrendData && monthlyTrendData.length > 0) {
      this.lineChartData = {
        labels: monthlyTrendData.map((item: any) => item.month),
        datasets: [
          {
            data: monthlyTrendData.map((item: any) => item.collected),
            label: 'Collected (KES)',
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: (context) =>
              (context.raw as number) > 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(201, 203, 207, 1)'
          },
          {
            data: monthlyTrendData.map((item: any) => item.expected),
            label: 'Expected (KES)',
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            borderDash: [5, 5],
            pointBackgroundColor: (context) =>
              (context.raw as number) > 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(201, 203, 207, 1)'
          },
          {
            data: monthlyTrendData.map((item: any) => item.rate),
            label: 'Collection Rate (%)',
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
            yAxisID: 'y1',
            pointBackgroundColor: (context) =>
              (context.raw as number) > 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(201, 203, 207, 1)'
          }
        ]
      };
      this.lineChartOptions.plugins!.title!.text = 'Monthly Contribution Trend Analysis';
    }
  }

  private updateContributorTrendLineChart(): void {
    const contributorTrendData = this.analysisData.charts.contributorTrend;

    if (contributorTrendData && contributorTrendData.length > 0) {
      this.contributorTrendLineData = {
        labels: contributorTrendData.map((item: any) => item.month || item.period),
        datasets: [
          {
            data: contributorTrendData.map((item: any) => item.partial_contributors || 0),
            label: 'Partial Contributors',
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(255, 206, 86, 1)'
          },
          {
            data: contributorTrendData.map((item: any) => item.full_contributors || 0),
            label: 'Full Contributors',
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)'
          },
          {
            data: contributorTrendData.map((item: any) => item.zero_contributors || 0),
            label: 'No Contribution',
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(255, 99, 132, 1)'
          }
        ]
      };
    }
  }


  //quarterly comparison
  private updateQuarterlyComparisonBarChart(): void {
    const quarterlyData = this.analysisData.charts.quarterlyComparison;

    if (quarterlyData && quarterlyData.length > 0) {
      this.quarterlyComparisonBarData = {
        labels: quarterlyData.map((item: any) => item.quarter || item.period),
        datasets: [
          {
            data: quarterlyData.map((item: any) => item.collected || item.total_collected),
            label: 'Collected',
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            data: quarterlyData.map((item: any) => item.expected || item.total_expected),
            label: 'Expected',
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      };
    }
  }

  private updateQuarterlyMonthlyPerformanceBarChart(): void {
    const performanceData = this.analysisData.charts.quarterlyMonthlyPerformance;
    console.log('Quarterly Monthly Performance Data:', performanceData);

    if (performanceData && performanceData.length > 0) {
      // Extract all unique months from all quarters
      const allMonths = new Set<string>();
      performanceData.forEach((quarter: any) => {
        if (quarter.monthlyPerformance) {
          quarter.monthlyPerformance.forEach((month: any) => {
            allMonths.add(month.month);
          });
        }
      });

      // Sort months chronologically
      const monthLabels = Array.from(allMonths).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      // Create datasets for each quarter
      const colors = [
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)'
      ];

      const datasets = performanceData.map((quarter: any, index: number) => {
        const data = monthLabels.map(monthLabel => {
          const monthData = quarter.monthlyPerformance?.find((m: any) => m.month === monthLabel);
          return monthData ? (monthData.collected || 0) : 0;
        });

        return {
          label: quarter.quarter || `Quarter ${index + 1}`,
          data: data,
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length].replace('0.8', '1'),
          borderWidth: 1
        };
      });

      this.quarterlyMonthlyPerformanceBarData = {
        labels: monthLabels,
        datasets: datasets
      };
    }
  }


  private clearChartData(): void {
    // Clear line chart
    this.lineChartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Collected (KES)',
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          data: [],
          label: 'Expected (KES)',
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          borderDash: [5, 5]
        },
        {
          data: [],
          label: 'Collection Rate (%)',
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    // Clear bar charts
    this.contributorTrendLineData = { labels: [], datasets: [] };
    this.quarterlyComparisonBarData = { labels: [], datasets: [] };
    this.quarterlyMonthlyPerformanceBarData = { labels: [], datasets: [] };
  }

  // Bar Chart Data Properties
  public contributorTrendLineData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public quarterlyComparisonBarData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public quarterlyMonthlyPerformanceBarData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  // Bar Chart Options
  public contributorTrendBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Number of Contributors'
        },
        beginAtZero: true
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Contributor Trend Analysis',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': ' + context.raw + ' contributors';
          }
        }
      }
    }
  };

  public quarterlyComparisonBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Amount (KES)'
        },
        beginAtZero: true
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Quarterly Comparison',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': KES ' + (context.raw as number).toLocaleString();
          }
        }
      }
    }
  };

  public quarterlyMonthlyPerformanceBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Amount (KES)'
        },
        beginAtZero: true
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Quarterly Monthly Performance',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': KES ' + (context.raw as number).toLocaleString();
          }
        }
      }
    }
  };

  public barChartLegend = true;

  //line chart
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Collected (KES)',
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        data: [],
        label: 'Expected (KES)',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        borderDash: [5, 5]
      },
      {
        data: [],
        label: 'Collection Rate (%)',
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Amount (KES)'
        },
        suggestedMax: 9000
      },
      y1: {
        position: 'right',
        title: {
          display: true,
          text: 'Rate (%)'
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Monthly Contribution Trend Analysis',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.datasetIndex === 2) {

              label += context.raw + '%';
            } else {
              label += 'KES ' + (context.raw as number).toLocaleString();
            }
            return label;
          }
        }
      }
    }
  };

  public lineChartLegend = true;

}
