import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EventsService } from '../../services/events/events.service';
import { Event as APIEvent, EventType, EventTypesResponse, EventsResponse, EventRegistration, EventDetails } from 'src/app/services/types/event.model';

// Interfaces
interface AuthState {
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Extended Event interface for frontend use
interface Event {
  id: string;
  event_type_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  is_paid: boolean;
  fee?: number;
  created_at: string;
  created_by: string;
  image?: string;
  event_type_name?: string;
  // Extended properties for frontend
  event_type: {
    id: string;
    name: string;
  };
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  registrations?: ExtendedEventRegistration[];
  max_participants?: number;
}

interface ExtendedEventRegistration extends EventRegistration {
  user_id: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}


@Component({
  selector: 'app-member-events',
  templateUrl: './member-events.component.html',
  styleUrls: ['./member-events.component.css']
})
export class MemberEventsComponent implements OnInit, OnDestroy {
  @ViewChild('registerModal') registerModal!: ElementRef;
  math = Math;
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();

  // User info
  currentUserId: string | null = null;
  currentUser: any = null;

  // Events data
  events: Event[] = [];
  myEvents: Event[] = [];
  memberEvents: EventDetails[] = [];
  loadingEvents = false;
  eventsError: string | null = null;

  // Event types
  eventTypes: EventType[] = [];
  loadingEventTypes = false;

  // Modal state
  showRegisterModal = false;
  showEventModal = false;
  showImageModal = false;
  selectedEvent: Event | null = null;
  enlargedImageUrl: string | null = null;
  isModalFromMyEvents = false;

  // Registration state
  registrationForm!: FormGroup;
  isRegistering = false;
  registrationError: string | null = null;

  // Filter and search properties
  searchTerm: string = '';
  selectedEventType: string = '';
  selectedStatus: string = '';
  dateFilter: string = '';
  showMyEventsOnly: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  // View modes
  viewMode: 'grid' | 'list' = 'grid';
  // Tab selection removed — tabs replaced by static counters in template

  // Keyboard event handler
  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this.showImageModal) {
        this.closeImageModal();
      } else if (this.showEventModal) {
        this.closeEventModal();
      } else if (this.showRegisterModal) {
        this.closeRegisterModal();
      }
    }
  };

  constructor(
    private store: Store<{ auth: AuthState }>,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private eventsService: EventsService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.initializeRegistrationForm();
    this.loadEventTypes();
    this.loadEvents();

    // Get current user info
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile?.user) {
          this.currentUserId = profile.user.id;
          this.currentUser = profile.user;
          this.loadMemberEvents();
        }
      });

    // Add keyboard event listener
    document.addEventListener('keydown', this.handleKeydown);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('keydown', this.handleKeydown);
  }

  initializeRegistrationForm(): void {
    this.registrationForm = this.fb.group({
      specialRequests: [''],
      emergencyContact: ['', [Validators.required]],
      emergencyPhone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  loadEvents(): void {
    this.loadingEvents = true;
    this.eventsError = null;

    this.eventsService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: EventsResponse) => {
          // Transform API events to frontend events
          this.events = response.events.map(apiEvent => this.transformApiEvent(apiEvent));
          this.loadingEvents = false;
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.eventsError = 'Failed to load events. Please try again.';
          this.loadingEvents = false;
          this.toastr.error('Failed to load events');
        }
      });
  }

  private transformApiEvent(apiEvent: APIEvent): Event {
    return {
      ...apiEvent,
      event_type: {
        id: apiEvent.event_type_id,
        name: apiEvent.event_type_name || 'Unknown'
      },
      created_by_user: {
        id: apiEvent.created_by,
        first_name: 'Event',
        last_name: 'Creator'
      },
      registrations: [],
      max_participants: undefined
    };
  }

  loadMemberEvents(): void {
    if (!this.currentUserId) return;

    this.eventsService.getMemberEvents(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: EventDetails[]) => {
          this.memberEvents = response || [];
        },
        error: (error) => {
          console.error('Error loading member events:', error);
          // Don't show error to user for member events - it's supplementary data
        }
      });
  }

  loadEventTypes(): void {
    this.loadingEventTypes = true;

    this.eventsService.getEventTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: EventTypesResponse) => {
          this.eventTypes = response.eventTypes || [];
          this.loadingEventTypes = false;
        },
        error: (error) => {
          console.error('Error loading event types:', error);
          this.loadingEventTypes = false;
          // Fallback to default event types if API fails
          this.eventTypes = [
            { id: '1', name: 'Training' },
            { id: '2', name: 'Competition' },
            { id: '3', name: 'Social' },
            { id: '4', name: 'Charity' }
          ];
        }
      });
  }

  // Modal methods
  openRegisterModal(event: Event): void {
    this.selectedEvent = event;
    this.showRegisterModal = true;
    this.resetRegistrationForm();
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
    this.selectedEvent = null;
    this.resetRegistrationForm();
  }

  openEventModal(event: Event, fromMyEvents: boolean = false): void {
    this.selectedEvent = event;
    this.showEventModal = true;
    this.isModalFromMyEvents = fromMyEvents;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedEvent = null;
    this.isModalFromMyEvents = false;
  }

  openImageModal(imageUrl: string): void {
    this.enlargedImageUrl = imageUrl;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.enlargedImageUrl = null;
  }

  resetRegistrationForm(): void {
    this.registrationForm.reset({
      specialRequests: '',
      emergencyContact: '',
      emergencyPhone: '',
      termsAccepted: false
    });
    this.registrationError = null;
  }

  // Registration methods
  async registerForEvent(): Promise<void> {
    if (this.registrationForm.invalid || !this.selectedEvent || !this.currentUserId) {
      this.markFormGroupTouched();
      return;
    }

    this.isRegistering = true;
    this.registrationError = null;

    try {
      const formValues = this.registrationForm.value;

      await this.eventsService.registerForEvent(
        this.currentUserId,
        this.selectedEvent.id,
        formValues.emergencyContact,
        formValues.emergencyPhone,
        formValues.specialRequests // maps to notes parameter
      ).toPromise();

      this.toastr.success('Successfully registered for the event!');
      this.closeRegisterModal();
      this.loadMemberEvents(); // Refresh member events
    } catch (error) {
      console.error('Registration error:', error);
      this.registrationError = 'Failed to register for event. Please try again.';
      this.toastr.error('Registration failed');
    } finally {
      this.isRegistering = false;
    }
  }

  cancelRegistration(event: Event): void {
    if (!this.currentUserId) return;

    if (confirm('Are you sure you want to cancel your registration for this event?')) {
      this.eventsService.cancelRegistration(this.currentUserId, event.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.toastr.success('Registration cancelled successfully');
            this.loadMemberEvents(); // Refresh member events
          },
          error: (error) => {
            console.error('Error cancelling registration:', error);
            this.toastr.error('Failed to cancel registration');
          }
        });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      this.registrationForm.get(key)?.markAsTouched();
    });
  }

  // Utility methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isUserRegistered(event: Event): boolean {
    if (!this.currentUserId) return false;
    return this.memberEvents.some(memberEvent =>
      memberEvent.event_id === event.id
    );
  }

  canRegister(event: Event): boolean {
    const now = new Date();
    const eventStart = new Date(event.start_date);
    const isNotStarted = eventStart > now;
    const isNotFull = !event.max_participants ||
      (event.registrations?.filter(r => r.status === 'registered' || r.status === 'confirmed').length || 0) < event.max_participants;
    const isNotRegistered = !this.isUserRegistered(event);

    return isNotStarted && isNotFull && isNotRegistered;
  }

  getEventStatus(event: Event): { status: string; class: string } {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date || event.start_date);

    if (now < startDate) {
      return { status: 'Upcoming', class: 'bg-green-100 text-green-800' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'Ongoing', class: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'Completed', class: 'bg-gray-100 text-gray-800' };
    }
  }

  getRegistrationCount(event: Event): number {
    return event.registrations?.filter(r => r.status === 'registered' || r.status === 'confirmed').length || 0;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFullDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDaysUntilEvent(event: Event): number {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const diffTime = startDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Filter and search methods
  get filteredEvents(): Event[] {
    const filtered = this.getAllFilteredEvents();

    // Update pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;

    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalFilteredEvents(): number {
    return this.getAllFilteredEvents().length;
  }

  private getAllFilteredEvents(): Event[] {
    let filtered = [...this.events];

    // Show only user's events if toggle is on
    if (this.showMyEventsOnly) {
      filtered = filtered.filter(event => this.isUserRegistered(event));
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(term) ||
        (event.description && event.description.toLowerCase().includes(term)) ||
        (event.location && event.location.toLowerCase().includes(term))
      );
    }

    // Apply event type filter
    if (this.selectedEventType) {
      filtered = filtered.filter(event => event.event_type.id === this.selectedEventType);
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(event => this.getEventStatus(event).status === this.selectedStatus);
    }

    // Apply date filter
    if (this.dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date);
        switch (this.dateFilter) {
          case 'today':
            return eventDate >= today && eventDate < tomorrow;
          case 'week':
            return eventDate >= today && eventDate <= weekFromNow;
          case 'month':
            return eventDate >= today && eventDate <= monthFromNow;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  // Filter methods
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedEventType = '';
    this.selectedStatus = '';
    this.dateFilter = '';
    this.showMyEventsOnly = false;
    this.currentPage = 1;
  }

  toggleMyEvents(): void {
    this.showMyEventsOnly = !this.showMyEventsOnly;
    this.currentPage = 1;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Tab navigation removed — replaced by static counters in template

  // Statistics
  get upcomingEventsCount(): number {
    const now = new Date();
    return this.events.filter(event => new Date(event.start_date) > now).length;
  }

  get myRegistrationsCount(): number {
    return this.memberEvents.filter(memberEvent => memberEvent.status === 'registered' || memberEvent.status === 'confirmed').length;
  }

  get paidEventsCount(): number {
    return this.events.filter(event => event.is_paid).length;
  }

  // My Events section methods
  getRegistrationStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'registered':
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'waitlisted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getEventTimeStatus(memberEvent: EventDetails): { status: string; class: string } {
    const now = new Date();
    const startDate = new Date(memberEvent.start_date);
    const endDate = new Date(memberEvent.end_date || memberEvent.start_date);

    if (now < startDate) {
      const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`,
        class: 'text-green-600 font-medium'
      };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'Ongoing', class: 'text-blue-600 font-medium' };
    } else {
      return { status: 'Completed', class: 'text-gray-500' };
    }
  }

  viewEventDetails(memberEvent: EventDetails): void {
    // Find the corresponding event in the events array
    const event = this.events.find(e => e.id === memberEvent.event_id);
    if (event) {
      this.openEventModal(event, true); // true indicates opened from My Events
    } else {
      // Create a temporary event object from memberEvent data
      const tempEvent: Event = {
        id: memberEvent.event_id,
        event_type_id: '', // Not available in EventDetails
        name: memberEvent.event_name,
        description: memberEvent.event_description,
        start_date: memberEvent.start_date,
        end_date: memberEvent.end_date,
        location: memberEvent.location,
        is_paid: memberEvent.is_paid,
        fee: memberEvent.fee,
        created_at: '', // Not available in EventDetails
        created_by: '', // Not available in EventDetails
        image: memberEvent.event_image,
        event_type: {
          id: '',
          name: 'Unknown'
        },
        registrations: [],
        max_participants: undefined
      };
      this.openEventModal(tempEvent, true); // true indicates opened from My Events
    }
  }

  canCancelRegistration(memberEvent: EventDetails): boolean {
    const now = new Date();
    const eventStart = new Date(memberEvent.start_date);
    // Allow cancellation if event hasn't started yet
    return eventStart > now;
  }

  cancelMemberEventRegistration(memberEvent: EventDetails): void {
    if (!this.currentUserId) return;

    if (confirm(`Are you sure you want to cancel your registration for "${memberEvent.event_name}"?`)) {
      this.eventsService.cancelRegistration(this.currentUserId, memberEvent.event_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.toastr.success('Registration cancelled successfully');
            this.loadMemberEvents(); // Refresh member events
            this.loadEvents(); // Also refresh main events to update counts
          },
          error: (error) => {
            console.error('Error cancelling registration:', error);
            this.toastr.error('Failed to cancel registration');
          }
        });
    }
  }

  payForEvent(memberEvent: EventDetails): void {
    if (!this.currentUserId) {
      this.toastr.error('User not authenticated');
      return;
    }

    // Show confirmation dialog
    if (confirm(`Proceed to pay $${memberEvent.fee} for "${memberEvent.event_name}"?`)) {
      this.spinner.show();

      // TODO: Implement payment integration (e.g., M-Pesa, Stripe, etc.)
      // For now, we'll simulate payment processing

      setTimeout(() => {
        // Simulate successful payment
        this.toastr.success('Payment processed successfully!');
        this.loadMemberEvents(); // Refresh member events to update payment status
        this.spinner.hide();

        // TODO: Replace this simulation with actual payment service call
        // Example:
        // this.paymentService.processPayment({
        //   userId: this.currentUserId,
        //   eventId: memberEvent.event_id,
        //   amount: memberEvent.fee,
        //   description: `Payment for ${memberEvent.event_name}`
        // }).subscribe({
        //   next: (response) => {
        //     this.toastr.success('Payment processed successfully!');
        //     this.loadMemberEvents();
        //   },
        //   error: (error) => {
        //     console.error('Payment error:', error);
        //     this.toastr.error('Payment failed. Please try again.');
        //   }
        // });

      }, 2000); // Simulate 2-second processing time
    }
  }
}
