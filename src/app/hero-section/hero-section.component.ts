import { Component } from '@angular/core';

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


  constructor() {
    this.images = [
      // {
      //   previewImageSrc: 'assets/Jonas.png',
      //   thumbnailImageSrc: 'assets/Jonas.png',
      //   alt: 'Image 1',
      //   title: 'Image 1'
      // },
      // {
      //   previewImageSrc: 'assets/ariders.jpg',
      //   thumbnailImageSrc: 'assets/ariders.jpg',
      //   alt: 'Image 2',
      //   title: 'Image 2'
      // },
      // {
      //   previewImageSrc: 'assets/batProfile.jpg',
      //   thumbnailImageSrc: 'assets/batProfile.jpg',
      //   alt: 'Image 3',
      //   title: 'Image 3'
      // },
      // {
      //   previewImageSrc: 'assets/groupRides.jpg',
      //   thumbnailImageSrc: 'assets/groupRides.jpg',
      //   alt: 'Image 4',
      //   title: 'Image 4'
      // },
      // {
      //   previewImageSrc: 'assets/itt.jpg',
      //   thumbnailImageSrc: 'assets/itt.jpg',
      //   alt: 'Image 5',
      //   title: 'Image 5'
      // }
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
  }



}
