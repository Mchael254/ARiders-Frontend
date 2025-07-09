import { Component, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Member } from 'src/app/interfaces/members';
import { MembersService } from 'src/app/services/members/members.service';
import { ResponsesService } from 'src/app/services/utilities/responses.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent {
  members: Member[] = [];
  loading: boolean = false;
  member: any
  selectedMembers: Member[] = [];
  totalCount = 0;
  selectedRoleMemberId: string | null = null;
  pdfTitle: string = '';
  displayedMembers: Member[] = [];
  noData: boolean = false

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  getRowClass(member: Member): string {
    return member.membership_status === 'inactive' ? 'inactive-row' : '';
  }


  roles = [
    { label: 'Member', value: 'member' },
    { label: 'Admin', value: 'admin' },
    { label: 'Secretary', value: 'secretary' },
    { label: 'Treasurer', value: 'treasurer' }
  ];


  constructor(private memberService: MembersService, private response: ResponsesService) { }

  ngOnInit(): void {
    this.fetchMembers();
  }

  fetchMembers(): void {
    this.loading = true;
    this.noData = false;
    this.memberService.getAllMembers().subscribe({
      next: (res) => {
        this.loading = false;
        this.members = res.data;
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
        this.response.showError('search failed', err);
        console.error('Search failed', err);
      },
    });
  }


  //select members
  isMemberSelected(member: any): boolean {
    return this.selectedMembers?.some((m: any) => m.id === member.id);
  }

  //change role
  async onRoleChange(member: any) {
    try {
      const response = await this.memberService.updateMemberRoleStatus(member.id, { role: member.tempRole });
      this.response.showSuccess('Role updated successfully');

      // Optional: update local role after success
      member.role = member.tempRole;
      delete member.tempRole;
    } catch (error) {
      this.response.showError('Failed to update role');
      console.log(error);

    }
  }

  //update role
  updateRole(member: Member) {
    this.memberService.updateMemberRoleStatus(member.id, { role: member.role })
      .then(() => {
        this.selectedRoleMemberId = null; // Hide dropdown
        this.response.showSuccess('Role updated successfully');
      })
      .catch(() => {
        this.response.showError('Failed to update role');
      });
  }


  //delete memeber
  async deleteSelectedMembers() {
    if (!this.selectedMembers?.length) return;

    const confirmDelete = confirm('Mark selected members as inactive?');
    if (!confirmDelete) return;

    for (const member of this.selectedMembers) {
      try {
        await this.memberService.deactivateMember(member.id);
        member.membership_status = 'inactive'; // Update the local state
      } catch (error) {
        this.response.showError('failed to deactivate')
        console.error('Failed to deactivate:', member.email, error);
      }
    }

    this.response.showSuccess('Members marked inactive');
    this.selectedMembers = [];
  }

  //activate member
  async activateMember(member: Member) {
    try {
      await this.memberService.markMemberAsActive(member.id);
      member.membership_status = 'active';
      this.response.showSuccess('member activated');
    } catch (err) {
      this.response.showError('Could not reactivate member');
    }
  }

  //clear select
  clearSelection(): void {
    this.selectedMembers = [];
  }


  //export to pdf
  exportSelectedMembersToPDF() {
    if (!this.selectedMembers || !this.selectedMembers.length) {
      this.response.showError('No members selected for export');
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
      this.response.showError('Could not load logo image');
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




