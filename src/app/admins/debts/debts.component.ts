import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChartData, ChartType, ChartConfiguration } from 'chart.js';
import { DebtService } from 'src/app/services/debt/debt.service';
import { DebtAnalysis, DebtSummaryResponse, Member, MonthlyTrend } from 'src/app/interfaces/debts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-debts',
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.css']
})
export class DebtsComponent implements OnInit {
  @Output() viewMemberDebt = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<string>();

  private _filteredDebtors: Member[] = [];
  searchTerm: string = '';
  Math = Math;

  dateRange = {
    start: this.getDefaultStartDate(),
    end: new Date().toISOString().split('T')[0]
  };

  membersByPaymentStatus: { [key: string]: Member[] } = {
    no_payment: [],
    partial: [],
    fully_paid: []
  };

  paymentStatusOptions = [
    { value: 'all', label: 'All Debtors' },
    { label: 'No Payment', value: 'no_payment', severity: 'danger' },
    { label: 'Partial', value: 'partial', severity: 'warning' },
    { label: 'Fully Paid', value: 'fully_paid', severity: 'success' }
  ];


  loading = false;
  error: string | null = null;
  analysis: DebtAnalysis | null = null;
  rawData: Member[] = [];

  activeFilter: string = 'all';
  currentPage = 1;
  pageSize = 10;

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

  public chart: any; // Add this property to fix the error

  constructor(
    private debtService: DebtService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.fetchDebtSummary();
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(0, 1); // January 1st
    return date.toISOString().split('T')[0];
  }

  fetchDebtSummary(): void {
    const currentDate = new Date();
    const selectedEndDate = new Date(this.dateRange.end);

    if (selectedEndDate > currentDate) {
      this.toastr.warning('End date cannot be in the future. Using current date instead.');
      this.dateRange.end = currentDate.toISOString().split('T')[0];
    }

    this.spinner.show();
    this.error = null;

    const payload = {
      start_date: this.dateRange.start,
      end_date: this.dateRange.end
    };

    this.debtService.getMembersDebtSummary(payload).subscribe({
      next: (res: DebtSummaryResponse) => {
        console.log("this is complete debt data", res)
        this.analysis = res.analysis;
        this.rawData = res.raw_data;
        this.membersByPaymentStatus = {
          all: this.rawData, // Add this line for all debtors
          no_payment: this.rawData.filter(m => m.payment_status === 'no_payment'),
          partial: this.rawData.filter(m => m.payment_status === 'partial'),
          fully_paid: this.rawData.filter(m => m.payment_status === 'fully_paid')
        };

        this.prepareChartData();
        this.updateFilteredDebtors();
        this.spinner.hide();
      },
      error: () => {
        this.error = 'Failed to load debt summary. Please try again.';
        this.spinner.hide();
      }
    });
  }

  updateFilteredDebtors(): void {
    let baseData = this.membersByPaymentStatus[this.activeFilter] || [];

    // Apply search filter if search term exists
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      baseData = baseData.filter(member =>
        member.first_name.toLowerCase().includes(searchLower) ||
        member.last_name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower)
      );
    }

    this.filteredDebtors = baseData;

  }

  onFilterChange(): void {
    this.updateFilteredDebtors();
  }

  // Add method to handle search change
  onSearchChange(): void {
    this.updateFilteredDebtors();
  }

  get filteredDebtors() {
    return this._filteredDebtors || [];
  }

  set filteredDebtors(value: any[]) {
    this._filteredDebtors = value;
  }
  get currentMonthDebtorCount(): number {
    return this.rawData.filter(m => m.current_month_debt > 0).length;
  }

  get currentMonthExpectedTotal(): number {
    return this.rawData.reduce((sum, member) => sum + (member.total_expected || 0), 0);
  }

  get currentMonthPaidTotal(): number {
    return this.rawData.reduce((sum, member) => sum + (member.total_paid || 0), 0);
  }

  get currentMonthDebtTotal(): number {
    return this.currentMonthExpectedTotal - this.currentMonthPaidTotal;
  }

  get dashboardSummary() {
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



  get totalPages(): number {
    return Math.ceil(this.filteredDebtors.length / this.pageSize);
  }

  get paginatedDebtors(): Member[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDebtors.slice(start, start + this.pageSize);
  }


  filterByPaymentStatus(status: string): Member[] {
    return this.rawData.filter(member => member.payment_status === status);
  }

  exportFilteredDebtorsToPDF(): void {
    const doc = new jsPDF();
    const img = new Image();
    img.src = 'assets/ariders.jpg'; // same logo

    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      // Branding Colors
      const primaryColor = '#2C3E50';  // dark blue
      const secondaryColor = '#30B54A'; // green
      const lightColor = '#7F8C8D';     // gray

      // Logo and Header
      doc.addImage(img, 'JPEG', centerX - 10, 10, 20, 20);
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('A RIDERS CLUB', centerX, 35, { align: 'center' });

      // Report Title
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor);
      doc.text(`Current Month Debtors - ${this.currentMonthName}`, centerX, 55, { align: 'center' });
      doc.setDrawColor(secondaryColor);
      doc.line(centerX - 60, 57, centerX + 60, 57);

      // Table data
      const tableData = this.filteredDebtors.map(member => ([
        `${member.first_name} ${member.last_name}`,
        member.email,
        member.payment_status,
        this.formatCurrency(member.total_expected),
        this.formatCurrency(member.total_paid),
        this.formatCurrency(member.current_month_debt)
      ]));

      // Table headers
      const tableHead = [['Name', 'Email', 'Status', 'Expected', 'Paid', 'Balance']];

      // AutoTable
      autoTable(doc, {
        startY: 65,
        head: tableHead,
        body: tableData,
        margin: { left: 15, right: 15 },
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10,
          textColor: primaryColor
        },
        alternateRowStyles: {
          fillColor: '#F9F9F9'
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Name
          1: { cellWidth: 50 }, // Email
          2: { cellWidth: 25 }, // Status
          3: { cellWidth: 25 }, // Expected
          4: { cellWidth: 25 }, // Paid
          5: { cellWidth: 25 }  // Balance
        }
      });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerY = pageHeight - 20;

      doc.setDrawColor(220);
      doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);

      doc.setFontSize(8);
      doc.setTextColor(lightColor);
      doc.text('© 2023 A Riders Club — All rights reserved', 20, footerY);
      doc.text('• Debtor Report', centerX, footerY, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, footerY, { align: 'right' });

      // Download
      doc.save(`ARiders_Debtors_${this.currentMonthName.replace(/\s+/g, '_')}.pdf`);
    };

    img.onerror = () => {
      this.toastr.error('Could not load club logo.');
    };
  }


  formatMonth(monthString: string): string {
    const [year, month] = monthString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  }

  get currentMonthName(): string {
    return new Date(this.dateRange.end).toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  }

  viewDebt(memberId: string): void {
    this.viewMemberDebt.emit(memberId);
  }

  onDateRangeChange(): void {
    this.currentPage = 1;
    this.fetchDebtSummary();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const total = this.totalPages;

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(total, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  }


  private prepareChartData(): void {
    const trends = this.monthlyTrends.filter(t => {
      const [year, month] = t.month.split('-');
      const trendDate = new Date(+year, +month - 1, 1);
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
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          fill: true,
        },
        {
          label: 'Amount Paid',
          data: trends.map(t => t.total_paid),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          fill: true,
        },
        {
          label: 'Collection Rate',
          data: trends.map(t => t.collection_rate),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          borderWidth: 2,
          tension: 0.4,
          pointStyle: 'rectRot',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          yAxisID: 'y1',
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '',
            color: '#374151',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          ticks: {
            callback: value => this.formatCurrency(value as number),
            color: '#374151'
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Collection Rate (%)',
            color: '#92400e',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          ticks: {
            callback: value => `${value}%`,
            color: '#92400e'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#1f2937',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: context => {
              const label = context.dataset.label || '';
              const raw = context.raw as number;
              return label === 'Collection Rate'
                ? `${label}: ${raw.toFixed(2)}%`
                : `${label}: ${this.formatCurrency(raw)}`;
            }
          }
        }
      }
    };
  }

  trackByMonth(index: number, trend: any): string {
    return trend.month;
  }

  updateChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: window.innerWidth < 640 ? 'bottom' : 'top',
          labels: {
            font: {
              size: window.innerWidth < 640 ? 10 : 12
            },
            padding: window.innerWidth < 640 ? 10 : 20,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = this.formatCurrency(context.parsed.y);
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: window.innerWidth >= 640,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: window.innerWidth < 640 ? 9 : 11
            },
            maxRotation: window.innerWidth < 640 ? 45 : 0
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: window.innerWidth < 640 ? 9 : 11
            },
            callback: (value: any) => {
              return this.formatCurrency(value);
            }
          }
        }
      }
    };
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('sw-KE', {  // Changed locale to sw-KE (Kenya)
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(value);
  }

  formatCurrency(amount: number): string {
    // For mobile screens, show abbreviated format for large numbers
    if (window.innerWidth < 640 && amount >= 1000) {
      if (amount >= 1000000) {
        return `KSh${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `KSh${(amount / 1000).toFixed(1)}K`;
      }
    }

    return new Intl.NumberFormat('sw-KE', {
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateChartOptions();
    if (this.chart) {
      this.chart.update('resize');
    }
  }

}
