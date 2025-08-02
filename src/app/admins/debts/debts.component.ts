import { Component, EventEmitter, Output } from '@angular/core';
import { DebtService } from 'src/app/services/debt/debt.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DebtAnalysis, DebtSummaryResponse, DashboardMetrics, MonthlyTrend, Member, DebtSummaryRequest } from 'src/app/interfaces/debts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-debts',
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.css']
})
export class DebtsComponent {
  searchTerm: string = '';
  Math = Math;
  dateRange = {
    start: this.getDefaultStartDate(),
    end: new Date().toISOString().split('T')[0]
  };

  loading = false;
  error: string | null = null;
  analysis: DebtAnalysis | null = null;
  rawData: Member[] = [];

  activeFilter: string = 'no_payment';
  currentPage = 1;
  pageSize = 10;

  @Output() viewMemberDebt = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<string>();

  public chartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: true },
      y: { display: true }
    }
  };

  public chartPlugins: any[] = [];
  public chartType: ChartType = 'line';

  constructor(private debtService: DebtService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.fetchDebtSummary();;
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(0, 1); // Sets to January (month 0) and day 1
    return date.toISOString().split('T')[0];
  }

  fetchDebtSummary(): void {
    // Validate dates before proceeding
    const currentDate = new Date();
    const selectedEndDate = new Date(this.dateRange.end);

    if (selectedEndDate > currentDate) {
      // Show alert/notification (using your preferred notification method)
      this.toastr.warning('End date cannot be in the future. Using current date instead.');

      // Auto-correct the end date to current date
      this.dateRange.end = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    this.spinner.show();
    this.error = null;

    const payload = {
      dateRangeStart: this.dateRange.start,
      dateRangeEnd: this.dateRange.end
    }

    this.debtService.getMembersDebtSummary(payload).subscribe({
      next: (res: DebtSummaryResponse) => {
        this.analysis = res.analysis;
        this.rawData = res.raw_data;
        this.prepareChartData();
        this.spinner.hide();
      },
      error: () => {
        this.error = 'Failed to load debt summary. Please try again.';
        this.spinner.hide();
      }
    });
  }

  // === Dashboard Metrics Getters ===
  get dashboardSummary(): DashboardMetrics['summary'] | null {
    return this.analysis?.dashboard_metrics?.summary ?? null;
  }

  get collectionRate(): number {
    return this.dashboardSummary?.collection_rate ?? 0;
  }

  get totalExpectedRevenue(): number {
    return this.dashboardSummary?.total_debt ?? 0;
  }

  get averageDebt(): number {
    return this.dashboardSummary?.average_debt ?? 0;
  }

  get memberCount(): number {
    return this.dashboardSummary?.total_members ?? 0;
  }

  get monthlyTrends(): MonthlyTrend[] {
    return this.analysis?.dashboard_metrics?.monthly_trends ?? [];
  }

  get topDefaulters(): Member[] {
    return this.analysis?.dashboard_metrics?.top_defaulters ?? [];
  }

  get improvingMembers(): Member[] {
    return this.analysis?.dashboard_metrics?.improving_members ?? [];
  }

  get filteredDebtors(): Member[] {
    const filtered = this.filterByPaymentStatus(this.activeFilter);

    if (!this.searchTerm.trim()) return filtered;

    const term = this.searchTerm.toLowerCase();
    return filtered.filter(member =>
      member.first_name.toLowerCase().includes(term) ||
      member.last_name.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDebtors.length / this.pageSize);
  }

  get paginatedDebtors(): Member[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDebtors.slice(start, start + this.pageSize);
  }

  get currentMonthExpectedTotal(): number {
    const currentYearMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    return this.filteredDebtors.reduce((sum, member) => {
      let currentMonth: { month: string; expected: number } | undefined;
      if (Array.isArray(member.monthly_breakdown)) {
        currentMonth = member.monthly_breakdown.find((item: { month: string; expected: number }) => item.month === currentYearMonth);
      }
      return sum + (currentMonth?.expected || 0);
    }, 0);
  }

  get currentMonthDebtTotal(): number {
    const currentYearMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    return this.filteredDebtors.reduce((sum, member) => {
      const currentMonth = (member.monthly_breakdown as Array<{ month: string; debt: number; expected?: number }>).find(item => item.month === currentYearMonth);
      return sum + (currentMonth?.debt || 0);
    }, 0);
  }

  get currentMonthPaidTotal(): number {
    const currentYearMonth = new Date().toISOString().slice(0, 7); // Gets "YYYY-MM" format

    return this.filteredDebtors.reduce((sum, member) => {
      const currentMonthPayment = (member.monthly_breakdown as Array<{ month: string; paid: number }>).find(
        (item: { month: string; paid: number }) => item.month === currentYearMonth
      );
      return sum + (currentMonthPayment?.paid || 0);
    }, 0);
  }


  isNumber(page: number | string): boolean {
    return typeof page === 'number';
  }

  isCurrentPage(page: number | string): boolean {
    return page === this.currentPage;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get currentMonthName(): string {
    // Use the end date of the range as the "current" month
    return new Date(this.dateRange.end).toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  }
  get membersByPaymentStatus(): Record<string, Member[]> {
    return {
      no_payment: this.rawData.filter(m => m.payment_status === 'no_payment'),
      partial: this.rawData.filter(m => m.payment_status === 'partial'),
      fully_paid: this.rawData.filter(m => m.payment_status === 'fully_paid')
    };
  }

  get membersByRiskLevel(): Record<string, Member[]> {
    return {
      high_risk: this.rawData.filter(m => m.payment_status === 'no_payment'),
      medium_risk: this.rawData.filter(m => m.payment_status === 'partial'),
      low_risk: this.rawData.filter(m => m.payment_status === 'fully_paid'),
      current: this.rawData.filter(m => m.current_month_debt === 0)
    };
  }

  onDateRangeChange(): void {
    this.currentPage = 1; // Reset pagination when dates change
    this.fetchDebtSummary();
  }

  get dateRangeLabel(): string {
    const start = new Date(this.dateRange.start);
    const end = new Date(this.dateRange.end);

    if (this.dateRange.start === this.dateRange.end) {
      return start.toLocaleDateString('default', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }

    return `${start.toLocaleDateString('default', {
      month: 'short',
      year: 'numeric'
    })} - ${end.toLocaleDateString('default', {
      month: 'short',
      year: 'numeric'
    })}`;
  }

  filterByPaymentStatus(status: string): Member[] {
    return this.rawData.filter(member => member.payment_status === status);
  }

  filterByRiskLevel(level: 'high' | 'medium' | 'low' | 'current'): Member[] {
    switch (level) {
      case 'high': return this.membersByRiskLevel['high_risk'];
      case 'medium': return this.membersByRiskLevel['medium_risk'];
      case 'low': return this.membersByRiskLevel['low_risk'];
      case 'current': return this.membersByRiskLevel['current'];
      default: return [];
    }
  }

  getTopDebtors(count: number = 10): Member[] {
    return this.rawData
      .filter(m => m.current_month_debt > 0)
      .sort((a, b) => b.current_month_debt - a.current_month_debt)
      .slice(0, count);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }


  exportFilteredDebtorsToPDF(): void {
    const data = this.filteredDebtors.map(member => ([
      `${member.first_name} ${member.last_name}`,
      member.email,
      member.payment_status,
      this.formatCurrency(member.total_expected),
      this.formatCurrency(member.total_paid),
      this.formatCurrency(member.current_month_debt)
    ]));

    const docDefinition = {
      content: [
        { text: `Current Month Debtors - ${this.currentMonthName}`, style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Name', 'Email', 'Status', 'Expected', 'Paid', 'Balance'],
              ...data
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          marginBottom: 10
        }
      }
    };

    pdfMake.createPdf(docDefinition).download(`Debtors_${this.currentMonthName.replace(/\s+/g, '_')}.pdf`);
  }

  viewDebt(memberId: string): void {
    this.viewMemberDebt.emit(memberId);
  }

  paymentStatusOptions = [
    { label: 'No Payment', value: 'no_payment', severity: 'danger' },
    { label: 'Partial', value: 'partial', severity: 'warning' },
    { label: 'Fully Paid', value: 'fully_paid', severity: 'success' }
  ];

  formatMonth(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  private prepareChartData() {
    if (!this.analysis?.dashboard_metrics?.monthly_trends) return;

    const trends = this.analysis.dashboard_metrics.monthly_trends
      .filter(t => {
        const [year, month] = t.month.split('-');
        const trendDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const startDate = new Date(this.dateRange.start);
        const endDate = new Date(this.dateRange.end);
        return trendDate >= startDate && trendDate <= endDate;
      });


    this.chartData = {
      labels: trends.map(t => this.formatMonth(t.month)),
      datasets: [
        {
          label: 'Expected Revenue',
          data: trends.map(t => t.total_expected),
          borderColor: '#3b82f6', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Amount Paid',
          data: trends.map(t => t.total_paid),
          borderColor: '#10b981', // emerald-500
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Collection Rate',
          data: trends.map(t => t.collection_rate),
          borderColor: '#f59e0b', // amber-500
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount (KES)'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Collection Rate %'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label === 'Collection Rate') {
                label += `: ${context.raw}%`;
              } else {
                label += `: ${this.formatCurrency(context.raw as number)}`;
              }
              return label;
            }
          }
        }
      }
    };
  }
}
