import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { usePlanning } from '../contexts/PlanningContext';
import LocationStep from '../components/planning/LocationStep';
import RestaurantStep from '../components/planning/RestaurantStep';
import SubscriptionStep from '../components/planning/SubscriptionStep';
import MenuSelectionStep from '../components/planning/MenuSelectionStep';

const MealPlanningFlowPage = () => {
  const navigate = useNavigate();
  const { step } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { postalCode, isClient } = usePlanning();

  // Check if this is a combined menu request (has day/slot parameters)
  const day = searchParams.get('day');
  const slot = searchParams.get('slot');
  const isCombinedMenuRequest = day && slot;

  // Determine current step from URL or default to 'location'
  const getCurrentStep = () => {
    if (step) return step;
    if (location.pathname === '/plan') return 'location';
    return 'location';
  };

  const [currentStep, setCurrentStep] = useState(getCurrentStep());

  // Update current step when URL changes
  useEffect(() => {
    setCurrentStep(getCurrentStep());
  }, [step, location.pathname]);

  // Redirect logic for step validation
  useEffect(() => {
    if (!isClient) return;

    // If trying to access restaurants or subscription step without postal code, redirect to location
    // EXCEPT when it's a combined menu request (coming from WeeklyMenuPage with day/slot params)
    if ((currentStep === 'restaurants' || currentStep === 'subscription') && !postalCode && !isCombinedMenuRequest) {
      navigate('/plan', { replace: true });
      return;
    }
  }, [currentStep, postalCode, isClient, navigate, isCombinedMenuRequest]);

  const handleNextStep = () => {
    switch (currentStep) {
      case 'location':
        navigate('/plan/restaurants');
        break;
      case 'restaurants':
        navigate('/restaurants/weekly-menu');
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'restaurants':
        navigate('/plan');
        break;
      case 'subscription':
        navigate('/plan/restaurants');
        break;
      default:
        break;
    }
  };

  const renderCurrentStep = () => {
    // If this is a combined menu request, show MenuSelectionStep
    if (currentStep === 'restaurants' && isCombinedMenuRequest) {
      return (
        <MenuSelectionStep 
          onNext={handleNextStep} 
          onBack={handlePreviousStep} 
        />
      );
    }

    switch (currentStep) {
      case 'location':
        return <LocationStep onNext={handleNextStep} />;
      case 'restaurants':
        return (
          <RestaurantStep 
            onNext={handleNextStep} 
            onBack={handlePreviousStep} 
          />
        );
      case 'subscription':
        return (
          <SubscriptionStep 
            onBack={handlePreviousStep} 
          />
        );
      default:
        return <LocationStep onNext={handleNextStep} />;
    }
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-12 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="meal-planning-flow">
      {renderCurrentStep()}
    </div>
  );
};

export default MealPlanningFlowPage;
