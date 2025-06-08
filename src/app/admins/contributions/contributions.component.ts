import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { faArrowDown, faArrowUp, faCalendar, faCreditCard, faMoneyBill, faPiggyBank, faUsers } from '@fortawesome/free-solid-svg-icons';
import { ContributionAnalysis } from 'src/app/interfaces/contribution';
import { ContributionService } from 'src/app/services/contribution.service';
import { ResponsesService } from 'src/app/services/responses.service';


@Component({
  selector: 'app-contributions',
  templateUrl: './contributions.component.html',
  styleUrls: ['./contributions.component.css']
})

export class ContributionsComponent {

  constructor(private http: HttpClient, private contributionService: ContributionService,
    private response: ResponsesService
  ) { }

  ngOnInit() {
    this.fetchContributionSummary(this.formatDate(this.startDate), this.formatDate(this.endDate));
  }

  activeTab: number = 0;
  contributionAnalysis: ContributionAnalysis | null = null;
  isLoading: boolean = false;
  startDate: Date = new Date('2025-01-01');
  endDate: Date = new Date('2025-12-30');

  fetchData() {
    // Format dates to YYYY-MM-DD strings
    const start = this.formatDate(this.startDate);
    const end = this.formatDate(this.endDate);

    this.fetchContributionSummary(start, end);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
    // Or for more control:
    // const year = date.getFullYear();
    // const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // const day = date.getDate().toString().padStart(2, '0');
    // return `${year}-${month}-${day}`;
  }

  //icons
  faPiggyBank = faPiggyBank;
  faCreditCard = faCreditCard;
  faMoneyBill = faMoneyBill;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faUsers = faUsers;
  faCalendar = faCalendar;


  setActivetab(index: number) {
    this.activeTab = index;

    if (this.activeTab === 0) {
      this.fetchContributionSummary(this.formatDate(this.startDate), this.formatDate(this.endDate))

    }
  }


  // Updated fetch method
  fetchContributionSummary(startDate: string, endDate: string) {
    this.isLoading = true;
    const periodData = { startDate, endDate };

    this.contributionService.getGeneralContribution(periodData).subscribe({
      next: (response: ContributionAnalysis) => {
        this.contributionAnalysis = response;
        this.isLoading = false;
        console.log('Contribution Analysis:', this.contributionAnalysis);
      },
      error: (error: any) => {
        console.error('Error fetching contribution data:', error);
        this.isLoading = false;
      }
    });
  }

  // Helper methods for template
  getPerformanceColor(performance: string): string {
    switch (performance.toLowerCase()) {
      case 'excellent': return '#22c55e';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  }

  getTrendIcon(trend: string): any {
    switch (trend.toLowerCase()) {
      case 'improving': return this.faArrowUp;
      case 'declining': return this.faArrowDown;
      default: return null;
    }
  }

  getTrendColor(trend: string): string {
    switch (trend.toLowerCase()) {
      case 'improving': return '#22c55e';
      case 'declining': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getQuarterKeys(): string[] {
    return this.contributionAnalysis ? Object.keys(this.contributionAnalysis.quarters) : [];
  }

  // Format number for display
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-KE').format(value);
  }

  // Get recent months (last 4 months with data)
  getRecentMonths() {
    if (!this.contributionAnalysis) return [];
    return this.contributionAnalysis.monthly
      .filter(month => parseFloat(month.collected.replace(/[^\d.]/g, '')) > 0)
      .slice(-4);
  }


}
