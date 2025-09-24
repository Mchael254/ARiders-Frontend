import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { select, Store } from '@ngrx/store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Member } from 'src/app/interfaces/members';
import { MembersService } from 'src/app/services/members/members.service';
import { ChangeMemberRoleRequest, Role } from 'src/app/services/types/memberService';
import { AuthState } from 'src/app/store/auth/auth.reducer';


@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css'],
})
export class MembersComponent {
  @Output() viewMemberDetails = new EventEmitter<{ memberId: string; member: Member }>();
  
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();
  authorizer_id: string | null = null;

  visible: boolean = false;

  members: Member[] = [];
  loading: boolean = false;
  selectedMembers: Member[] = [];
  totalCount = 0;
  pdfTitle: string = '';
  noData: boolean = false;
  roles: Role[] = [];

  // Filter and search properties
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedRole: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  currentUser: any;

  getRowClass(member: Member): string {
    return member.membership_status === 'inactive' ? 'inactive-row' : '';
  }


  constructor(private memberService: MembersService,
    private toastr: ToastrService,
    private store: Store<{ auth: AuthState }>,
    private spinner: NgxSpinnerService) {
    this.profile$ = this.store.pipe(select('auth'));
  }

  ngOnInit(): void {
    this.profile$.pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        if (profile) {
          this.authorizer_id = profile.user?.id || null;
        }
      })
    this.fetchMembers();
    this.loadRoles();
  }

  fetchMembers(): void {
    this.loading = true;
    this.noData = false;
    this.memberService.getAllMembers().subscribe({
      next: (res) => {
        this.loading = false;
        this.members = res.data.filter(member => member.role !== 'developer' && member.role !== 'guest')
        this.totalCount = this.members.length;
        this.calculatePagination();

        this.noData = this.members.length === 0;
      },
      error: (err) => {
        console.error('Error loading members', err);
        this.loading = false;
        this.noData = true;
        this.members = [];
      },
    });
  }

  // All filtered members (without pagination)
  get allFilteredMembers(): Member[] {
    let filtered = [...this.members];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(member =>
        member.first_name.toLowerCase().includes(search) ||
        member.last_name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search) ||
        member.phone_number.includes(search) ||
        (member.city && member.city.toLowerCase().includes(search)) ||
        (member.county && member.county.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(member => member.membership_status === this.selectedStatus);
    }

    // Apply role filter
    if (this.selectedRole) {
      filtered = filtered.filter(member => member.role === this.selectedRole);
    }

    // Update total pages
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage) || 1;

    // Reset to first page if current page is beyond total pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    return filtered;
  }

  // Paginated filtered members for display
  get filteredMembers(): Member[] {
    const allFiltered = this.allFilteredMembers;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return allFiltered.slice(startIndex, endIndex);
  }

  // Total filtered members count
  get totalFilteredMembers(): number {
    return this.allFilteredMembers.length;
  }

  calculatePagination(): void {
    // This method is now handled by the getters
    // Keep for backward compatibility
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

  // Pagination helper properties
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

  getShowingFrom(): number { 
    return this.totalFilteredMembers === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1; 
  }
  
  getShowingTo(): number { 
    return Math.min(this.currentPage * this.itemsPerPage, this.totalFilteredMembers); 
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

  onRoleFilterChange(role: string): void {
    this.selectedRole = role;
    this.currentPage = 1; // Reset to first page when filtering
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedRole = '';
    this.currentPage = 1; // Reset to first page when clearing filters
  }

  filterGlobal(event: any): void {
    this.onSearchChange(event.target.value);
  }


  //select members
  isMemberSelected(member: any): boolean {
    return this.selectedMembers?.some((m: any) => m.id === member.id);
  }

  //get roles
  loadRoles() {
    this.memberService.getRoles().subscribe({
      next: (res) => {
        this.roles = res.filter(role => role.label !== 'user' && role.label !== 'guest')
      },
      error: (err) => {
        console.log(err);
        this.toastr.error("unable to load roles")

      }
    });
  }

  //clear select
  clearSelection(): void {
    this.selectedMembers = [];
  }


  //export to pdf
  exportSelectedMembersToPDF() {
    if (!this.selectedMembers || !this.selectedMembers.length) {
      this.toastr.error('No members selected for export');
      return;
    }

    const doc = new jsPDF();
    const img = new Image();
    img.src = '../../../assets/ariders.jpg';

    //add club logo
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      doc.addImage(img, 'PNG', centerX - 10, 10, 20, 20);
      doc.setFontSize(16);
      doc.text('A Riders Club', centerX, 35, { align: 'center' });

      //document title
      doc.setFontSize(12);
      doc.text(this.pdfTitle || 'Selected Members List', 14, 45);

      // Table of members
      const exportData = this.selectedMembers.map((member, index) => [
        index + 1,
        `${member.first_name} ${member.last_name}`,
        member.email,
        member.role,
        member.membership_status
      ]);

      //table
      autoTable(doc, {
        startY: 50,
        head: [['#', 'Name', 'Email', 'Role', 'Status']],
        body: exportData,
        theme: 'grid',
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.getHeight();
          const footerY = pageHeight - 15;
          const dateTime = new Date().toLocaleString();

          doc.setDrawColor(180);
          doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
          doc.setFontSize(9);
          doc.text('© A Riders Club — All rights reserved', 14, footerY);
          doc.text(dateTime, pageWidth - 14, footerY, { align: 'right' });
        },
      });

      const filename = (this.pdfTitle?.trim() || 'ariders')
        .replace(/[\\/:*?"<>|]/g, '') // remove invalid filename characters
        .replace(/\s+/g, '_')         // optional: replace spaces with underscores
        + '.pdf';

      doc.save(filename);

      this.pdfTitle = '';
      this.clearSelection()
    };

    img.onerror = () => {
      this.toastr.error('Could not load logo image');
    };
  }

  // helpers for template binding
  isSelected(member: Member): boolean {
    return this.selectedMembers.some(m => m.id === member.id);
  }

  toggleSelection(member: Member): void {
    if (this.isSelected(member)) {
      this.selectedMembers = this.selectedMembers.filter(m => m.id !== member.id);
    } else {
      this.selectedMembers.push(member);
    }
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600 font-semibold';
      case 'inactive':
        return 'text-gray-400 italic';
      case 'suspended':
        return 'text-red-500 font-semibold';
      default:
        return '';
    }
  }

  isAllSelected(): boolean {
    return this.members.length > 0 && this.selectedMembers.length === this.members.length;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedMembers = [];
    } else {
      this.selectedMembers = [...this.members];
    }
  }

  // Helper methods for template
  trackByMemberId(index: number, member: Member): string {
    return member.id;
  }

  getActiveMembers(): number {
    return this.members.filter(m => m.membership_status === 'active').length;
  }

  getInactiveMembers(): number {
    return this.members.filter(m => m.membership_status === 'inactive').length;
  }

  getNewMembersThisMonth(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return this.members.filter(m => {
      const joinedDate = new Date(m.joined);
      return joinedDate.getMonth() === currentMonth && joinedDate.getFullYear() === currentYear;
    }).length;
  }

  // Navigate to member details page
  navigateToMemberDetails(member: Member): void {
    this.viewMemberDetails.emit({ memberId: member.id, member: member });
  }









}




