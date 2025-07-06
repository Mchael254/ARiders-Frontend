import { Component } from '@angular/core';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  category: string;
  image: string;
  teamId: number;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent {
  selectedTeam: number = 1;
  showTeamDropdown: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 4; // 4 items per page (one row)
  mobileCurrentIndex: number = 0; // Track current mobile member index
  
  teams = [
    { id: 1, name: 'Development Team', count: 12 },
    { id: 2, name: 'Women\'s Team', count: 8 },
    { id: 3, name: 'Men\'s Team', count: 15 }
  ];

  teamMembers: TeamMember[] = [
     {
      id: 1,
      name: 'Pinto Niquez',
      role: 'Cyclist',
      category: 'CYCLING',
      image: 'assets/mtb.JPG',
      teamId: 1
    },
    {
      id: 2,
      name: 'Arap Lagat',
      role: 'Cyclist',
      category: 'CYCLING',
      image: 'assets/champion.JPG',
      teamId: 1
    },
    {
      id: 3,
      name: 'Antony Nazareth',
      role: 'Cyclist',
      category: 'CYCLING',
      image: 'assets/all.JPG',
      teamId: 1
    },
    {
      id: 4,
      name: 'Fexxie',
      role: 'Photographer',
      category: 'STAFF',
      image: 'assets/photographer.JPG',
      teamId: 1
    },
       {
      id: 4,
      name: 'Paulo',
      role: 'Team Manager',
      category: 'STAFF',
      image: 'assets/manager.JPG',
      teamId: 1
    },
    {
      id: 5,
      name: 'Patrick Stride',
      role: 'Cyclist',
      category: 'CYCLING',
      image: 'assets/Jonas.png',
      teamId: 2
    },
    {
      id: 6,
      name: 'Sarah Johnson',
      role: 'Cyclist',
      category: 'CYCLING',
      image: 'assets/Jonas.png',
      teamId: 2
    },
    {
      id: 7,
      name: 'Michael Brown',
      role: 'Mechanic',
      category: 'STAFF',
      image: 'assets/Jonas.png',
      teamId: 3
    },
    {
      id: 8,
      name: 'Emma Wilson',
      role: 'Cyclist',
      category: 'CYCLING',
      image: 'assets/Jonas.png',
      teamId: 2
    },
  ];

  get filteredMembers(): TeamMember[] {
    return this.teamMembers.filter(member => member.teamId === this.selectedTeam);
  }

  getPaginatedMembers(): TeamMember[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMembers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getMobileMembers(): TeamMember[] {
    // Return array with only the current mobile member
    return this.filteredMembers.length > 0 
      ? [this.filteredMembers[this.mobileCurrentIndex]] 
      : [];
  }

  getSelectedTeamName(): string {
    const team = this.teams.find(t => t.id === this.selectedTeam);
    return team ? team.name : 'Select Team';
  }

  selectTeam(teamId: number): void {
    this.selectedTeam = teamId;
    this.showTeamDropdown = false;
    this.currentPage = 1;
    this.mobileCurrentIndex = 0; // Reset mobile index when changing teams
  }

  // Desktop pagination
  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.filteredMembers.length) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Mobile navigation
  nextMobileMember(): void {
    if (this.mobileCurrentIndex < this.filteredMembers.length - 1) {
      this.mobileCurrentIndex++;
    }
  }

  prevMobileMember(): void {
    if (this.mobileCurrentIndex > 0) {
      this.mobileCurrentIndex--;
    }
  }
}