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
      name: 'Ariders',
      category: 'Equipment',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 2,
      name: 'Ariders',
      category: 'Wheels',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 3,
      name: 'Ariders',
      category: 'Nutrition',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 5,
      name: 'Ariders',
      category: 'Apparel',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 6,
      name: 'Ariders',
      category: 'Hydration',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 7,
      name: 'Ariders',
      category: 'Frames',
      logo: 'assets/ariders.jpg'
    },
    {
      id: 8,
      name: 'Ariders',
      category: 'Components',
      logo: 'assets/ariders.jpg'
    }
  ];

 
}
