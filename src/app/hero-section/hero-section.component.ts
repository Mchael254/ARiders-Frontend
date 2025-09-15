import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface GalleryImage {
  previewImageSrc: string;
  thumbnailImageSrc?: string;
  alt?: string;
  title?: string;
}

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent {

  images: GalleryImage[] = [];
  responsiveOptions: any[] = [
    {
      breakpoint: '991px',
      numVisible: 4
    },
    {
      breakpoint: '767px',
      numVisible: 3
    },
    {
      breakpoint: '575px',
      numVisible: 1
    }
  ];

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
  }
  currentSlide = 0;
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.images.length) % this.images.length;
  }

  constructor(private router: Router) {
    this.images = [
      {
        previewImageSrc: 'assets/mtb.JPG',
        thumbnailImageSrc: 'assets/Jonas.png',
        alt: 'Mtb',
        title: 'Mountain Bike Gang'
      },
      {
        previewImageSrc: 'assets/ariders.jpg',
        thumbnailImageSrc: 'assets/ariders.jpg',
        alt: 'Adventure Awaits',
        title: 'A Riders'
      },
      {
        previewImageSrc: 'assets/raceStart.JPG',
        thumbnailImageSrc: 'assets/batProfile.jpg',
        alt: 'A Riders 4th Edition',
        title: 'A Riders 4th Edition'
      },
      {
        previewImageSrc: 'assets/groupRides.jpg',
        thumbnailImageSrc: 'assets/groupRides.jpg',
        alt: 'Kaloleni',
        title: 'Kaloleni'
      },
      {
        previewImageSrc: 'assets/itt.jpg',
        thumbnailImageSrc: 'assets/itt.jpg',
        alt: 'Itt',
        title: 'Individual Time Trials'
      }
    ]
  }


  handleImageError(event: Event, item: any) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/Jonas.png';
    imgElement.alt = 'Image failed to load';
    item.previewImageSrc = 'assets/Jonas.png';
    item.thumbnailImageSrc = 'assets/Jonas.png';
  }


  preloadImages() {
    this.images.forEach(image => {
      const img = new Image();
      img.src = image.previewImageSrc;
    });
  }

  ngOnInit(): void {
    this.preloadImages();
    setInterval(() => {
      this.nextSlide();
    }, 10000);
  }



}
