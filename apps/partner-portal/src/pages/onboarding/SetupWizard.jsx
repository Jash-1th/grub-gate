import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faUtensils,
  faCheck,
  faArrowRight,
  faArrowLeft,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@grub-gate/ui'; // Assuming this path is correct
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../api/client';

/**
 * SetupWizard Component
 * SSR-safe multi-step restaurant setup wizard
 * Guides partners through essential configuration
 */
const SetupWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // SSR safety
  const [isClient, setIsClient] = useState(false);
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data
  const [setupData, setSetupData] = useState({
    // Operating Hours (with lunch and dinner periods)
    operatingHours: {
      monday: { 
        open: '09:00', close: '22:00', closed: false,
        lunch: { open: '11:00', close: '15:00', available: true },
        dinner: { open: '17:00', close: '22:00', available: true }
      },
      tuesday: { 
        open: '09:00', close: '22:00', closed: false,
        lunch: { open: '11:00', close: '15:00', available: true },
        dinner: { open: '17:00', close: '22:00', available: true }
      },
      wednesday: { 
        open: '09:00', close: '22:00', closed: false,
        lunch: { open: '11:00', close: '15:00', available: true },
        dinner: { open: '17:00', close: '22:00', available: true }
      },
      thursday: { 
        open: '09:00', close: '22:00', closed: false,
        lunch: { open: '11:00', close: '15:00', available: true },
        dinner: { open: '17:00', close: '22:00', available: true }
      },
      friday: { 
        open: '09:00', close: '23:00', closed: false,
        lunch: { open: '11:00', close: '15:00', available: true },
        dinner: { open: '17:00', close: '23:00', available: true }
      },
      saturday: { 
        open: '09:00', close: '23:00', closed: false,
        lunch: { open: '11:00', close: '15:00', available: true },
        dinner: { open: '17:00', close: '23:00', available: true }
      },
      sunday: { 
        open: '10:00', close: '21:00', closed: false,
        lunch: { open: '11:00', close: '15:00', available: true },
        dinner: { open: '17:00', close: '21:00', available: true }
      }
    }
  });

  useEffect(() => {
    // This effect runs only on the client-side after initial render
    setIsClient(true);
  }, []);

  // Don't render the main component during SSR to avoid hydration mismatches
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-400">Loading setup wizard...</div>
      </div>
    );
  }

  const wizardSteps = [
    { id: 1, title: 'Operating Hours', icon: faClock }
  ];

  const handleInputChange = (field, value) => {
    setSetupData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleOperatingHoursChange = (day, field, value, period = null) => {
    setSetupData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: period 
          ? {
              ...prev.operatingHours[day],
              [period]: { ...prev.operatingHours[day][period], [field]: value }
            }
          : { ...prev.operatingHours[day], [field]: value }
      }
    }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentWizardStep) {
      case 1:
        const hasOpenDay = Object.values(setupData.operatingHours).some(day => !day.closed);
        if (!hasOpenDay) {
          newErrors.operatingHours = 'Restaurant must be open at least one day per week.';
        }
        
        // Check if at least one day has lunch or dinner service
        const hasService = Object.values(setupData.operatingHours).some(day => 
          !day.closed && (day.lunch.available || day.dinner.available)
        );
        if (!hasService) {
          newErrors.operatingHours = 'Restaurant must offer lunch or dinner service on at least one day.';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePrevious = () => {
    if (currentWizardStep > 1) {
      setCurrentWizardStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    // Final validation before submitting
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    try {
      // Save the operating hours to the backend
      console.log('Operating Hours to save:', JSON.stringify(setupData.operatingHours, null, 2));

      // Make API call to update operating hours using apiClient
      const response = await apiClient.put('/auth/partner/operating-hours', {
        operatingHours: setupData.operatingHours
      });

      const result = response.data;

      console.log('✅ Operating hours saved successfully:', result);

      showSuccess('Restaurant setup completed! Your operating hours have been saved.');
      navigate('/onboarding/complete');
    } catch (error) {
      console.error('Setup completion error:', error);
      showError('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentWizardStep < wizardSteps.length) {
        setCurrentWizardStep(prev => prev + 1);
      } else {
        // This is the last step, so call complete
        handleComplete();
      }
    }
  };

  const renderStepContent = () => {
    switch (currentWizardStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(setupData.operatingHours).map(([day, hours]) => (
                <div key={day} className="p-4 sm:p-5 border-2 border-gray-200 rounded-xl hover:border-grub-red/30 hover:shadow-lg transition-all duration-200 bg-white">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => handleOperatingHoursChange(day, 'closed', !e.target.checked)}
                        className="h-6 w-6 text-grub-red focus:ring-grub-red border-gray-300 rounded cursor-pointer"
                      />
                      <span className="font-bold text-gray-900 capitalize text-lg sm:text-xl">
                        {day}
                      </span>
                    </div>
                    {hours.closed && (
                      <span className="text-gray-500 italic text-sm sm:text-base font-medium bg-gray-100 px-3 py-1 rounded-full">Closed</span>
                    )}
                  </div>

                  {/* Lunch and Dinner Times */}
                  {!hours.closed && (
                    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                      {/* Lunch Hours */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl border-2 border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-orange-800 text-sm">
                            🍽️ Lunch
                          </h4>
                          <input
                            type="checkbox"
                            checked={hours.lunch.available}
                            onChange={(e) => handleOperatingHoursChange(day, 'available', e.target.checked, 'lunch')}
                            className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        {hours.lunch.available ? (
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="time"
                              value={hours.lunch.open}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value, 'lunch')}
                              className="w-[45%] px-2 py-2 text-sm font-medium border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                            />
                            <span className="text-orange-700 text-xs font-bold">to</span>
                            <input
                              type="time"
                              value={hours.lunch.close}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value, 'lunch')}
                              className="w-[45%] px-2 py-2 text-sm font-medium border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                            />
                          </div>
                        ) : (
                          <span className="text-orange-700 text-xs italic font-medium">Not available</span>
                        )}
                      </div>

                      {/* Dinner Hours */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-purple-800 text-sm">
                            🌙 Dinner
                          </h4>
                          <input
                            type="checkbox"
                            checked={hours.dinner.available}
                            onChange={(e) => handleOperatingHoursChange(day, 'available', e.target.checked, 'dinner')}
                            className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        {hours.dinner.available ? (
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="time"
                              value={hours.dinner.open}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value, 'dinner')}
                              className="w-[45%] px-2 py-2 text-sm font-medium border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                            />
                            <span className="text-purple-700 text-xs font-bold">to</span>
                            <input
                              type="time"
                              value={hours.dinner.close}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value, 'dinner')}
                              className="w-[45%] px-2 py-2 text-sm font-medium border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                            />
                          </div>
                        ) : (
                          <span className="text-purple-700 text-xs italic font-medium">Not available</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.operatingHours && (
              <p className="text-sm text-red-600">{errors.operatingHours}</p>
            )}
          </div>
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-8 lg:p-10">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <div className="flex items-center justify-center">
            {wizardSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 transition-all duration-300 shadow-lg ${
                      currentWizardStep > step.id ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white scale-110' :
                      currentWizardStep === step.id ? 'bg-gradient-to-br from-grub-red via-grub-red to-grub-red border-grub-red text-white scale-110 animate-pulse' : 'border-gray-300 text-gray-400 bg-white'
                  }`}>
                    <FontAwesomeIcon icon={currentWizardStep > step.id ? faCheck : step.icon} className="text-xl sm:text-2xl" />
                  </div>
                   <p className={`mt-3 text-xs sm:text-sm text-center font-semibold ${currentWizardStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                   </p>
                </div>
                {index < wizardSteps.length - 1 && (
                  <div className={`flex-1 h-2 mx-4 sm:mx-6 rounded-full transition-all duration-500 ${currentWizardStep > step.id ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 lg:p-10 border-2 border-gray-100">
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
          <Button
            onClick={handlePrevious}
            disabled={currentWizardStep === 1 || isLoading}
            variant="outline"
            className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base font-semibold border-2 border-gray-300 hover:border-grub-red hover:text-grub-red transition-all duration-200 order-2 sm:order-1"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Previous
          </Button>
          <div className="text-xs sm:text-base font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 sm:py-2 rounded-lg text-center order-1 sm:order-2">
             Step {currentWizardStep} of {wizardSteps.length}
          </div>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center justify-center min-w-full sm:min-w-[160px] px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-grub-red via-grub-red to-grub-red text-white shadow-lg hover:shadow-xl transition-all duration-200 order-3"
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
            ) : currentWizardStep === wizardSteps.length ? (
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
            ) : (
              <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
            )}
            {isLoading ? 'Saving...' : currentWizardStep === wizardSteps.length ? 'Complete Setup' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;