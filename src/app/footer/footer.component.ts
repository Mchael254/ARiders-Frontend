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
      href: 'https://instagram.com',
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
      name: 'GitHub',
      href: 'https://github.com',
      viewBox: '0 0 24 24',
      path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'
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
