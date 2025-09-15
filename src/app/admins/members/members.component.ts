import { Component, ViewChild } from '@angular/core';
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
  profile$: Observable<AuthState>;
  private destroy$ = new Subject<void>();
  authorizer_id: string | null = null;

  visible: boolean = false;

  members: Member[] = [];
  loading: boolean = false;
  member: any
  selectedMembers: Member[] = [];
  totalCount = 0;
  selectedRoleMemberId: string | null = null;
  pdfTitle: string = '';
  displayedMembers: Member[] = [];
  noData: boolean = false;
  roles: Role[] = [];

  currentUser: any;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

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
        this.members = res.data.filter(member => member.role !== 'developer')
        this.totalCount = res.count;
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

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.members.length / this.pageSize) || 1;
    this.updateDisplayedMembers();
  }

  updateDisplayedMembers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedMembers = this.members.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedMembers();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedMembers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedMembers();
    }
  }

  getShowingFrom(): number { return (this.currentPage - 1) * this.pageSize + 1; }
  getShowingTo(): number { return Math.min(this.currentPage * this.pageSize, this.members.length); }



  filterGlobal(event: any): void {
    const value = event.target.value;
    this.memberService.getAllMembers(undefined, undefined, undefined, value).subscribe({
      next: (res) => {
        this.members = res.data;
        this.totalCount = res.count;
        this.currentPage = 1;
        this.calculatePagination();
      },
      error: (err) => {
        this.toastr.error('search failed', err)
        console.error('Search failed', err);
      },
    });
  }


  //select members
  isMemberSelected(member: any): boolean {
    return this.selectedMembers?.some((m: any) => m.id === member.id);
  }

  //get roles
  loadRoles() {
    this.memberService.getRoles().subscribe({
      next: (res) => {
        this.roles = res.filter(role => role.label !== 'user')
      },
      error: (err) => {
        console.log(err);
        this.toastr.error("unable to load roles")

      }
    });
  }

  //update role
  updateRole(member: Member) {
    if (!member.role) return;
    console.log(member.role);

    const updateRolePayload = {
      role_id: member.role,
      member_authorized_id: member.id,
      authorizer_id: this.authorizer_id
    }

    // console.log(updateRolePayload);
    this.spinner.show();

    this.memberService.updateMemberRole(updateRolePayload).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.selectedRoleMemberId = null;
        member.role_label = res.data?.new_role || member.role_label;
        this.toastr.success("role updated successfully")
      },
      error: (err) => {
        console.error('Failed to update role', err);
        this.spinner.hide();
        this.toastr.error("failed to update role");
      }
    });
  }


  //deactivate member memeber
  deactivateDialogVisible = false;
  selectedMember: Member | null = null;
  deactivationReason: string = '';
  warningMessage:  boolean = false;
  paymentStatus: boolean = false

  openDeactivateDialog(member: Member) {
    this.selectedMember = member;
    this.deactivationReason = '';
    this.deactivateDialogVisible = true;
  }

  async confirmDeactivate() {
    if (!this.selectedMember) return;

    if (!this.deactivationReason.trim()) {
      this.warningMessage = true
      setTimeout(() => this.warningMessage = false,5000)
      return;
    }

    try {
      const currentUserId = this.authorizer_id ?? '';
      const reason = this.deactivationReason.trim();

      await this.memberService.deactivateMember(
        this.selectedMember.id,
        currentUserId,
        reason,
        false
      );

      this.selectedMember.membership_status = 'inactive';
      this.toastr.success('Member deactivated');
      this.deactivateDialogVisible = false;
      this.warningMessage = false;

    } catch (err) {
      this.toastr.error('Failed to deactivate member');
      console.error('Deactivation error:', err);
    }
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









}




