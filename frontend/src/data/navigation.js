// Dummy data for navigation and site structure
export const navigation = {
  main: [
    {
      name: 'Home',
      href: '/',
      current: true
    },
   
    {
      name: 'About Us',
      href: '/about',
      current: false
    },
    {
      name: 'How It Works',
      href: '/how-it-works',
      current: false
    },
    {
      name: 'Contact Us',
      href: '/contact',
      current: false
    },
    {
      name: 'FAQs',
      href: '/faq',
      current: false
    }
  ],
  auth: [
    {
      name: 'Login',
      href: '/login',
      type: 'button',
      variant: 'outline'
    },
    {
      name: 'Sign Up',
      href: '/signup',
      type: 'button',
      variant: 'primary'
    }
  ],
  footer: {
    quickLinks: [
      { name: 'Home', href: '/' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'About Us', href: '/about' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact Us', href: '/contact' }
    ],
    legal: [
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' }
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
