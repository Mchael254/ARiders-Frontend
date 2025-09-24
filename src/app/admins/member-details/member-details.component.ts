import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Member } from 'src/app/interfaces/members';

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit {
  @Input() memberId: string | null = null;
  @Input() member: Member | null = null;
  @Input() viewData: any = null;
  @Output() backToMembers = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    // Component initialized - member data should be available via inputs
  }

  onBackToMembers(): void {
    this.backToMembers.emit();
  }
}
