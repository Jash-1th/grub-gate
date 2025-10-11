// FILE: apps/customer-app/src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faCheck, 
  faSpinner,
  faShoppingCart,
  faMapMarkerAlt,
  faCreditCard,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';
import AddressSelectionStep from '../components/checkout/AddressSelectionStep';
import PaymentStep from '../components/checkout/PaymentStep';
import OrderConfirmationStep from '../components/checkout/OrderConfirmationStep';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useMealPlan } from '../contexts/MealPlanContext_SSR_FIXED';

/**
 * Checkout Page
 * Multi-step checkout process with address selection, payment, and confirmation
 * SSR-safe implementation
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const { weeklyPlans } = useMealPlan();
  
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Checkout data state
  const [checkoutData, setCheckoutData] = useState({
    items: [],
    restaurant: null,
    deliveryAddress: null,
    paymentMethod: null,
    specialInstructions: '',
    orderType: 'single', // 'single' or 'subscription'
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0
  });

  // Steps configuration
  const steps = [
    {
      id: 1,
      title: 'Delivery Address',
      icon: faMapMarkerAlt,
      component: AddressSelectionStep
    },
    {
      id: 2,
      title: 'Payment',
      icon: faCreditCard,
      component: PaymentStep
    },
    {
      id: 3,
      title: 'Confirmation',
      icon: faReceipt,
      component: OrderConfirmationStep
    }
  ];

  // SSR safety
  useEffect(() => {
    setIsClient(true);
    
    // Check authentication
    if (!isAuthenticated) {
      showError('Authentication Required', 'Please log in to continue with checkout');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Load checkout data from location state or meal plan context
    loadCheckoutData();
  }, [isAuthenticated, location.state, weeklyPlans]);

  // Load checkout data
  const loadCheckoutData = () => {
    try {
      // Get data from navigation state (from cart or meal plan)
      const stateData = location.state;
      
      if (stateData?.items && stateData?.restaurant) {
        // Direct checkout from cart
        setCheckoutData(prev => ({
          ...prev,
          items: stateData.items,
          restaurant: stateData.restaurant,
          orderType: stateData.orderType || 'single',
          subtotal: stateData.subtotal || 0,
          deliveryFee: stateData.deliveryFee || 0,
          tax: stateData.tax || 0,
          total: stateData.total || 0
        }));
      } else if (weeklyPlans && weeklyPlans.length > 0) {
        // Checkout from meal plan
        const mealPlanItems = extractItemsFromMealPlan();
        if (mealPlanItems.length > 0) {
          setCheckoutData(prev => ({
            ...prev,
            items: mealPlanItems.items,
            restaurant: mealPlanItems.restaurant,
            orderType: 'subscription',
            subtotal: mealPlanItems.subtotal,
            deliveryFee: mealPlanItems.deliveryFee,
            tax: mealPlanItems.tax,
            total: mealPlanItems.total
          }));
        } else {
          // No items to checkout
          showError('No Items', 'No items found for checkout. Please add items to your meal plan first.');
          navigate('/plan');
        }
      } else {
        // No checkout data available
        showError('No Items', 'No items found for checkout. Please add items to your cart first.');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      showError('Checkout Error', 'Unable to load checkout data. Please try again.');
      navigate('/');
    }
  };

  // Extract items from meal plan for checkout
  const extractItemsFromMealPlan = () => {
    if (!weeklyPlans || weeklyPlans.length === 0) return { items: [] };

    const items = [];
    let subtotal = 0;
    let restaurant = null;

    weeklyPlans.forEach(week => {
      Object.entries(week.meals || {}).forEach(([day, dayMeals]) => {
        ['lunch', 'dinner'].forEach(mealType => {
          const meals = dayMeals[mealType] || [];
          meals.forEach(meal => {
            items.push({
              id: meal.id,
              menuItemId: meal.menuItemId,
              name: meal.name,
              price: meal.price,
              quantity: 1,
              restaurantName: meal.restaurantName,
              deliveryDay: day,
              mealType: mealType,
              deliveryTime: meal.deliveryTime
            });
            subtotal += meal.price;
            
            // Set restaurant info from first item
            if (!restaurant) {
              restaurant = {
                name: meal.restaurantName,
                // Note: In a real implementation, you'd need the full restaurant object
                // This is simplified for the example
              };
            }
          });
        });
      });
    });

    const deliveryFee = 2.99; // Base delivery fee
    const tax = subtotal * 0.13; // 13% tax (adjust based on location)
    const total = subtotal + deliveryFee + tax;

    return {
      items,
      restaurant,
      subtotal,
      deliveryFee,
      tax,
      total
    };
  };

  // Handle step navigation
  const handleNextStep = (stepData) => {
    setCheckoutData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBackToCart = () => {
    navigate(-1); // Go back to previous page
  };

  // Get current step component
  const getCurrentStepComponent = () => {
    const step = steps.find(s => s.id === currentStep);
    if (!step) return null;

    const StepComponent = step.component;
    return (
      <StepComponent
        checkoutData={checkoutData}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        isLoading={loading}
        setLoading={setLoading}
      />
    );
  };

  // SSR loading state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBackToCart}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FontAwesomeIcon icon={faShoppingCart} className="mr-3 text-blue-600" />
                  Checkout
                </h1>
                <p className="mt-1 text-gray-600">
                  Complete your order in {steps.length} simple steps
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${currentStep === step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {currentStep > step.id ? (
                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                  ) : (
                    <FontAwesomeIcon icon={step.icon} className="w-4 h-4" />
                  )}
                </div>

                {/* Step Label */}
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    ml-6 w-16 h-0.5 transition-colors duration-300
                    ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            {/* Items */}
            <div className="max-h-32 overflow-y-auto">
              {checkoutData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.restaurantName && (
                      <p className="text-sm text-gray-600">{item.restaurantName}</p>
                    )}
                    {item.deliveryDay && item.mealType && (
                      <p className="text-xs text-blue-600">
                        {item.deliveryDay} {item.mealType}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-600">×{item.quantity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${checkoutData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>${checkoutData.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${checkoutData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>${checkoutData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Step Component */}
        <div className="bg-white rounded-xl shadow-sm">
          {getCurrentStepComponent()}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex items-center space-x-4">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-blue-600" />
              <span className="text-lg font-medium">Processing your order...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
