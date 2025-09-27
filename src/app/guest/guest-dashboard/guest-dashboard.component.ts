import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { UserService } from '../../services/members/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MemberReceiptsResponse } from '../../services/types/memberService';
import * as GuestPanelActions from '../../store/panel/guest/actions';
import { AppState } from 'src/app/store';
import { AuthState } from 'src/app/store/auth/auth.reducer';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-guest-dashboard',
  templateUrl: './guest-dashboard.component.html',
  styleUrls: ['./guest-dashboard.component.css']
})
export class GuestDashboardComponent implements OnInit, OnDestroy {
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();

  profileId: string | null = null;
  welcomeName: string = 'Guest';
  memberSinceYear: string = '';
  loading: boolean = false;
  error: string | null = null;

  // Guest-specific data
  recentReceipts: any[] = [];
  totalReceiptsCount: number = 0;
  totalAmountPaid: number = 0;
  loadingReceipts: boolean = false;
  upcomingEvents: any[] = [];

  // Membership activation modal
  showMembershipModal: boolean = false;
  faCrown = faCrown;

  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile && profile.user?.id) {
          this.profileId = profile.user.id;
          this.welcomeName = profile.user.first_name || 'Guest';
          this.memberSinceYear = new Date().getFullYear().toString();

          this.fetchGuestData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchGuestData(): void {
    if (!this.profileId) return;

    this.loading = true;
    this.fetchReceipts();
    // Add other guest-specific data fetching here
    this.loading = false;
  }

  fetchReceipts(): void {
    if (!this.profileId) return;

    this.loadingReceipts = true;
    this.userService.getMemberReceipts(this.profileId).subscribe({
      next: (data: MemberReceiptsResponse) => {
        this.recentReceipts = (data.receipts || [])
          .filter(receipt => receipt.status?.toLowerCase() === 'success')
          .slice(0, 3); // Show only recent 3 receipts

        this.totalReceiptsCount = data.receipts?.filter(
          receipt => receipt.status?.toLowerCase() === 'success'
        ).length || 0;

        // Calculate total amount paid
        this.totalAmountPaid = data.receipts
          ?.filter(receipt => receipt.status?.toLowerCase() === 'success')
          ?.reduce((sum, receipt) => sum + (receipt.amount || 0), 0) || 0;

        this.loadingReceipts = false;
      },
      error: (err) => {
        console.error('Error fetching receipts:', err);
        this.loadingReceipts = false;
        this.error = 'Unable to load receipt data';
      }
    });
  }

  // Navigation methods
  navigateToProfile(): void {
    this.store.dispatch(GuestPanelActions.setGuestPanelView({ view: 'profile' }));
  }

  navigateToEvents(): void {
    this.store.dispatch(GuestPanelActions.setGuestPanelView({ view: 'events' }));
  }

  navigateToSubscriptions(): void {
    this.store.dispatch(GuestPanelActions.setGuestPanelView({ view: 'registrations' }));
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  // Membership activation modal methods
  openMembershipModal(): void {
    this.showMembershipModal = true;
  }

  closeMembershipModal(): void {
    this.showMembershipModal = false;
  }

  proceedToMembership(): void {
    this.closeMembershipModal();
    this.router.navigate(['/signup']);
  }

  // Check if user is a guest
  isGuestUser(profile: any): boolean {
    return profile?.user?.role?.toLowerCase() === 'guest';
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getFormattedTransactionDate(dateStr: string): string {
    if (!dateStr) return 'N/A';

    // Handle different date formats
    if (dateStr.length === 14) {
      return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}/${dateStr.slice(0, 4)}`;
    }

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (error) {
      return dateStr;
    }
  }
}
