import { Component } from '@angular/core';

interface ClubActivity {
  title: string;
  image: string;
  description: string;
}
@Component({
  selector: 'app-whatwedo',
  templateUrl: './whatwedo.component.html',
  styleUrls: ['./whatwedo.component.css']
})
export class WhatwedoComponent {

  defaultActivities:ClubActivity[] = [
   
    {
      title: "Competitions",
      image: 'assets/batProfile.jpg',
      description: "Participate in local and regional races"
    },
    {
      title: "Community Events",
      image: 'assets/groupRides.jpg',
      description: "Charity rides and social gatherings"
    },
    {
      title: "Skill Workshops",
      image: 'assets/itt.jpg',
      description: "Learn maintenance and advanced techniques"
    }
  ];

  activities: ClubActivity[] = [
     {
      title: "Group Rides",
      image: 'assets/Jonas.png',
      description: "Join our weekly group rides through scenic routes"
    },
    {
      title: "Training Programs",
      image: 'assets/ariders.jpg',
      description: "Structured training for all skill levels"
    },
  ];
  duplicatedActivities: ClubActivity[] = [];

 

  constructor() { }

  ngOnInit(): void {
    this.activities = this.defaultActivities;
    this.duplicatedActivities = [...this.activities, ...this.activities];
  }




}
