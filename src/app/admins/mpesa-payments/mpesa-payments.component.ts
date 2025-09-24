import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { AuthState } from 'src/app/store/auth/auth.reducer';
import { 
  MpesaReceiptsData, 
  MemberPaymentData, 
  MpesaReceipt, 
  PaymentAnalysis 
} from 'src/app/interfaces/mpesa-receipts';

@Component({
  selector: 'app-mpesa-payments',
  templateUrl: './mpesa-payments.component.html',
  styleUrls: ['./mpesa-payments.component.css']
})
export class MpesaPaymentsComponent implements OnInit, OnDestroy {
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();
  
  // User data
  authorizer_id: string | null = null;
  
  // M-Pesa data
  mpesaData: MpesaReceiptsData | null = null;
  loading: boolean = false;
  noData: boolean = false;
  
  // Filter and search properties
  searchTerm: string = '';
  selectedPaymentType: string = '';
  selectedStatus: string = '';
  selectedDateRange: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  
  // View modes
  viewMode: 'overview' | 'members' | 'receipts' | 'member-receipts' = 'overview';
  selectedMember: MemberPaymentData | null = null;
  
  // Analytics
  paymentTypes: string[] = [];
  statusTypes: string[] = ['Success', 'Failed'];

  constructor(
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private store: Store<{ auth: AuthState }>
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.profile$.pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile && profile.user?.id) {
          this.authorizer_id = profile.user.id;
          this.fetchMpesaReceipts();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchMpesaReceipts(): void {
    if (!this.authorizer_id) {
      this.toastr.error('User ID not found');
      return;
    }

    this.loading = true;
    this.noData = false;
    
    this.paymentService.getMpesaReceipts(this.authorizer_id).subscribe({
      next: (response) => {
        console.log(response);
        
        this.loading = false;
        if (response && response.members && response.members.length > 0) {
          this.mpesaData = response;
          this.extractPaymentTypes();
          this.calculatePagination();
          
          // Check if there's any meaningful data (members with receipts)
          const membersWithReceipts = this.mpesaData?.members?.filter(m => m.receipts.length > 0) || [];
          this.noData = membersWithReceipts.length === 0;
        } else {
          this.noData = true;
          this.mpesaData = null;
        }
      },
      error: (err) => {
        console.error('Error fetching M-Pesa receipts:', err);
        this.loading = false;
        this.noData = true;
        this.toastr.error('Failed to load M-Pesa receipts');
      }
    });
  }

  extractPaymentTypes(): void {
    if (!this.mpesaData) return;
    
    const types = new Set<string>();
    this.mpesaData.members.forEach(member => {
      member.receipts.forEach(receipt => {
        types.add(receipt.payment_type);
      });
    });
    this.paymentTypes = Array.from(types);
  }

  // Get members with receipts only
  get membersWithReceipts(): MemberPaymentData[] {
    if (!this.mpesaData) return [];
    return this.mpesaData.members.filter(m => m.receipts.length > 0);
  }

  // Filtering logic
  get filteredMembers(): MemberPaymentData[] {
    if (!this.mpesaData) return [];
    
    // Start with members who have receipts
    let filtered = [...this.membersWithReceipts];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(memberData => {
        const name = (memberData.member.name || '').toString().toLowerCase();
        const email = (memberData.member.email || '').toString().toLowerCase();
        const phone = (memberData.member.phone || '').toString().toLowerCase();
        return name.includes(search) || email.includes(search) || phone.includes(search);
      });
    }

    return filtered;
  }

  get paginatedMembers(): MemberPaymentData[] {
    const filtered = this.filteredMembers;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  get allReceipts(): MpesaReceipt[] {
    if (!this.mpesaData) return [];
    
    let receipts: MpesaReceipt[] = [];
    
    // If viewing specific member details, show only that member's receipts
    if (this.selectedMember) {
      receipts = [...this.selectedMember.receipts];
    } else {
      // Otherwise show all receipts
      this.mpesaData.members.forEach(member => {
        receipts = [...receipts, ...member.receipts];
      });
    }

    // Apply filters
    let filtered = [...receipts];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(receipt => {
        const receiptNumber = (receipt.receipt_number || '').toString().toLowerCase();
        const paymentType = (receipt.payment_type || '').toString().toLowerCase();
        const phoneNumber = (receipt.phone_number || '').toString().toLowerCase();
        const eventName = receipt.event_details ? (receipt.event_details.event_name || '').toString().toLowerCase() : '';
        const status = (receipt.status || '').toString().toLowerCase();

        return receiptNumber.includes(search) ||
               paymentType.includes(search) ||
               phoneNumber.includes(search) ||
               eventName.includes(search) ||
               status.includes(search);
      });
    }

    if (this.selectedPaymentType) {
      filtered = filtered.filter(receipt => receipt.payment_type === this.selectedPaymentType);
    }

    if (this.selectedStatus) {
      if (this.selectedStatus === 'Success') {
        filtered = filtered.filter(receipt => receipt.status === 'Success');
      } else if (this.selectedStatus === 'Failed') {
        filtered = filtered.filter(receipt => receipt.status !== 'Success');
      }
    }

    if (this.selectedDateRange) {
      // Implement date filtering logic here
      const today = new Date();
      let filterDate = new Date();
      
      switch (this.selectedDateRange) {
        case 'today':
          filterDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          break;
        case 'week':
          filterDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          filterDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
      }

      if (this.selectedDateRange !== '') {
        filtered = filtered.filter(receipt => {
          const receiptDate = new Date(receipt.transaction_date);
          return receiptDate >= filterDate;
        });
      }
    }

    return filtered;
  }

  get paginatedReceipts(): MpesaReceipt[] {
    const filtered = this.allReceipts;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  calculatePagination(): void {
    const totalItems = this.viewMode === 'members' ? 
      this.filteredMembers.length : 
      this.allReceipts.length;
    
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
    
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
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

  get canGoToPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canGoToNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const totalPages = this.totalPages;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  // View mode methods
  setViewMode(mode: 'overview' | 'members' | 'receipts' | 'member-receipts'): void {
    this.viewMode = mode;
    this.currentPage = 1;
    
    // Clear selected member when switching to different views (except when staying in receipt views)
    if (mode !== 'receipts' && mode !== 'member-receipts') {
      this.selectedMember = null;
    }
    
    this.calculatePagination();
  }

  viewMemberDetails(member: MemberPaymentData): void {
    this.selectedMember = member;
    // Clear filters when viewing member details
    this.clearFilters();
    this.setViewMode('member-receipts');
  }

  backToMembers(): void {
    this.selectedMember = null;
    this.clearFilters();
    this.setViewMode('members');
  }

  goToAllReceipts(): void {
    this.selectedMember = null;
    this.setViewMode('receipts');
  }

  // Filter methods
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.calculatePagination();
  }

  onPaymentTypeFilterChange(paymentType: string): void {
    this.selectedPaymentType = paymentType;
    this.currentPage = 1;
    this.calculatePagination();
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.calculatePagination();
  }

  onDateRangeFilterChange(dateRange: string): void {
    this.selectedDateRange = dateRange;
    this.currentPage = 1;
    this.calculatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPaymentType = '';
    this.selectedStatus = '';
    this.selectedDateRange = '';
    this.currentPage = 1;
    this.calculatePagination();
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    if (status === 'Success') {
      return 'text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium';
    } else {
      // All non-success statuses get red styling (failed)
      return 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium';
    }
  }

  getSuccessRate(analysis: PaymentAnalysis): number {
    if (analysis.total_receipts === 0) return 0;
    return Math.round((analysis.successful_receipts / analysis.total_receipts) * 100);
  }

  // Refresh data
  refreshData(): void {
    this.fetchMpesaReceipts();
  }

  // Math property for template
  Math = Math;

  // Calculate totals for current view
  get totalAmount(): number {
    return this.allReceipts
      .filter(r => r.status === 'Success')
      .reduce((sum, receipt) => sum + receipt.amount, 0);
  }

  get filteredCount(): number {
    return this.viewMode === 'members' ? 
      this.filteredMembers.length : 
      this.allReceipts.length;
  }

  // Track by functions for performance
  trackByMemberId(index: number, memberData: MemberPaymentData): string {
    return memberData.member.id;
  }

  trackByReceiptId(index: number, receipt: MpesaReceipt): string {
    return receipt.receipt_number;
  }

  // Calculate total successful amount for a member
  getMemberSuccessfulAmount(memberData: MemberPaymentData): number {
    return memberData.receipts
      .filter(r => r.status === 'Success')
      .reduce((sum, receipt) => sum + receipt.amount, 0);
  }

  // Get grand total successful amount
  get grandTotalAmount(): number {
    if (!this.mpesaData) return 0;
    return this.membersWithReceipts
      .reduce((total, member) => total + this.getMemberSuccessfulAmount(member), 0);
  }

  // Get top paying members sorted by amount paid
  getTopPayingMembers(): MemberPaymentData[] {
    return [...this.membersWithReceipts]
      .sort((a, b) => this.getMemberSuccessfulAmount(b) - this.getMemberSuccessfulAmount(a))
      .slice(0, 5);
  }

  // Format payment type display with event name for event fees
  formatPaymentTypeDisplay(receipt: MpesaReceipt): string {
    const paymentType = receipt.payment_type;
    const isEventFee = paymentType.toLowerCase() === 'event fee' || paymentType.toLowerCase() === 'event_fee';
    
    if (isEventFee && receipt.event_details) {
      return `${this.titleCase(paymentType)} (${receipt.event_details.event_name})`;
    } else {
      return this.titleCase(paymentType);
    }
  }

  // Helper method for title case formatting
  private titleCase(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
