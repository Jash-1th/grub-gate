// Dummy data for navigation and site structure
export const navigation = {
  main: [
    {
      name: 'home',
      href: '/',
      current: true
    },
   
    {
      name: 'about',
      href: '/about',
      current: false
    },
    {
      name: 'howItWorks',
      href: '/how-it-works',
      current: false
    },
    {
      name: 'contact',
      href: '/contact',
      current: false
    },
    {
      name: 'faq',
      href: '/faq',
      current: false
    },
    {
      name: 'yourOrders',
      href: '/your-orders',
      current: false
    }
  ],
  auth: [
    {
      name: 'login',
      href: '/login',
      type: 'button',
      variant: 'outline'
    },
    {
      name: 'signup',
      href: '/signup',
      type: 'button',
      variant: 'outline'
    }
  ],
  footer: {
    quickLinks: [
      { name: 'home', href: '/' },
      { name: 'howItWorks', href: '/how-it-works' },
      { name: 'about', href: '/about' },
      { name: 'faq', href: '/faq' },
      { name: 'contact', href: '/contact' }
    ],
    legal: [
      { name: 'termsAndConditions', href: '/terms' },
      { name: 'privacyPolicy', href: '/privacy' }
    ],
    social: [
      { name: 'Facebook', href: 'https://facebook.com/grubgate', icon: 'facebook' },
      { name: 'Instagram', href: 'https://instagram.com/grubgate', icon: 'instagram' },
      { name: 'Twitter', href: 'https://twitter.com/grubgate', icon: 'twitter' },
      { name: 'LinkedIn', href: 'https://linkedin.com/company/grubgate', icon: 'linkedin' }
    ]
  }
};

export const siteInfo = {
  name: 'Grub-Gate',
  tagline: 'Your Daily Bite, Delivered Right',
  description: 'Partnering with local restaurants to deliver fresh, chef-prepared meals — so you never have to cook.',
  // logo: '/logo.svg',
  logoText: 'Grub-Gate',
  address: '123 Food Street, Montreal, QC H1A 1A1',
  phone: '+1 (514) 555-0123',
  email: 'hello@grubgate.com',
  hours: {
    weekdays: '8:00 AM - 11:00 PM',
    weekends: '9:00 AM - 12:00 AM'
  }
};
