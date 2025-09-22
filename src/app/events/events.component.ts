import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { EventsService } from '../services/events/events.service';
import { Event, EventsResponse } from '../services/types/event.model';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Expose Math for template use
  Math = Math;

  // Component state
  events: Event[] = [];
  loadingEvents = false;
  eventsError: string | null = null;

  // Filter and search state
  searchTerm = '';
  selectedStatus = '';
  showPaidOnly = false;
  showFreeOnly = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;

  // Modal state
  registrationModalVisible = false;
  selectedEventForRegistration: Event | null = null;

  constructor(
    private eventsService: EventsService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    this.loadingEvents = true;
    this.eventsError = null;

    this.eventsService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: EventsResponse) => {
          this.events = response.events || [];
          this.loadingEvents = false;
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.eventsError = error?.error?.message || 'Failed to load events';
          this.loadingEvents = false;
          this.toastr.error('Failed to load events');
        }
      });
  }



  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEventStatus(event: Event): { status: string; class: string } {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;

    if (now < startDate) {
      return { status: 'Upcoming', class: 'bg-blue-100 text-blue-800' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'Ongoing', class: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Completed', class: 'bg-gray-100 text-gray-800' };
    }
  }

  getDaysUntilEvent(event: Event): string {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} to go`;
    } else if (diffDays === 0) {
      return 'Today!';
    } else {
      return 'Event passed';
    }
  }

  getEventInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  // Filter and search methods
  get filteredEvents(): Event[] {
    let filtered = this.events;

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(event => {
        const status = this.getEventStatus(event).status.toLowerCase();
        return status === this.selectedStatus.toLowerCase();
      });
    }

    // Payment filter
    if (this.showPaidOnly) {
      filtered = filtered.filter(event => event.is_paid);
    }
    if (this.showFreeOnly) {
      filtered = filtered.filter(event => !event.is_paid);
    }

    return filtered;
  }

  get paginatedEvents(): Event[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredEvents.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages = [];
    const totalPages = this.totalPages;
    const current = this.currentPage;

    // Show up to 5 page numbers
    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, start + 4);

    // Adjust start if we're near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
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

  // Filter methods
  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1; // Reset to first page
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.target.value;
    this.currentPage = 1; // Reset to first page
  }

  togglePaidFilter(): void {
    this.showPaidOnly = !this.showPaidOnly;
    if (this.showPaidOnly) {
      this.showFreeOnly = false;
    }
    this.currentPage = 1;
  }

  toggleFreeFilter(): void {
    this.showFreeOnly = !this.showFreeOnly;
    if (this.showFreeOnly) {
      this.showPaidOnly = false;
    }
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.showPaidOnly = false;
    this.showFreeOnly = false;
    this.currentPage = 1;
  }

  // Registration modal methods
  openRegistrationModal(event: Event): void {
    this.selectedEventForRegistration = event;
    this.registrationModalVisible = true;
  }

  closeRegistrationModal(): void {
    this.registrationModalVisible = false;
    this.selectedEventForRegistration = null;
  }

  continueAsGuest(): void {
    this.closeRegistrationModal();
    this.router.navigate(['/guest-signin']);
  }

  continueAsMember(): void {
    this.closeRegistrationModal();
    this.router.navigate(['/signin']);
  }

  // Statistics
  get upcomingEventsCount(): number {
    return this.events.filter(event => {
      const status = this.getEventStatus(event).status;
      return status === 'Upcoming';
    }).length;
  }

  get ongoingEventsCount(): number {
    return this.events.filter(event => {
      const status = this.getEventStatus(event).status;
      return status === 'Ongoing';
    }).length;
  }

  get paidEventsCount(): number {
    return this.events.filter(event => event.is_paid).length;
  }

  get freeEventsCount(): number {
    return this.events.filter(event => !event.is_paid).length;
  }

  // TrackBy function for better performance
  trackByEventId(index: number, event: Event): string {
    return event.id;
  }
}
