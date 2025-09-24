import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EventsService } from '../../services/events/events.service';
import { UserService } from '../../services/members/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CreateEventPayload, EventTypesResponse, Event, EventsResponse, EventParticipant } from 'src/app/services/types/event.model';

// Interfaces
interface AuthState {
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface EventType {
  id: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-admin-events',
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.css']
})
export class AdminEventsComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('createEventModal') createEventModal!: ElementRef;
  @Output() viewEventDetails = new EventEmitter<{ eventId: string; event: Event }>();

  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();

  // Form and modal state
  createEventForm!: FormGroup;
  showCreateModal = false;
  isSubmitting = false;



  // Image enlargement modal state
  showImageModal = false;
  enlargedImageUrl: string | null = null;



  // Participants view state
  showParticipantsView = false;
  participants: EventParticipant[] = [];
  loadingParticipants = false;
  participantsError: string | null = null;
  participantsEvent: Event | null = null;

  // Keyboard event handler
  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this.showImageModal) {
        this.closeImageModal();
      } else if (this.showParticipantsView) {
        this.closeParticipantsView();
      } else if (this.showCreateModal) {
        this.closeCreateModal();
      }
    }
  };

  // Image upload state
  selectedFile: File | null = null;
  previewImage: string | null = null;
  isUploadingImage = false;
  uploadedImageUrl: string | null = null;

  // User info
  currentUserId: string | null = null;

  // Event types from service
  eventTypes: EventType[] = [];
  loadingEventTypes = false;
  eventTypesError: string | null = null;

  // Events from service
  events: Event[] = [];
  loadingEvents = false;
  eventsError: string | null = null;

  // Filter and search properties
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedEventType: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  // Calendar configuration
  minDate: Date = new Date();
  maxDate: Date = new Date();
  endDateMinDate: Date = new Date();

  constructor(
    private store: Store<{ auth: AuthState }>,
    private fb: FormBuilder,
    private eventsService: EventsService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    // Initialize form
    this.initializeForm();

    // Initialize date constraints
    this.initializeDateConstraints();

    // Load event types
    this.loadEventTypes();

    // Load events
    this.loadEvents();

    // Get current user info
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile?.user?.id) {
          this.currentUserId = profile.user.id;
        }
      });

    // Add keyboard event listener for modal closing
    document.addEventListener('keydown', this.handleKeydown);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeydown);
  }

  loadEventTypes(): void {
    this.loadingEventTypes = true;
    this.eventTypesError = null;

    this.eventsService.getEventTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.eventTypes = response.eventTypes || [];
          this.loadingEventTypes = false;
        },
        error: (error) => {
          console.error('Error loading event types:', error);
          this.eventTypesError = 'Failed to load event types';
          this.loadingEventTypes = false;
          this.toastr.error('Failed to load event types');
        }
      });
  }

  loadEvents(): void {
    this.loadingEvents = true;
    this.eventsError = null;

    this.eventsService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.events = response.events || [];
          this.loadingEvents = false;
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.eventsError = 'Failed to load events';
          this.loadingEvents = false;
          this.toastr.error('Failed to load events');
        }
      });
  }

  initializeForm(): void {
    this.createEventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      eventTypeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      isPaid: [false],
      fee: [0, [Validators.min(0)]]
    });

    // Watch isPaid to conditionally require fee
    this.createEventForm.get('isPaid')?.valueChanges.subscribe(isPaid => {
      const feeControl = this.createEventForm.get('fee');
      if (isPaid) {
        feeControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        feeControl?.setValidators([Validators.min(0)]);
        feeControl?.setValue(0);
      }
      feeControl?.updateValueAndValidity();
    });

    // Watch date changes for validation
    this.createEventForm.get('startDate')?.valueChanges.subscribe((startDate) => {
      if (startDate) {
        // Update minimum date for end date to be same as start date
        this.endDateMinDate = new Date(startDate);
      }
      this.validateEndDate();
    });

    this.createEventForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateEndDate();
    });
  }

  initializeDateConstraints(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to start of day

    // Set minimum date to tomorrow
    this.minDate = new Date(tomorrow);
    this.endDateMinDate = new Date(tomorrow);

    // Set maximum date to 2 years from now
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    this.maxDate = maxDate;
  }

  // Date validation methods
  validateEndDate(): void {
    const startDate = this.createEventForm.get('startDate')?.value;
    const endDate = this.createEventForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        this.createEventForm.get('endDate')?.setErrors({ invalidEndDate: true });
      } else {
        // Clear the error if dates are valid
        const errors = this.createEventForm.get('endDate')?.errors;
        if (errors && errors['invalidEndDate']) {
          delete errors['invalidEndDate'];
          if (Object.keys(errors).length === 0) {
            this.createEventForm.get('endDate')?.setErrors(null);
          } else {
            this.createEventForm.get('endDate')?.setErrors(errors);
          }
        }
      }
    }
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.resetForm();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
    this.resetImageUpload();
  }

  // Navigate to event details page
  navigateToEventDetails(event: Event): void {
    this.viewEventDetails.emit({ eventId: event.id, event: event });
  }

  // Image enlargement modal methods
  openImageModal(imageUrl: string): void {
    this.enlargedImageUrl = imageUrl;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.enlargedImageUrl = null;
  }



  // Participants view methods
  viewParticipants(event: Event): void {
    this.participantsEvent = event;
    this.loadParticipants(event.id);
    this.showParticipantsView = true;
  }

  closeParticipantsView(): void {
    this.showParticipantsView = false;
    this.participants = [];
    this.participantsEvent = null;
    this.participantsError = null;
  }

  loadParticipants(eventId: string): void {
    this.loadingParticipants = true;
    this.participantsError = null;

    this.eventsService.getParticipants(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (participants: EventParticipant[]) => {
          this.participants = participants;
          this.loadingParticipants = false;
        },
        error: (error) => {
          console.error('Error loading participants:', error);
          this.participantsError = 'Failed to load participants. Please try again.';
          this.loadingParticipants = false;
          this.toastr.error('Failed to load participants');
        }
      });
  }

  resetForm(): void {
    this.createEventForm.reset({
      name: '',
      description: '',
      eventTypeId: '',
      startDate: '',
      endDate: '',
      location: '',
      isPaid: false,
      fee: 0
    });
  }

  // Image upload methods (based on bio component)
  onImageSelected(event: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.selectedFile = file;
    }
  }

  cancelImageUpload(): void {
    this.resetImageUpload();
  }

  resetImageUpload(): void {
    this.previewImage = null;
    this.selectedFile = null;
    this.uploadedImageUrl = null;
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile || !this.currentUserId) return null;

    this.isUploadingImage = true;

    try {
      const response = await this.userService.uploadProfileImage(this.currentUserId, this.selectedFile).toPromise();
      if (response) {
        this.uploadedImageUrl = response.imageUrl;
        // this.toastr.success('Image uploaded successfully');
        return response.imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Image upload failed:', error);
      this.toastr.error('Failed to upload image');
      return null;
    } finally {
      this.isUploadingImage = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.createEventForm.invalid) {
      this.markFormGroupTouched();
      this.toastr.error('Please fill in all required fields correctly');
      return;
    }

    if (!this.currentUserId) {
      this.toastr.error('User not authenticated');
      return;
    }

    this.isSubmitting = true;
    this.spinner.show();

    try {
      // Upload image if selected
      let imageUrl = '';
      if (this.selectedFile) {
        const uploadedUrl = await this.uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Prepare payload
      const formValue = this.createEventForm.value;
      const payload: CreateEventPayload = {
        creatorId: this.currentUserId,
        eventTypeId: formValue.eventTypeId,
        name: formValue.name,
        description: formValue.description,
        startDate: new Date(formValue.startDate).toISOString(),
        endDate: new Date(formValue.endDate).toISOString(),
        location: formValue.location,
        isPaid: formValue.isPaid,
        fee: formValue.isPaid ? formValue.fee : 0,
        image: imageUrl
      };

      // Create event
      const response = await this.eventsService.createEvent(payload).toPromise();

      this.toastr.success('Event created successfully!');
      this.closeCreateModal();
      // Refresh events list
      this.loadEvents();

    } catch (error) {
      console.error('Error creating event:', error);
      this.toastr.error('Failed to create event. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.spinner.hide();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createEventForm.controls).forEach(key => {
      const control = this.createEventForm.get(key);
      control?.markAsTouched();
    });
  }

  // Utility methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createEventForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.createEventForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
      if (field.errors['invalidEndDate']) return 'End date must be after start date';
    }
    return '';
  }

  // Event utility methods
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

  getEventStatus(event: Event): { status: string; class: string } {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date || event.start_date);

    if (now < startDate) {
      return { status: 'Upcoming', class: 'bg-blue-100 text-blue-800' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'Ongoing', class: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Completed', class: 'bg-gray-100 text-gray-800' };
    }
  }

  getTimeUntilEvent(event: Event): string {
    const now = new Date();
    const startDate = new Date(event.start_date);
    
    // Compare dates only (not time) to avoid timezone issues
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    const diffTime = eventDate.getTime() - nowDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Event passed';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days`;
    }
  }

  getDaysToGo(event: Event): string {
    const now = new Date();
    const startDate = new Date(event.start_date);
    
    // Compare dates only (not time) to avoid timezone issues
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    const diffTime = eventDate.getTime() - nowDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Ended';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day';
    } else {
      return `${diffDays} days`;
    }
  }

  getEventInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  trackByEventId(index: number, event: Event): string {
    return event.id;
  }

  // Participants utility methods
  trackParticipantById(index: number, participant: EventParticipant): string {
    return participant.registration_id;
  }

  getParticipantInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getPaymentStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getRegistrationStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'registered':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'waitlisted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Statistics calculations
  get totalEvents(): number {
    return this.events.length;
  }

  get upcomingEvents(): number {
    const now = new Date();
    return this.events.filter(event => new Date(event.start_date) > now).length;
  }

  get ongoingEvents(): number {
    const now = new Date();
    return this.events.filter(event => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date || event.start_date);
      return now >= startDate && now <= endDate;
    }).length;
  }

  get completedEvents(): number {
    const now = new Date();
    return this.events.filter(event => {
      const endDate = new Date(event.end_date || event.start_date);
      return now > endDate;
    }).length;
  }

  get paidEvents(): number {
    return this.events.filter(event => event.is_paid).length;
  }

  // All filtered events (without pagination)
  get allFilteredEvents(): Event[] {
    let filtered = [...this.events];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(search) ||
        (event.description && event.description.toLowerCase().includes(search)) ||
        (event.location && event.location.toLowerCase().includes(search)) ||
        (event.event_type_name && event.event_type_name.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(event => {
        const status = this.getEventStatus(event).status.toLowerCase();
        return status === this.selectedStatus.toLowerCase();
      });
    }

    // Apply event type filter
    if (this.selectedEventType) {
      filtered = filtered.filter(event => event.event_type_id === this.selectedEventType);
    }

    // Update total pages
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    // Reset to first page if current page is beyond total pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    return filtered;
  }

  // Paginated filtered events for display
  get filteredEvents(): Event[] {
    const allFiltered = this.allFilteredEvents;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return allFiltered.slice(startIndex, endIndex);
  }

  // Total filtered events count
  get totalFilteredEvents(): number {
    return this.allFilteredEvents.length;
  }

  // Filter and search methods
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1; // Reset to first page when searching
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1; // Reset to first page when filtering
  }

  onEventTypeFilterChange(eventTypeId: string): void {
    this.selectedEventType = eventTypeId;
    this.currentPage = 1; // Reset to first page when filtering
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedEventType = '';
    this.currentPage = 1; // Reset to first page when clearing filters
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

  // Get array of page numbers for pagination display
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      // Adjust start page if we're near the end
      if (endPage === this.totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // Get start and end indices for current page display
  get currentPageStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get currentPageEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalFilteredEvents);
  }

  // Get unique statuses from current events
  get availableStatuses(): string[] {
    const statuses = this.events.map(event => this.getEventStatus(event).status);
    return [...new Set(statuses)];
  }

  // View modal utility methods
  getEventDuration(event: Event): string {
    if (!event.end_date) return 'Single day event';

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }

    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
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

  formatCreatedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Recent events getter - returns recently created events and events starting within 24 hours
  get recentEvents(): Event[] {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent = this.events.filter(event => {
      const eventStartDate = new Date(event.start_date);
      const eventCreatedDate = new Date(event.created_at);

      // Include events created in the last 7 days OR events starting within 24 hours
      return (eventCreatedDate >= last7Days) ||
        (eventStartDate >= now && eventStartDate <= next24Hours);
    });

    // Sort by creation date (newest first) and event start date (soonest first)
    return recent
      .sort((a, b) => {
        const aCreated = new Date(a.created_at).getTime();
        const bCreated = new Date(b.created_at).getTime();
        const aStart = new Date(a.start_date).getTime();
        const bStart = new Date(b.start_date).getTime();

        // Prioritize events starting within 24 hours
        const aIsUpcoming = aStart >= now.getTime() && aStart <= next24Hours.getTime();
        const bIsUpcoming = bStart >= now.getTime() && bStart <= next24Hours.getTime();

        if (aIsUpcoming && !bIsUpcoming) return -1;
        if (!aIsUpcoming && bIsUpcoming) return 1;

        // Then sort by creation date (newest first)
        return bCreated - aCreated;
      })
      .slice(0, 5); // Limit to 5 items
  }

  // Get activity type for recent events
  getActivityType(event: Event): { type: string; color: string; icon: string } {
    const now = new Date();
    const eventStartDate = new Date(event.start_date);
    const eventCreatedDate = new Date(event.created_at);
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Event starting within 24 hours
    if (eventStartDate >= now && eventStartDate <= next24Hours) {
      return {
        type: 'upcoming',
        color: 'bg-yellow-500',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      };
    }

    // Recently created event (within last 24 hours)
    if (eventCreatedDate >= last24Hours) {
      return {
        type: 'created',
        color: 'bg-green-500',
        icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
      };
    }

    // Default for other recent events
    return {
      type: 'updated',
      color: 'bg-blue-500',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    };
  }

  // Get relative time for activity
  getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return this.formatDate(dateString);
  }

  // Get activity message for recent events
  getActivityMessage(event: Event): string {
    const activityType = this.getActivityType(event);
    const now = new Date();
    const eventStartDate = new Date(event.start_date);
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (activityType.type === 'upcoming') {
      const hoursUntil = Math.ceil((eventStartDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      return `Starting in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`;
    }

    if (activityType.type === 'created') {
      return 'New event created';
    }

    return 'Event updated';
  }


}
