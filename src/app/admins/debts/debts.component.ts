import { Component, EventEmitter, Output } from '@angular/core';
import { DebtAnalysis, DebtSummaryPayload, DebtSummaryResponse, Member } from 'src/app/interfaces/debts';
import { DebtService } from 'src/app/services/debt.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MenuItem } from 'primeng/api';
(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-debts',
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.css']
})
export class DebtsComponent {

  searchTerm: string = '';
  Math = Math;
  lookBackMonths = 3;
  reportDate: string = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  reportPeriod = { start: '', end: '' };
  loading = false;
  error: string | null = null;
  analysis: DebtAnalysis | null = null;
  rawData: Member[] = [];
  activeFilter: string = 'no_payment';


  get currentMonthName(): string {
    return new Date(this.reportDate).toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  }

  get currentMonthDebtors(): Member[] {
    return this.rawData.filter(member => member.current_month_debt > 0);
  }

  get currentMonthExpectedTotal(): number {
    return this.currentMonthDebtors.reduce((sum, member) => sum + member.total_expected, 0);
  }

  get currentMonthDebtTotal(): number {
    return this.currentMonthDebtors.reduce((sum, member) => sum + member.current_month_debt, 0);
  }

  //insights
  get totalExpectedRevenue(): number {
    return this.rawData.reduce((sum, member) => sum + member.total_expected, 0);
  }

  get totalActualRevenue(): number {
    return this.rawData.reduce((sum, member) => sum + member.total_paid, 0);
  }

  get collectionRate(): number {
    return this.totalExpectedRevenue > 0
      ? (this.totalActualRevenue / this.totalExpectedRevenue) * 100
      : 0;
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
      high_risk: this.rawData.filter(m => m.days_late > 60),
      medium_risk: this.rawData.filter(m => m.days_late > 30 && m.days_late <= 60),
      low_risk: this.rawData.filter(m => m.days_late > 0 && m.days_late <= 30),
      current: this.rawData.filter(m => m.days_late === 0)
    };
  }

  // Sorting and filtering utilities
  get sortedDebtorsByAmount(): Member[] {
    return [...this.currentMonthDebtors].sort((a, b) => b.current_month_debt - a.current_month_debt);
  }

  get sortedDebtorsByDaysLate(): Member[] {
    return [...this.currentMonthDebtors].sort((a, b) => b.days_late - a.days_late);
  }

  constructor(private debtService: DebtService) { }

  ngOnInit(): void {
    this.updateReport();
  }

  updateReport(): void {
    this.computeReportPeriod();
    this.fetchDebtSummary();
  }

  computeReportPeriod(): void {
    const selectedDate = new Date(this.reportDate);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - this.lookBackMonths + 1, 1);

    this.reportPeriod = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }

  fetchDebtSummary(): void {
    this.loading = true;
    this.error = null;

    const payload: DebtSummaryPayload = {
      lookBackMonths: this.lookBackMonths,
      reportDate: this.reportDate
    };

    this.debtService.getMembersDebtSummary(payload).subscribe({
      next: (res: DebtSummaryResponse) => {
        this.analysis = res.analysis;
        this.rawData = res.raw_data;
        this.loading = false;
        console.log("this is debtAnalysis", this.analysis);

      },
      error: (err) => {
        console.error('Failed to fetch debt summary', err);
        this.error = 'Failed to load debt summary. Please try again.';
        this.loading = false;
      }
    });
  }

  // Utility methods for data filtering and analysis
  getMembersByDebtRange(min: number, max: number = Infinity): Member[] {
    return this.rawData.filter(member =>
      member.current_month_debt >= min && member.current_month_debt < max
    );
  }

  getMembersByDaysLateRange(min: number, max: number = Infinity): Member[] {
    return this.rawData.filter(member =>
      member.days_late >= min && member.days_late < max
    );
  }

  getTopDebtors(count: number = 10): Member[] {
    return this.sortedDebtorsByAmount.slice(0, count);
  }

  exportToCSV(): void {
    const csvData = this.currentMonthDebtors.map(member => ({
      'Member ID': member.member_id,
      'Name': `${member.first_name} ${member.last_name}`,
      'Email': member.email,
      'Expected': member.total_expected,
      'Paid': member.total_paid,
      'Current Debt': member.current_month_debt,
      'Days Late': member.days_late,
      'Payment Status': member.payment_status
    }));

    // Implementation would depend on your CSV export library
    console.log('CSV Export Data:', csvData);
  }

  // Quick filters for UI
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

  // Search functionality
  searchMembers(searchTerm: string): Member[] {
    if (!searchTerm.trim()) return this.rawData;

    const term = searchTerm.toLowerCase();
    return this.rawData.filter(member =>
      member.first_name.toLowerCase().includes(term) ||
      member.last_name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.member_id.toLowerCase().includes(term)
    );
  }

  // Helper method for currency formatting
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }

  get filteredDebtors(): Member[] {
    const filtered = this.filterByPaymentStatus(this.activeFilter);

    if (!this.searchTerm.trim()) {
      return filtered;
    }

    const term = this.searchTerm.toLowerCase();

    return filtered.filter(member =>
      member.first_name.toLowerCase().includes(term) ||
      member.last_name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term)
    );
  }

  // Helper method for percentage formatting
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  // Add to your component class
  currentPage = 1;
  itemsPerPage = 10;

  get paginatedDebtors(): Member[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.sortedDebtorsByAmount.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.currentMonthDebtors.length / this.itemsPerPage);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
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


  getPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < this.totalPages) {
        if (end < this.totalPages - 1) {
          pages.push('...');
        }
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  paymentStatusOptions = [
    { label: 'No Payment', value: 'no_payment', severity: 'danger' },
    { label: 'Partial', value: 'partial', severity: 'warning' },
    { label: 'Fully Paid', value: 'fully_paid', severity: 'success' }
  ];

  @Output() viewChange = new EventEmitter<string>();
viewDebt(member_id: string) {
  console.log(member_id);
  this.debtService.setMemberId(member_id);
  this.debtService.changeView('memberDebt'); // This will trigger the view change
}






}
