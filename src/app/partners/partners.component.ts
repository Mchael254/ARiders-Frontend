import { Component } from '@angular/core';

interface Partner {
  id: number;
  name: string;
  category: string;
  logo: string;
}

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css']
})
export class PartnersComponent {

  animationDuration = '100s'; // Adjust speed here (higher = slower)
  
  partners: Partner[] = [
    {
      id: 1,
      name: 'Gear+',
      category: 'Equipment',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 2,
      name: 'Velocity',
      category: 'Wheels',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 3,
      name: 'PeakFuel',
      category: 'Nutrition',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 4,
      name: 'AeroTech',
      category: 'Aerodynamics',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 5,
      name: 'TrailBlaze',
      category: 'Apparel',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 6,
      name: 'HydraFlow',
      category: 'Hydration',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 7,
      name: 'CarbonPro',
      category: 'Frames',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 8,
      name: 'SwiftRide',
      category: 'Components',
      logo: 'assets/ariders.jpg'
    }
  ];

 
}
