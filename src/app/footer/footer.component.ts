import { Component } from '@angular/core';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faStrava } from '@fortawesome/free-brands-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

interface FooterLink {
  name: string;
  href?: string;
  routerLink?: string;
}

interface FooterSection {
  title: string;
  items: FooterLink[];
}

interface FooterData {
  solutions: FooterSection;
  support: FooterSection;
  company: FooterSection;
  legal: FooterSection;
}

interface SocialLink {
  name: string;
  href: string;
  viewBox: string;
  path: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  // faCoffee = faCoffee;
  // faInstagram = faInstagram;
  // faFacebook = faFacebook;
  // faTwitter = faTwitter;
  // faStrava = faStrava

  currentYear: number = new Date().getFullYear();
  companyName: string = 'Your Company, Inc.';

  footerData: FooterData = {
    solutions: {
      title: 'Solutions',
      items: [
        { name: 'Marketing', routerLink: '/marketing' },
        { name: 'Analytics', routerLink: '/analytics' },
        { name: 'Automation', routerLink: '/automation' },
        { name: 'Commerce', routerLink: '/commerce' },
        { name: 'Insights', routerLink: '/insights' }
      ]
    },
    support: {
      title: 'Support',
      items: [
        { name: 'Submit ticket', href: '#' },
        { name: 'Documentation', routerLink: '/docs' },
        { name: 'Guides', routerLink: '/guides' }
      ]
    },
    company: {
      title: 'Company',
      items: [
        { name: 'About', routerLink: '/about' },
        { name: 'Blog', routerLink: '/blog' },
        { name: 'Jobs', routerLink: '/careers' },
        { name: 'Press', routerLink: '/press' }
      ]
    },
    legal: {
      title: 'Legal',
      items: [
        { name: 'Terms of service', routerLink: '/terms' },
        { name: 'Privacy policy', routerLink: '/privacy' },
        { name: 'License', routerLink: '/license' }
      ]
    }
  };

  socialLinks: SocialLink[] = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      viewBox: '0 0 24 24',
      path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/ariders001?igsh=MTRnbDV5MWtwNnN1cw==',
      viewBox: '0 0 24 24',
      path: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.654 13.718 3.654 12.39c0-1.297.49-2.448 1.297-3.323.863-.925 2.04-1.469 3.368-1.469 1.297 0 2.448.49 3.323 1.297.925.863 1.469 2.04 1.469 3.368 0 1.297-.49 2.448-1.297 3.323-.863.925-2.04 1.469-3.368 1.469z'
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com',
      viewBox: '0 0 24 24',
      path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'
    },
    {
      name: 'Strava',
      href: 'https://www.strava.com/clubs/A_Riders',
      viewBox: '0 0 24 24',
      path: 'M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169'
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      viewBox: '0 0 24 24',
      path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
    }
  ];

  constructor() { }

}
