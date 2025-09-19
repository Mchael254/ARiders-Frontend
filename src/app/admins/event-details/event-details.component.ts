import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Event, EventSummaryResponse } from 'src/app/services/types/event.model';
import { EventsService } from 'src/app/services/events/events.service';

// Interface for auth state
interface AuthState {
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() eventId: string | null = null;
  @Input() event: Event | null = null;
  @Input() viewData: any = {};
  @Output() backToEvents = new EventEmitter<void>();

  profile$: Observable<AuthState>;

  // Event summary data
  eventSummary: EventSummaryResponse | null = null;
  loadingSummary: boolean = false;
  summaryError: string | null = null;

  // Participants table filtering and pagination
  participantSearchTerm: string = '';
  participantStatusFilter: string = 'all';
  participantPaymentFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Modal properties
  isParticipantModalOpen: boolean = false;
  selectedParticipant: any = null;

  // Delete event modal state
  showDeleteModal = false;
  deleteReason: string = '';
  isDeleting = false;

  private destroy$ = new Subject<void>();

  // User info
  currentUserId: string | null = null;

  constructor(
    private eventsService: EventsService,
    private store: Store<{ auth: AuthState }>,
    private toastr: ToastrService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  // Keyboard event handler
  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this.showDeleteModal) {
        this.closeDeleteModal();
      } else if (this.isParticipantModalOpen) {
        this.closeParticipantModal();
      }
    }
  };

  ngOnInit(): void {
    console.log('EventDetailsComponent ngOnInit - eventId:', this.eventId, 'event:', this.event);
    if (this.eventId) {
      this.loadEventSummary(this.eventId);
    } else if (this.event) {
      this.loadEventSummary(this.event.id);
    } else {
      console.warn('EventDetailsComponent: No eventId or event provided');
    }

    // Get current user info
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        this.currentUserId = profile.user?.id || null;
      });

    // Add keyboard event listener for modal closing
    document.addEventListener('keydown', this.handleKeydown);
  }

  ngOnChanges(): void {
    console.log('EventDetailsComponent ngOnChanges - eventId:', this.eventId, 'event:', this.event);
    if (this.eventId || this.event) {
      const id = this.eventId || this.event?.id;
      if (id) {
        console.log('Loading event summary for ID:', id);
        this.loadEventSummary(id);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeydown);
  }

  loadEventSummary(eventId: string): void {
    console.log('loadEventSummary called with eventId:', eventId);
    this.loadingSummary = true;
    this.summaryError = null;

    this.eventsService.getEventSummary(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Event summary loaded successfully:', response);
          this.eventSummary = response;
          this.loadingSummary = false;
        },
        error: (error) => {
          console.error('Error loading event summary:', error);
          this.summaryError = `Failed to load event summary: ${error.error?.message || error.message || 'Unknown error'}`;
          this.loadingSummary = false;
        }
      });
  }

  goBackToEvents(): void {
    this.backToEvents.emit();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Utility methods for displaying summary data
  get displayEvent(): Event | null {
    // Use event from summary if available, otherwise use input event
    if (this.eventSummary?.event) {
      return {
        id: this.eventSummary.event.id,
        name: this.eventSummary.event.name,
        start_date: this.eventSummary.event.start_date,
        end_date: this.eventSummary.event.end_date,
        location: this.eventSummary.event.location,
        is_paid: this.eventSummary.event.is_paid,
        fee: this.eventSummary.event.fee,
        image: this.eventSummary.event.image,
        created_at: this.eventSummary.event.created_at,
        created_by: this.eventSummary.event.created_by.id,
        // Fill required fields with defaults
        event_type_id: ''
      } as Event;
    }
    return this.event;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'unpaid': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getRegistrationStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  trackParticipantById(index: number, participant: any): string {
    return participant.registration_id || index.toString();
  }

  getInitials(name: string): string {
    if (!name) return 'N/A';
    return name.split(' ')
      .map(n => n.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // Participants filtering and pagination methods
  get filteredParticipants(): any[] {
    if (!this.eventSummary?.details) return [];

    let filtered = this.eventSummary.details.filter(participant => {
      // Search filter
      const searchMatch = !this.participantSearchTerm ||
        participant.name.toLowerCase().includes(this.participantSearchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(this.participantSearchTerm.toLowerCase()) ||
        participant.phone_number.includes(this.participantSearchTerm);

      // Status filter
      const statusMatch = this.participantStatusFilter === 'all' ||
        participant.status === this.participantStatusFilter;

      // Payment filter (only for paid events)
      const paymentMatch = !this.eventSummary?.event.is_paid ||
        this.participantPaymentFilter === 'all' ||
        participant.payment_status === this.participantPaymentFilter;

      return searchMatch && statusMatch && paymentMatch;
    });

    return filtered;
  }

  get paginatedParticipants(): any[] {
    const filtered = this.filteredParticipants;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredParticipants.length / this.itemsPerPage);
  }

  get totalFilteredCount(): number {
    return this.filteredParticipants.length;
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page when searching
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filtering
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  clearFilters(): void {
    this.participantSearchTerm = '';
    this.participantStatusFilter = 'all';
    this.participantPaymentFilter = 'all';
    this.currentPage = 1;
  }

  // Modal methods
  openParticipantModal(participant: any): void {
    this.selectedParticipant = participant;
    this.isParticipantModalOpen = true;
    console.log('Opening participant modal for:', participant.name);
  }

  closeParticipantModal(): void {
    this.isParticipantModalOpen = false;
    this.selectedParticipant = null;
  }

  // Delete event modal methods
  openDeleteModal(): void {
    this.deleteReason = '';
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteReason = '';
    this.isDeleting = false;
  }

  deleteEvent(): void {
    if (!this.eventSummary || !this.currentUserId) {
      this.toastr.error('Unable to delete event. Missing information.');
      return;
    }

    if (!this.deleteReason.trim()) {
      this.toastr.error('Please provide a reason for deletion.');
      return;
    }

    this.isDeleting = true;

    this.eventsService.deleteEvent(
      this.currentUserId,
      this.eventSummary.event.id,
      this.deleteReason.trim()
    ).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Event deleted successfully');

        // Close the delete modal
        this.closeDeleteModal();

        // Navigate back to events list
        this.backToEvents.emit();
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        this.toastr.error(error.error?.message || 'Failed to delete event. Please try again.');
        this.isDeleting = false;
      }
    });
  }

  // Helper method for template
  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
