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
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-600" />
              Set Your Operating Hours
            </h3>
            <p className="text-gray-600 mb-6">
              Set your lunch and dinner service hours. Since your restaurant details and delivery settings are already configured, this is the final step to complete your setup.
            </p>
            <div className="space-y-6">
              {Object.entries(setupData.operatingHours).map(([day, hours]) => (
                <div key={day} className="p-4 border border-gray-200 rounded-lg">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => handleOperatingHoursChange(day, 'closed', !e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="font-medium text-gray-900 capitalize text-lg">
                        {day}
                      </span>
                    </div>
                    {hours.closed && (
                      <span className="text-gray-500 italic">Closed</span>
                    )}
                  </div>

                  {/* Lunch and Dinner Times */}
                  {!hours.closed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Lunch Hours */}
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-orange-800 flex items-center">
                            🍽️ Lunch Service
                          </h4>
                          <input
                            type="checkbox"
                            checked={hours.lunch.available}
                            onChange={(e) => handleOperatingHoursChange(day, 'available', e.target.checked, 'lunch')}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                        </div>
                        {hours.lunch.available && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={hours.lunch.open}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value, 'lunch')}
                              className="px-2 py-1 text-sm border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <span className="text-orange-600 text-sm">to</span>
                            <input
                              type="time"
                              value={hours.lunch.close}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value, 'lunch')}
                              className="px-2 py-1 text-sm border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        )}
                        {!hours.lunch.available && (
                          <span className="text-orange-600 text-sm italic">No lunch service</span>
                        )}
                      </div>

                      {/* Dinner Hours */}
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-purple-800 flex items-center">
                            🌙 Dinner Service
                          </h4>
                          <input
                            type="checkbox"
                            checked={hours.dinner.available}
                            onChange={(e) => handleOperatingHoursChange(day, 'available', e.target.checked, 'dinner')}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                        </div>
                        {hours.dinner.available && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={hours.dinner.open}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value, 'dinner')}
                              className="px-2 py-1 text-sm border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <span className="text-purple-600 text-sm">to</span>
                            <input
                              type="time"
                              value={hours.dinner.close}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value, 'dinner')}
                              className="px-2 py-1 text-sm border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        )}
                        {!hours.dinner.available && (
                          <span className="text-purple-600 text-sm italic">No dinner service</span>
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md mt-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center">
          {wizardSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                    currentWizardStep > step.id ? 'bg-green-500 border-green-500 text-white' :
                    currentWizardStep === step.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'
                }`}>
                  <FontAwesomeIcon icon={currentWizardStep > step.id ? faCheck : step.icon} />
                </div>
                 <p className={`mt-2 text-xs sm:text-sm text-center font-medium ${currentWizardStep >= step.id ? 'text-gray-800' : 'text-gray-500'}`}>
                    {step.title}
                 </p>
              </div>
              {index < wizardSteps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 sm:mx-4 transition-colors duration-500 ${currentWizardStep > step.id ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8 p-1">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Button
          onClick={handlePrevious}
          disabled={currentWizardStep === 1 || isLoading}
          variant="outline"
          className="flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Previous
        </Button>
        <div className="text-sm text-gray-500">
           Step {currentWizardStep} of {wizardSteps.length}
        </div>
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center min-w-[120px] justify-center"
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
          ) : currentWizardStep === wizardSteps.length ? (
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
          ) : (
            <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
          )}
          {isLoading ? 'Saving...' : currentWizardStep === wizardSteps.length ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default SetupWizard;