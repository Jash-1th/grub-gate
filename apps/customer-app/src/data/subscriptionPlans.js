// Static subscription plans data - can be moved to backend later
export const subscriptionPlans = [
  {
    id: 'bi-weekly',
    name: 'Bi-Weekly',
    duration: '2 weeks',
    deliveryFrequency: 'Every 2 weeks',
    price: {
      monthly: 89.99,
      savings: 0
    },
    features: [
      'Flexible meal selection',
      'Basic customer support',
      'Standard delivery windows',
      'Cancel anytime'
    ],
    benefits: [
      'Perfect for trying out the service',
      'Lower commitment',
      'Ideal for occasional meal planning'
    ],
    popular: false,
    color: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  {
    id: 'monthly',
    name: 'Monthly',
    duration: '1 month',
    deliveryFrequency: 'Every month',
    price: {
      monthly: 159.99,
      savings: 10
    },
    features: [
      'All Bi-Weekly features',
      'Priority customer support',
      'Extended delivery windows',
      'Meal customization options'
    ],
    benefits: [
      'Great for regular meal planning',
      'Better value than bi-weekly',
      'More flexibility in scheduling'
    ],
    popular: true,
    color: 'bg-grub-red/5',
    borderColor: 'border-grub-red'
  },
  {
    id: 'quarterly',
    name: '3 Months',
    duration: '3 months',
    deliveryFrequency: 'Quarterly planning',
    price: {
      monthly: 139.99,
      savings: 25
    },
    features: [
      'All Monthly features',
      'Premium customer support',
      'Flexible delivery scheduling',
      'Advanced meal customization',
      'Nutritional tracking'
    ],
    benefits: [
      'Best value for regular users',
      'Significant savings',
      'Premium features included'
    ],
    popular: false,
    color: 'bg-green-50',
    borderColor: 'border-green-200'
  }
];

// Helper function to get plan by ID
export const getPlanById = (id) => {
  return subscriptionPlans.find(plan => plan.id === id);
};

// Helper function to get popular plan
export const getPopularPlan = () => {
  return subscriptionPlans.find(plan => plan.popular);
};

// Helper function to calculate total price for a plan
export const calculateTotalPrice = (plan, months = 1) => {
  return plan.price.monthly * months;
};

// Helper function to calculate savings
export const calculateSavings = (plan, comparedToPlan = 'bi-weekly') => {
  const basePlan = getPlanById(comparedToPlan);
  if (!basePlan) return 0;
  
  return (basePlan.price.monthly - plan.price.monthly) * 12; // Annual savings
};
