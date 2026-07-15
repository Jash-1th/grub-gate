export type NavigationItem = {
  name: 'home' | 'about' | 'howItWorks' | 'contact' | 'faq' | 'yourOrders';
  label: string;
  href: string;
  protected?: boolean;
};

export const navigation = {
  main: [
    {
      name: 'home',
      label: 'Home',
      href: '/',
    },
    {
      name: 'about',
      label: 'About',
      href: '/about',
    },
    {
      name: 'howItWorks',
      label: 'How It Works',
      href: '/how-it-works',
    },
    {
      name: 'contact',
      label: 'Contact',
      href: '/contact',
    },
    {
      name: 'faq',
      label: 'FAQ',
      href: '/faq',
    },
    {
      name: 'yourOrders',
      label: 'Orders',
      href: '/your-orders',
      protected: true,
    },
  ] satisfies NavigationItem[],
};

export const siteInfo = {
  logoText: 'Grub-Gate',
};
