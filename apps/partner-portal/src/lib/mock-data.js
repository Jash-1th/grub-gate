// Mock data for the partner portal application

export const mockRestaurant = {
  id: 'rest_001',
  name: 'Bistro Montreal',
  description: 'Authentic French cuisine in the heart of Montreal',
  cuisine: 'French',
  address: '123 Rue Saint-Catherine, Montreal, QC H2X 1Y4',
  phone: '+1 (514) 555-0123',
  email: 'info@bistromontreal.com',
  website: 'https://bistromontreal.com',
  logo: '/images/restaurant-logo.jpg',
  hours: {
    monday: '11:00 AM - 10:00 PM',
    tuesday: '11:00 AM - 10:00 PM',
    wednesday: '11:00 AM - 10:00 PM',
    thursday: '11:00 AM - 10:00 PM',
    friday: '11:00 AM - 11:00 PM',
    saturday: '10:00 AM - 11:00 PM',
    sunday: '10:00 AM - 9:00 PM'
  },
  deliveryRadius: 5,
  deliveryFee: 3.99,
  minOrderAmount: 25.00,
  avgDeliveryTime: 35,
  commissionRate: 15
};

export const mockMenuItems = [
  {
    id: 'item_001',
    name: 'Coq au Vin',
    description: 'Traditional French chicken braised in red wine with mushrooms and pearl onions',
    category: 'main',
    price: 28.99,
    prepTime: 45,
    servings: 1,
    dietary: ['gluten-free'],
    dietaryPreferences: ['gluten-free'],
    availability: {
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: true, dinner: true }
    },
    ingredients: ['chicken', 'red wine', 'mushrooms', 'pearl onions', 'bacon', 'herbs'],
    allergens: ['alcohol'],
    image: '/images/coq-au-vin.jpg',
    status: 'available',
    totalOrders: 156,
    rating: 4.8
  },
  {
    id: 'item_002',
    name: 'Bouillabaisse',
    description: 'Provençal fish stew with saffron, fennel, and crusty bread',
    category: 'main',
    price: 32.99,
    prepTime: 60,
    servings: 1,
    dietary: ['gluten-free', 'dairy-free'],
    dietaryPreferences: ['gluten-free', 'dairy-free'],
    availability: {
      monday: { lunch: false, dinner: true },
      tuesday: { lunch: false, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: false, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: false, dinner: true }
    },
    ingredients: ['mixed fish', 'saffron', 'fennel', 'tomatoes', 'white wine', 'herbs'],
    allergens: ['fish', 'shellfish'],
    image: '/images/bouillabaisse.jpg',
    status: 'available',
    totalOrders: 89,
    rating: 4.6
  },
  {
    id: 'item_003',
    name: 'Ratatouille',
    description: 'Classic Provençal vegetable stew with eggplant, zucchini, and tomatoes',
    category: 'main',
    price: 22.99,
    prepTime: 30,
    servings: 1,
    dietary: ['vegetarian', 'vegan', 'gluten-free'],
    dietaryPreferences: ['vegetarian', 'vegan', 'gluten-free'],
    availability: {
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: true, dinner: true }
    },
    ingredients: ['eggplant', 'zucchini', 'tomatoes', 'bell peppers', 'onions', 'herbs'],
    allergens: [],
    image: '/images/ratatouille.jpg',
    status: 'available',
    totalOrders: 203,
    rating: 4.7
  },
  {
    id: 'item_004',
    name: 'Crème Brûlée',
    description: 'Classic French custard dessert with caramelized sugar topping',
    category: 'dessert',
    price: 8.99,
    prepTime: 20,
    servings: 1,
    dietary: ['vegetarian'],
    dietaryPreferences: ['vegetarian'],
    availability: {
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: true, dinner: true }
    },
    ingredients: ['eggs', 'cream', 'sugar', 'vanilla'],
    allergens: ['eggs', 'dairy'],
    image: '/images/creme-brulee.jpg',
    status: 'available',
    totalOrders: 312,
    rating: 4.9
  },
  {
    id: 'item_005',
    name: 'French Onion Soup',
    description: 'Rich beef broth with caramelized onions and melted Gruyère cheese',
    category: 'soup',
    price: 12.99,
    prepTime: 25,
    servings: 1,
    dietary: ['vegetarian'],
    dietaryPreferences: ['vegetarian'],
    availability: {
      monday: { lunch: true, dinner: true },
      tuesday: { lunch: true, dinner: true },
      wednesday: { lunch: true, dinner: true },
      thursday: { lunch: true, dinner: true },
      friday: { lunch: true, dinner: true },
      saturday: { lunch: true, dinner: true },
      sunday: { lunch: true, dinner: true }
    },
    ingredients: ['onions', 'beef broth', 'Gruyère cheese', 'bread', 'herbs'],
    allergens: ['gluten', 'dairy'],
    image: '/images/french-onion-soup.jpg',
    status: 'unavailable',
    totalOrders: 178,
    rating: 4.5
  }
];

export const mockOrders = [
  {
    id: 'order_001',
    customer: {
      id: 'cust_001',
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      phone: '+1 (514) 555-0101'
    },
    items: [
      { id: 'item_001', name: 'Coq au Vin', quantity: 1, price: 28.99 },
      { id: 'item_004', name: 'Crème Brûlée', quantity: 1, price: 8.99 }
    ],
    total: 37.98,
    status: 'preparing',
    orderDate: '2024-01-15T18:30:00Z',
    deliveryDate: '2024-01-15T19:30:00Z',
    notes: 'Please ring doorbell twice',
    deliveryAddress: '456 Rue Sherbrooke, Montreal, QC H3A 1A1'
  },
  {
    id: 'order_002',
    customer: {
      id: 'cust_002',
      name: 'Jean-Pierre Martin',
      email: 'jp.martin@email.com',
      phone: '+1 (514) 555-0102'
    },
    items: [
      { id: 'item_002', name: 'Bouillabaisse', quantity: 1, price: 32.99 }
    ],
    total: 32.99,
    status: 'confirmed',
    orderDate: '2024-01-15T17:45:00Z',
    deliveryDate: '2024-01-15T18:45:00Z',
    notes: '',
    deliveryAddress: '789 Avenue du Parc, Montreal, QC H2V 4G1'
  },
  {
    id: 'order_003',
    customer: {
      id: 'cust_003',
      name: 'Sophie Tremblay',
      email: 'sophie.tremblay@email.com',
      phone: '+1 (514) 555-0103'
    },
    items: [
      { id: 'item_003', name: 'Ratatouille', quantity: 2, price: 22.99 },
      { id: 'item_004', name: 'Crème Brûlée', quantity: 2, price: 8.99 }
    ],
    total: 63.96,
    status: 'delivered',
    orderDate: '2024-01-15T16:20:00Z',
    deliveryDate: '2024-01-15T17:20:00Z',
    notes: 'Leave at front door if no answer',
    deliveryAddress: '321 Rue Saint-Denis, Montreal, QC H2X 3K8'
  }
];

export const mockCustomers = [
  {
    id: 'cust_001',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '+1 (514) 555-0101',
    totalOrders: 12,
    totalSpent: 456.78,
    lastOrder: '2024-01-15T18:30:00Z',
    status: 'active',
    joinDate: '2023-08-15T10:00:00Z'
  },
  {
    id: 'cust_002',
    name: 'Jean-Pierre Martin',
    email: 'jp.martin@email.com',
    phone: '+1 (514) 555-0102',
    totalOrders: 8,
    totalSpent: 298.45,
    lastOrder: '2024-01-15T17:45:00Z',
    status: 'active',
    joinDate: '2023-09-22T14:30:00Z'
  },
  {
    id: 'cust_003',
    name: 'Sophie Tremblay',
    email: 'sophie.tremblay@email.com',
    phone: '+1 (514) 555-0103',
    totalOrders: 25,
    totalSpent: 892.34,
    lastOrder: '2024-01-15T16:20:00Z',
    status: 'active',
    joinDate: '2023-06-10T09:15:00Z'
  },
  {
    id: 'cust_004',
    name: 'Antoine Leblanc',
    email: 'antoine.leblanc@email.com',
    phone: '+1 (514) 555-0104',
    totalOrders: 3,
    totalSpent: 89.67,
    lastOrder: '2023-12-20T19:00:00Z',
    status: 'inactive',
    joinDate: '2023-11-05T16:45:00Z'
  }
];

export const mockAnalytics = {
  revenue: {
    current: 15420.50,
    previous: 12890.75,
    growth: 19.8
  },
  orders: {
    current: 156,
    previous: 134,
    growth: 16.4
  },
  customers: {
    current: 89,
    previous: 76,
    growth: 17.1
  },
  avgOrderValue: {
    current: 98.85,
    previous: 96.20,
    growth: 2.8
  },
  chartData: {
    revenue: [
      { date: '2024-01-01', value: 1200 },
      { date: '2024-01-02', value: 1350 },
      { date: '2024-01-03', value: 1100 },
      { date: '2024-01-04', value: 1450 },
      { date: '2024-01-05', value: 1600 },
      { date: '2024-01-06', value: 1800 },
      { date: '2024-01-07', value: 1750 }
    ],
    orders: [
      { date: '2024-01-01', value: 12 },
      { date: '2024-01-02', value: 15 },
      { date: '2024-01-03', value: 11 },
      { date: '2024-01-04', value: 18 },
      { date: '2024-01-05', value: 22 },
      { date: '2024-01-06', value: 25 },
      { date: '2024-01-07', value: 23 }
    ],
    topItems: [
      { name: 'Crème Brûlée', orders: 312, revenue: 2808.88 },
      { name: 'Ratatouille', orders: 203, revenue: 4666.97 },
      { name: 'Coq au Vin', orders: 156, revenue: 4522.44 },
      { name: 'French Onion Soup', orders: 178, revenue: 2312.22 },
      { name: 'Bouillabaisse', orders: 89, revenue: 2936.11 }
    ]
  }
};

export const mockTestimonials = [
  {
    id: 'test_001',
    name: 'Chef Antoine',
    restaurant: 'Le Petit Bistro',
    text: 'GrubGate has transformed our business. We now have predictable weekly revenue and our customer base has grown by 40%.',
    rating: 5,
    image: '/images/testimonial-1.jpg'
  },
  {
    id: 'test_002',
    name: 'Maria Rodriguez',
    restaurant: 'Casa Montreal',
    text: 'The analytics dashboard helps us understand our customers better. We can see exactly what dishes are popular and when.',
    rating: 5,
    image: '/images/testimonial-2.jpg'
  },
  {
    id: 'test_003',
    name: 'David Kim',
    restaurant: 'Sushi Zen',
    text: 'Customer support is excellent. Any issues are resolved quickly and the platform is very user-friendly.',
    rating: 5,
    image: '/images/testimonial-3.jpg'
  }
];

// Enhanced partner testimonials data
export const partnerTestimonials = [
  {
    id: 'partner_001',
    name: 'Chef Antoine Dubois',
    restaurant: 'Le Petit Bistro',
    location: 'Montreal, QC',
    rating: 5,
    image: '/images/placeholder-avatar.svg',
    quote: 'GrubGate has completely revolutionized our restaurant operations. Our weekly revenue has increased by 40% since joining, and we now have a steady stream of loyal customers who love our meal planning features.',
    date: '2024-01-15',
    partnershipDuration: '8 months',
    revenueIncrease: '40%',
    orderCount: 1247
  },
  {
    id: 'partner_002',
    name: 'Maria Rodriguez',
    restaurant: 'Casa Montreal',
    location: 'Montreal, QC',
    rating: 5,
    image: '/images/placeholder-avatar.svg',
    quote: 'The analytics dashboard is incredible! We can see exactly what dishes are popular, when customers order, and how to optimize our menu. The customer insights have helped us reduce food waste by 25%.',
    date: '2024-01-12',
    partnershipDuration: '6 months',
    revenueIncrease: '35%',
    orderCount: 892
  },
  {
    id: 'partner_003',
    name: 'David Kim',
    restaurant: 'Sushi Zen',
    location: 'Montreal, QC',
    rating: 5,
    image: '/images/placeholder-avatar.svg',
    quote: 'Customer support is outstanding! Any technical issues are resolved within hours, and the platform is incredibly user-friendly. Our staff learned to use it in just one day.',
    date: '2024-01-10',
    partnershipDuration: '10 months',
    revenueIncrease: '55%',
    orderCount: 1563
  },
  {
    id: 'partner_004',
    name: 'Sophie Tremblay',
    restaurant: 'Boulangerie Artisanale',
    location: 'Montreal, QC',
    rating: 5,
    image: '/images/placeholder-avatar.svg',
    quote: 'The meal planning feature has been a game-changer for our bakery. Customers can now plan their weekly bread orders, and we have predictable demand. Our revenue has grown by 60%!',
    date: '2024-01-08',
    partnershipDuration: '4 months',
    revenueIncrease: '60%',
    orderCount: 743
  },
  {
    id: 'partner_005',
    name: 'Jean-Pierre Martin',
    restaurant: 'Bistro Français',
    location: 'Montreal, QC',
    rating: 5,
    image: '/images/placeholder-avatar.svg',
    quote: 'GrubGate\'s subscription model has given us consistent weekly revenue. We can plan our inventory better and reduce waste. The platform is intuitive and our customers love the convenience.',
    date: '2024-01-05',
    partnershipDuration: '12 months',
    revenueIncrease: '45%',
    orderCount: 2108
  },
  {
    id: 'partner_006',
    name: 'Isabella Chen',
    restaurant: 'Spice Garden',
    location: 'Montreal, QC',
    rating: 5,
    image: '/images/placeholder-avatar.svg',
    quote: 'The real-time order management system is fantastic. We can track orders, manage inventory, and communicate with customers seamlessly. Our efficiency has improved dramatically.',
    date: '2024-01-03',
    partnershipDuration: '7 months',
    revenueIncrease: '38%',
    orderCount: 967
  },
  {
    id: 'partner_007',
    name: 'Roberto Silva',
    restaurant: 'Café Brasileiro',
    location: 'Montreal, QC',
    rating: 5,
    image: '/images/placeholder-avatar.svg',
    quote: 'The customer feedback system helps us improve our menu constantly. We can see what works and what doesn\'t, and our ratings have improved from 4.2 to 4.8 stars!',
    date: '2024-01-01',
    partnershipDuration: '9 months',
    revenueIncrease: '42%',
    orderCount: 1354
  },
  {
    id: 'partner_008',
    name: 'Amélie Leblanc',
    restaurant: 'Pâtisserie Douce',
    location: 'Montreal, QC',
    rating: 5,
    image: '/images/placeholder-avatar.svg',
    quote: 'GrubGate has helped us reach customers we never would have found otherwise. The meal planning feature is perfect for our weekly dessert subscriptions. Highly recommended!',
    date: '2023-12-28',
    partnershipDuration: '5 months',
    revenueIncrease: '48%',
    orderCount: 689
  }
];

export const featuredPartnerTestimonials = partnerTestimonials.slice(0, 6);

// Mock weekly meal plans data
export const mockWeeklyPlans = [
  {
    id: 'plan_001',
    customer: {
      id: 'cust_001',
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      phone: '+1 (514) 555-0101'
    },
    planType: 'weekly',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-21T23:59:59Z',
    status: 'active',
    deliveryAddress: '456 Rue Sherbrooke, Montreal, QC H3A 1A1',
    notes: 'Please ring doorbell twice',
    meals: {
      monday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '12:00' },
        dinner: { id: 'item_001', name: 'Coq au Vin', quantity: 1, price: 28.99, deliveryTime: '18:30' }
      },
      tuesday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '12:00' },
        dinner: { id: 'item_002', name: 'Bouillabaisse', quantity: 1, price: 32.99, deliveryTime: '19:00' }
      },
      wednesday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '12:00' },
        dinner: { id: 'item_001', name: 'Coq au Vin', quantity: 1, price: 28.99, deliveryTime: '18:30' }
      },
      thursday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '12:00' },
        dinner: { id: 'item_002', name: 'Bouillabaisse', quantity: 1, price: 32.99, deliveryTime: '19:00' }
      },
      friday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '12:00' },
        dinner: { id: 'item_001', name: 'Coq au Vin', quantity: 1, price: 28.99, deliveryTime: '18:30' }
      },
      saturday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '12:00' },
        dinner: { id: 'item_002', name: 'Bouillabaisse', quantity: 1, price: 32.99, deliveryTime: '19:00' }
      },
      sunday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '12:00' },
        dinner: { id: 'item_001', name: 'Coq au Vin', quantity: 1, price: 28.99, deliveryTime: '18:30' }
      }
    },
    totalWeeklyValue: 287.86
  },
  {
    id: 'plan_002',
    customer: {
      id: 'cust_002',
      name: 'Jean-Pierre Martin',
      email: 'jp.martin@email.com',
      phone: '+1 (514) 555-0102'
    },
    planType: 'weekly',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-21T23:59:59Z',
    status: 'active',
    deliveryAddress: '789 Avenue du Parc, Montreal, QC H2V 4G1',
    notes: 'Leave at front door',
    meals: {
      monday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '12:30' },
        dinner: { id: 'item_002', name: 'Bouillabaisse', quantity: 1, price: 32.99, deliveryTime: '19:30' }
      },
      tuesday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '12:30' },
        dinner: { id: 'item_001', name: 'Coq au Vin', quantity: 1, price: 28.99, deliveryTime: '19:30' }
      },
      wednesday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '12:30' },
        dinner: { id: 'item_002', name: 'Bouillabaisse', quantity: 1, price: 32.99, deliveryTime: '19:30' }
      },
      thursday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '12:30' },
        dinner: { id: 'item_001', name: 'Coq au Vin', quantity: 1, price: 28.99, deliveryTime: '19:30' }
      },
      friday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '12:30' },
        dinner: { id: 'item_002', name: 'Bouillabaisse', quantity: 1, price: 32.99, deliveryTime: '19:30' }
      },
      saturday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '12:30' },
        dinner: { id: 'item_001', name: 'Coq au Vin', quantity: 1, price: 28.99, deliveryTime: '19:30' }
      },
      sunday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '12:30' },
        dinner: { id: 'item_002', name: 'Bouillabaisse', quantity: 1, price: 32.99, deliveryTime: '19:30' }
      }
    },
    totalWeeklyValue: 321.86
  },
  {
    id: 'plan_003',
    customer: {
      id: 'cust_003',
      name: 'Sophie Tremblay',
      email: 'sophie.tremblay@email.com',
      phone: '+1 (514) 555-0103'
    },
    planType: 'weekly',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-21T23:59:59Z',
    status: 'active',
    deliveryAddress: '321 Rue Saint-Denis, Montreal, QC H2X 3K8',
    notes: 'Vegetarian meals only',
    meals: {
      monday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '11:30' },
        dinner: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '18:00' }
      },
      tuesday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '11:30' },
        dinner: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '18:00' }
      },
      wednesday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '11:30' },
        dinner: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '18:00' }
      },
      thursday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '11:30' },
        dinner: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '18:00' }
      },
      friday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '11:30' },
        dinner: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '18:00' }
      },
      saturday: {
        lunch: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '11:30' },
        dinner: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '18:00' }
      },
      sunday: {
        lunch: { id: 'item_003', name: 'Ratatouille', quantity: 1, price: 22.99, deliveryTime: '11:30' },
        dinner: { id: 'item_005', name: 'French Onion Soup', quantity: 1, price: 12.99, deliveryTime: '18:00' }
      }
    },
    totalWeeklyValue: 251.86
  }
];

