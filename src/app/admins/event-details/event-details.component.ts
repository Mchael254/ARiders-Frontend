import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Event, EventSummaryResponse, EventType, EditEventPayload } from 'src/app/services/types/event.model';
import { EventsService } from 'src/app/services/events/events.service';
import { UserService } from 'src/app/services/members/user.service';

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

  // Edit event modal state
  showEditModal = false;
  editEventForm!: FormGroup;
  eventTypes: EventType[] = [];
  loadingEventTypes = false;
  formHasChanges = false;
  originalFormValues: any = null;

  // Image upload state for edit modal
  selectedFile: File | null = null;
  previewImage: string | null = null;

  private destroy$ = new Subject<void>();

  // User info
  currentUserId: string | null = null;

  constructor(
    private eventsService: EventsService,
    private store: Store<{ auth: AuthState }>,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private userService: UserService,
    private spinner: NgxSpinnerService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  // Keyboard event handler
  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this.showDeleteModal) {
        this.closeDeleteModal();
      } else if (this.showEditModal) {
        this.closeEditModal();
      } else if (this.isParticipantModalOpen) {
        this.closeParticipantModal();
      }
    }
  };

  ngOnInit(): void {
    console.log('EventDetailsComponent ngOnInit - eventId:', this.eventId, 'event:', this.event);
    
    // Initialize edit form first
    this.initializeEditForm();
    
    // Load event types for edit form
    this.loadEventTypes();
    
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
        description: this.eventSummary.event.description,
        start_date: this.eventSummary.event.start_date,
        end_date: this.eventSummary.event.end_date,
        location: this.eventSummary.event.location,
        is_paid: this.eventSummary.event.is_paid,
        fee: this.eventSummary.event.fee,
        image: this.eventSummary.event.image,
        created_at: this.eventSummary.event.created_at,
        created_by: this.eventSummary.event.created_by?.id,
        event_type_id: this.eventSummary.event.event_type?.id,
        event_type_name: this.eventSummary.event.event_type?.name
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

  // Participants filtering and pagination methods
  get filteredParticipants(): any[] {
    if (!this.eventSummary?.details || !Array.isArray(this.eventSummary.details)) return [];

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

  // Edit form initialization
  initializeEditForm(): void {
    try {
      this.editEventForm = this.fb.group({
        eventTypeId: ['', Validators.required],
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        startDate: ['', Validators.required],
        endDate: [''],
        location: [''],
        isPaid: [false],
        fee: [0, [Validators.min(0)]]
      });

      // Watch isPaid to conditionally require fee
      this.editEventForm.get('isPaid')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(isPaid => {
          const feeControl = this.editEventForm.get('fee');
          if (isPaid) {
            feeControl?.setValidators([Validators.required, Validators.min(1)]);
          } else {
            feeControl?.setValidators([Validators.min(0)]);
            feeControl?.setValue(0);
          }
          feeControl?.updateValueAndValidity();
        });

      // Watch for form changes
      this.editEventForm.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.checkFormChanges();
        });

      console.log('Edit form initialized successfully');
    } catch (error) {
      console.error('Error initializing edit form:', error);
    }
  }

  // Load event types for edit form
  loadEventTypes(): void {
    this.loadingEventTypes = true;
    
    this.eventsService.getEventTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.eventTypes = response.eventTypes || [];
          this.loadingEventTypes = false;
        },
        error: (error) => {
          console.error('Error loading event types:', error);
          this.loadingEventTypes = false;
          this.toastr.error('Failed to load event types');
        }
      });
  }

  // Check if event can be edited (only upcoming events can be edited)
  canEditEvent(): boolean {
    if (!this.displayEvent) return false;
    
    const eventStatus = this.getEventStatus(this.displayEvent);
    
    // Only allow editing if the event is upcoming
    return eventStatus.status === 'Upcoming';
  }

  // Get tooltip text for edit button
  getEditTooltip(): string {
    if (!this.displayEvent) return 'Event not available';
    
    if (this.canEditEvent()) {
      return 'Edit Event';
    }
    
    const eventStatus = this.getEventStatus(this.displayEvent).status;
    return `Cannot edit ${eventStatus.toLowerCase()} event. Only upcoming events can be edited.`;
  }

  // Open edit modal
  openEditModal(): void {
    if (!this.displayEvent || !this.canEditEvent()) {
      const eventStatus = this.displayEvent ? this.getEventStatus(this.displayEvent).status : 'unknown';
      this.toastr.error(`This event cannot be edited because it is ${eventStatus.toLowerCase()}. Only upcoming events can be edited.`);
      return;
    }

    // Ensure form is initialized
    if (!this.editEventForm) {
      this.initializeEditForm();
    }

    // Reset form first
    this.editEventForm.reset();

    // Populate form with current event data
    setTimeout(() => {
      const formValues = {
        eventTypeId: this.displayEvent?.event_type_id,
        name: this.displayEvent?.name,
        description: this.displayEvent?.description || '',
        startDate: this.displayEvent?.start_date ? this.formatDateForInput(this.displayEvent.start_date) : '',
        endDate: this.displayEvent?.end_date ? this.formatDateForInput(this.displayEvent.end_date) : '',
        location: this.displayEvent?.location || '',
        isPaid: this.displayEvent?.is_paid || false,
        fee: this.displayEvent?.fee || 0
      };

      this.editEventForm.patchValue(formValues);

      // Store original values for change detection
      this.originalFormValues = { ...formValues };
      this.formHasChanges = false;

      console.log('Edit form populated with:', this.editEventForm.value);
      console.log('Display event data:', this.displayEvent);
    }, 0);

    this.showEditModal = true;
  }

  // Close edit modal
  closeEditModal(): void {
    this.showEditModal = false;
    this.formHasChanges = false;
    this.originalFormValues = null;
    this.resetImageUpload();
    if (this.editEventForm) {
      this.editEventForm.reset();
    }
  }

  // Format date for HTML input
  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  }

  // Check if form has changes
  checkFormChanges(): void {
    if (!this.editEventForm || !this.originalFormValues) {
      this.formHasChanges = false;
      return;
    }

    const currentValues = this.editEventForm.value;
    const formChanged = JSON.stringify(currentValues) !== JSON.stringify(this.originalFormValues);
    const imageChanged = !!this.selectedFile; // True if a new image was selected

    this.formHasChanges = formChanged || imageChanged;
  }

  // Update event
  async updateEvent(): Promise<void> {
    if (!this.editEventForm || !this.editEventForm.valid || !this.displayEvent || !this.currentUserId) {
      this.toastr.error('Please fill in all required fields');
      console.log('Form validation failed:', {
        formExists: !!this.editEventForm,
        formValid: this.editEventForm?.valid,
        displayEvent: !!this.displayEvent,
        currentUserId: !!this.currentUserId,
        formErrors: this.editEventForm?.errors
      });
      return;
    }

    this.spinner.show();

    try {
      // Upload image if a new one was selected
      let imageUrl = this.displayEvent.image; // Keep existing image by default
      if (this.selectedFile) {
        const uploadedUrl = await this.uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const formValue = this.editEventForm.value;
      
      const payload: EditEventPayload = {
        adminId: this.currentUserId,
        eventId: this.displayEvent.id,
        eventTypeId: formValue.eventTypeId,
        name: formValue.name?.trim(),
        description: formValue.description?.trim(),
        startDate: formValue.startDate,
        endDate: formValue.endDate || null,
        location: formValue.location?.trim(),
        isPaid: formValue.isPaid,
        fee: formValue.isPaid ? formValue.fee : undefined,
        image: imageUrl
      };

      console.log('Updating event with payload:', payload);

      this.eventsService.editEvent(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.toastr.success(response.message || 'Event updated successfully');
            this.closeEditModal();
            
            // Reload event summary to get updated data
            if (this.displayEvent) {
              this.loadEventSummary(this.displayEvent.id);
            }
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Error updating event:', error);
            this.toastr.error(error.error?.message || 'Failed to update event. Please try again.');
            this.spinner.hide();
          }
        });
    } catch (error) {
      console.error('Error updating event:', error);
      this.toastr.error('Failed to update event. Please try again.');
      this.spinner.hide();
    }
  }

  // Helper method to check if description needs scrolling (rough estimate)
  needsScrolling(text: string): boolean {
    if (!text) return false;
    // Rough calculation: if text has more than 4-5 lines worth of content
    const estimatedLines = text.split('\n').length + Math.floor(text.length / 80);
    return estimatedLines > 5;
  }

  // Image upload methods for edit modal
  onImageSelected(event: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.checkFormChanges(); // Trigger change detection
      };
      reader.readAsDataURL(file);

      this.selectedFile = file;
    }
  }

  cancelImageUpload(): void {
    this.resetImageUpload();
    this.checkFormChanges(); // Trigger change detection
  }

  resetImageUpload(): void {
    this.previewImage = null;
    this.selectedFile = null;
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile || !this.currentUserId) return null;

    try {
      const response = await this.userService.uploadProfileImage(this.currentUserId, this.selectedFile).toPromise();
      if (response) {
        return response.imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Image upload failed:', error);
      this.toastr.error('Failed to upload image');
      return null;
    }
  }
}
