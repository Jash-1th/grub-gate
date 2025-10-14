import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMealPlan } from '../contexts/MealPlanContext_SSR_FIXED';
import mealCalendarApi from '../api/mealCalendarApi';
import subscriptionApi from '../api/subscriptionApi';
import Loading from '../components/common/Loading';

const MealCalendarPage = () => {
  // SSR-safe state initialization
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [userMealPlans, setUserMealPlans] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Access MealPlan context with proper error boundary
  const mealPlanContext = useMealPlan();
  
  const { 
    mealPlan, 
    getWeekPlan, 
    getWeekMealItems, 
    getWeekTotalItems, 
    getWeekTotalCost 
  } = mealPlanContext;

  // SSR safety check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Authentication check
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isClient, isAuthenticated, navigate]);

  // Initialize selected date - use startDate from URL if provided, otherwise use appropriate default
  useEffect(() => {
    if (isClient) {
      const urlStartDate = searchParams.get('startDate');
      if (urlStartDate) {
        // Validate the date format and use it
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(urlStartDate)) {
          console.log('🗓️ MealCalendar: Using subscription start date from URL:', urlStartDate);
          setSelectedDate(urlStartDate);
        } else {
          console.log('🗓️ MealCalendar: Invalid date format in URL, using default');
          setSelectedDate(getDefaultStartDate());
        }
      } else {
        console.log('🗓️ MealCalendar: No start date in URL, using default');
        setSelectedDate(getDefaultStartDate());
      }
    }
  }, [isClient, searchParams]);

  // Get default start date - subscription start for subscribed users, next Sunday for preview mode, today for others
  const getDefaultStartDate = () => {
    const today = new Date();

    // For subscribed users, use subscription start date
    if (isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
      const subscriptionStart = new Date(userMealPlans.mealPlans[0].planStartDate);
      console.log('📆 Using subscription start date as default:', subscriptionStart.toDateString());
      return subscriptionStart.toISOString().split('T')[0];
    }

    // For preview mode, start from next Sunday (same as meal planning)
    if (hasPlannedMeals) {
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

      const nextSunday = new Date(today);
      nextSunday.setDate(today.getDate() + daysUntilSunday);

      console.log('📅 Using next Sunday as default start date:', nextSunday.toDateString());
      return nextSunday.toISOString().split('T')[0];
    }

    // For no subscription and no planned meals, use today
    console.log('📆 Using today as default start date:', today.toDateString());
    return today.toISOString().split('T')[0];
  };

  // Fetch subscription data and determine user type
  useEffect(() => {
    if (isClient && isAuthenticated) {
      fetchUserMealPlans();
      fetchSubscriptionStatus();
    }
  }, [isClient, isAuthenticated]);

  // Update selectedDate when subscription data is loaded
  useEffect(() => {
    if (isClient && isSubscribed && userMealPlans?.mealPlans?.length > 0 && !searchParams.get('startDate')) {
      // Only update if no URL startDate parameter and user is subscribed
      const subscriptionStartDate = getDefaultStartDate();
      console.log('\ud83d\udcc5 Updating selectedDate to subscription start:', subscriptionStartDate);
      setSelectedDate(subscriptionStartDate);
    }
  }, [isClient, isSubscribed, userMealPlans]);

  // Determine calendar mode and fetch appropriate data
  useEffect(() => {
    if (isClient && isAuthenticated && selectedDate) {
      fetchCalendarData();
    }
  }, [isClient, isAuthenticated, selectedDate]);

  // Calculate calendar mode: SUBSCRIPTION (has active subscription) or PREVIEW (planned meals only)
  const calendarMode = calendarData ? 'SUBSCRIPTION' : 'PREVIEW';
  
  // Check if user has planned meals for preview mode (with safety check)
  const hasPlannedMeals = isClient && mealPlanContext && (
    getWeekTotalItems(0) > 0 || getWeekTotalItems(1) > 0
  );

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📅 MealCalendarPage: Fetching calendar data...');
      
      const response = await mealCalendarApi.getMealCalendar();
      
      console.log('✅ MealCalendarPage: Calendar data received:', response);
      setCalendarData(response.data);
      
    } catch (err) {
      // Only log error if it's not a 404 (which is expected for non-subscribers)
      if (err.response?.status !== 404) {
        console.error('❌ MealCalendarPage: Error fetching calendar:', err);
        setError(err.response?.data?.message || 'Failed to load meal calendar');
      } else {
        console.log('📅 No active subscription found, using preview mode');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMealPlans = async () => {
    try {
      console.log('🔍 MealCalendarPage: Fetching user meal plans...');
      
      const response = await subscriptionApi.getUserMealPlans();
      
      console.log('✅ MealCalendarPage: User meal plans received:', response);
      setUserMealPlans(response.data);
      
      // Determine if user is subscribed - check for REAL subscriptions with payment and subscription periods
      const hasActiveSubscription = response.data?.mealPlans?.some(plan => 
        plan.status === 'active' && 
        (plan.planStartDate && plan.planEndDate) && // Check for actual subscription dates
        plan.totalMealsCount > 0 // Must have meals
      ) || false;
      
      setIsSubscribed(hasActiveSubscription);
      
      console.log('📊 MealCalendarPage: User subscription status:', hasActiveSubscription);
      console.log('📊 MealCalendarPage: Meal plans found:', response.data?.mealPlans?.length || 0);
      if (response.data?.mealPlans?.length > 0) {
        console.log('\ud83d\udcca MealCalendarPage: First meal plan details:', {
          status: response.data.mealPlans[0].status,
          planStartDate: response.data.mealPlans[0].planStartDate,
          planEndDate: response.data.mealPlans[0].planEndDate,
          totalMealsCount: response.data.mealPlans[0].totalMealsCount
        });
      }
      
    } catch (err) {
      console.error('❌ MealCalendarPage: Error fetching user meal plans:', err);
      setIsSubscribed(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      console.log('🔍 MealCalendarPage: Checking subscription status...');
      
      const response = await mealCalendarApi.getSubscriptionStatus();
      
      console.log('✅ MealCalendarPage: Subscription status received:', response);
      setSubscriptionStatus(response.data);
      
    } catch (err) {
      console.error('❌ MealCalendarPage: Error checking subscription status:', err);
    }
  };

  const handleSubscribe = () => {
    console.log('🔄 MealCalendarPage: Redirecting to subscription...');
    navigate('/weekly-plan');
  };

  const handleMealStatusUpdate = async (mealId, newStatus) => {
    try {
      console.log('🔄 MealCalendarPage: Updating meal status:', { mealId, newStatus });
      
      await mealCalendarApi.updateMealStatus(mealId, newStatus);
      
      // Refresh calendar data
      await fetchCalendarData();
      
      console.log('✅ MealCalendarPage: Meal status updated successfully');
      
    } catch (err) {
      console.error('❌ MealCalendarPage: Error updating meal status:', err);
      setError(err.response?.data?.message || 'Failed to update meal status');
    }
  };

  const formatDate = (dateString) => {
    if (!isClient) return '';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  const getMealsByDate = (targetDate) => {
    if (!calendarData?.meals) return [];
    
    return calendarData.meals.filter(meal => {
      const mealDate = new Date(meal.date).toISOString().split('T')[0];
      return mealDate === targetDate;
    });
  };

  // Get next Sunday date (for unsubscribed users)
  const getNextSunday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // If today is Sunday, get next Sunday (7 days later)
    // Otherwise, get the upcoming Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    
    console.log(`📅 Next Sunday calculation: Today is ${today.toDateString()}, next Sunday is ${nextSunday.toDateString()}`);
    return nextSunday;
  };

  // Check if a date is clickable based on user subscription status
  const isDateClickable = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (isSubscribed && userMealPlans?.mealPlans?.length > 0) {
      // Subscribed user: only dates within subscription period are clickable
      const mealPlan = userMealPlans.mealPlans[0]; // Get first active meal plan
      // Check if this is a real subscription with valid subscription period
      if (mealPlan.planStartDate && mealPlan.planEndDate) {
        const startDate = new Date(mealPlan.planStartDate);
        const endDate = new Date(mealPlan.planEndDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        console.log(`📆 Subscription date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
        console.log(`📆 Checking date: ${date.toDateString()}, Start: ${startDate.toDateString()}, End: ${endDate.toDateString()}`);
        console.log(`📆 Date comparison: ${date.getTime()} >= ${startDate.getTime()} && ${date.getTime()} <= ${endDate.getTime()}`);
        const isClickable = date >= startDate && date <= endDate;
        console.log(`📆 Result: ${isClickable}`);
        return isClickable;
      } else {
        // No valid subscription period, treat as unsubscribed
        console.log(`⚠️ No valid subscription period found, using unsubscribed logic`);
        const nextSunday = getNextSunday();
        nextSunday.setHours(0, 0, 0, 0);

        const twoWeeksLater = new Date(nextSunday);
        twoWeeksLater.setDate(nextSunday.getDate() + 13);

        return date >= nextSunday && date <= twoWeeksLater;
      }
    } else {
      // Unsubscribed user: next Sunday + 14 days (2 weeks)
      const nextSunday = getNextSunday();
      nextSunday.setHours(0, 0, 0, 0);
      
      const twoWeeksLater = new Date(nextSunday);
      twoWeeksLater.setDate(nextSunday.getDate() + 13); // 14 days total (Sunday to Saturday of 2nd week)
      
      const isClickable = date >= nextSunday && date <= twoWeeksLater;
      
      if (date.getTime() === nextSunday.getTime() || date.getTime() === twoWeeksLater.getTime()) {
        console.log(`📅 Date range: ${dateString} - Clickable: ${isClickable} (Range: ${nextSunday.toDateString()} to ${twoWeeksLater.toDateString()})`);
      }
      
      return isClickable;
    }
  };

  // Handle date click
  const handleDateClick = (dateString) => {
    if (!isDateClickable(dateString)) {
      console.log('🚫 Date not clickable:', dateString);
      return;
    }
    
    console.log('📅 Date clicked:', dateString);
    setSelectedDate(dateString);
    
    // Calculate which week this date belongs to and update currentWeekStart
    const clickedDate = new Date(dateString);
    const dayOfWeek = clickedDate.getDay();
    const weekStart = new Date(clickedDate);
    weekStart.setDate(clickedDate.getDate() - dayOfWeek); // Go to Sunday of that week
    
    setCurrentWeekStart(weekStart.toISOString().split('T')[0]);
    console.log('📅 Updated week start to:', weekStart.toDateString());
  };

  const getWeekDates = (startDate) => {
    if (!isClient) return [];
    
    const dates = [];
    let weekStartDate;
    
    // Use currentWeekStart if available, otherwise calculate from selectedDate
    if (currentWeekStart) {
      weekStartDate = new Date(currentWeekStart);
      console.log(`📅 Using current week start: ${weekStartDate.toDateString()}`);
    } else if (calendarMode === 'PREVIEW' && hasPlannedMeals) {
      // For preview mode, use the same logic as meal planning - start from next Sunday
      weekStartDate = getNextSunday();
      console.log(`📅 Preview mode: Starting calendar from next Sunday (${weekStartDate.toDateString()})`);
    } else {
      // For subscription mode or regular calendar, use the provided startDate
      const start = new Date(startDate);
      const dayOfWeek = start.getDay();
      weekStartDate = new Date(start);
      weekStartDate.setDate(start.getDate() - dayOfWeek); // Go to Sunday of that week
    }
    
    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Generate preview meals from planned meal data using stored dates
  const generatePreviewMeals = () => {
    if (!isClient || !hasPlannedMeals) return [];
    
    const previewMeals = [];
    
    // Generate meals for both weeks using stored dates
    for (let weekIndex = 0; weekIndex < 2; weekIndex++) {
      const weekPlan = getWeekPlan(weekIndex);
      if (!weekPlan) continue;
      
      // Generate meals for each day of the week
      Object.entries(weekPlan).forEach(([day, dayMeals]) => {
        // Skip days without meals
        const hasLunchMeals = dayMeals.lunch && dayMeals.lunch.length > 0;
        const hasDinnerMeals = dayMeals.dinner && dayMeals.dinner.length > 0;
        
        if (!hasLunchMeals && !hasDinnerMeals) {
          return; // Skip empty days
        }
        
        // Use stored date if available, otherwise fallback to calculation
        let mealDate;
        if (dayMeals.date) {
          // Use the stored date from backend
          mealDate = new Date(dayMeals.date + 'T00:00:00.000Z'); // Ensure UTC
          console.log(`📅 Using stored date for ${day}:`, dayMeals.date);
        } else {
          // Fallback to old calculation method
          console.log(`⚠️ No stored date for ${day}, using fallback calculation`);
          const today = new Date();
          const weekStartDate = new Date(today);
          const daysUntilNextMonday = ((1 - today.getDay()) + 7) % 7 || 7;
          weekStartDate.setDate(today.getDate() + daysUntilNextMonday + (weekIndex * 7));
          
          const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day);
          mealDate = new Date(weekStartDate);
          mealDate.setDate(weekStartDate.getDate() + dayIndex);
        }
        
        // Generate lunch and dinner meals
        ['lunch', 'dinner'].forEach(mealType => {
          if (dayMeals[mealType] && dayMeals[mealType].length > 0) {
            dayMeals[mealType].forEach((meal, index) => {
              // Generate realistic delivery times for preview
              const baseHour = mealType === 'lunch' ? 12 : 19;
              const startTime = `${baseHour.toString().padStart(2, '0')}:00`;
              const endTime = `${(baseHour + 1).toString().padStart(2, '0')}:00`;
              
              previewMeals.push({
                _id: `preview-${weekIndex}-${day}-${mealType}-${index}`,
                mealName: meal.name || meal.itemName || 'Planned Meal',
                mealType: mealType,
                date: mealDate.toISOString(),
                status: 'planned',
                deliveryTime: {
                  start: startTime,
                  end: endTime
                },
                restaurant: meal.restaurant || meal.restaurantName || 'Restaurant',
                price: meal.price || 0,
                duration: 60 // Add 60 minutes duration for preview meals
              });
            });
          }
        });
      });
    }
    
    console.log('✅ Generated preview meals with stored dates:', previewMeals.length);
    return previewMeals;
  };

  // Get preview calendar data structure
  const getPreviewCalendarData = () => {
    if (!hasPlannedMeals) return null;
    
    const previewMeals = generatePreviewMeals();
    const totalMeals = getWeekTotalItems(0) + getWeekTotalItems(1);
    const totalCost = getWeekTotalCost(0) + getWeekTotalCost(1);
    
    return {
      meals: previewMeals,
      calendar: {
        // No subscription period data for preview mode
        totalMeals: totalMeals,
        deliveredMeals: 0,
        progressPercentage: 0
        // No remainingDays for preview mode
      },
      summary: {
        byMealType: {
          lunch: previewMeals.filter(m => m.mealType === 'lunch').length,
          dinner: previewMeals.filter(m => m.mealType === 'dinner').length
        },
        byStatus: {
          planned: previewMeals.length
        }
      }
    };
  };

  // SSR safety - don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Loading text="Loading your meal calendar..." />
        </div>
      </div>
    );
  }

  // Error state - only show if no calendar data AND no planned meals
  if (error && !calendarData && !hasPlannedMeals) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">No Meal Plan Found</h1>
                <p className="text-gray-600 mb-6">You haven't planned any meals yet. Start by creating your weekly meal plan!</p>
                <p className="text-sm text-gray-500">Plan your meals to see a preview of your delivery schedule.</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/weekly-menu')}
                  className="w-full bg-grub-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Plan Your Meals</span>
                </button>
                
                <button
                  onClick={handleSubscribe}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Subscribe to Meal Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use either subscription data or preview data
  const displayData = calendarData || getPreviewCalendarData();

  // For subscribed users, calculate week dates based on subscription start date
  const getWeekStartDate = () => {
    if (isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
      // Use subscription start date as the base for week calculation
      const subscriptionStart = new Date(userMealPlans.mealPlans[0].planStartDate);
      console.log(`📅 Using subscription start date for week calculation: ${subscriptionStart.toDateString()}`);
      return subscriptionStart.toISOString().split('T')[0];
    } else {
      // For unsubscribed users, use selected date
      return selectedDate;
    }
  };

  const weekDates = selectedDate ? getWeekDates(getWeekStartDate()) : [];

  const getMealsForDisplay = (targetDate) => {
    if (!displayData?.meals) return [];
    
    return displayData.meals.filter(meal => {
      const mealDate = new Date(meal.date).toISOString().split('T')[0];
      return mealDate === targetDate;
    });
  };
  
  const currentWeekMeals = weekDates.reduce((acc, date) => {
    acc[date] = getMealsForDisplay(date);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {calendarMode === 'PREVIEW' ? 'Meal Plan Preview' : 'My Meal Calendar'}
                </h1>
              </div>
              <p className="text-red-100 text-sm sm:text-base">
                {calendarMode === 'PREVIEW' 
                  ? 'Preview your planned meals schedule before subscribing'
                  : 'Track your scheduled meals and delivery status'
                }
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => navigate('/weekly-menu')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Menu</span>
              </button>
              
              {!subscriptionStatus?.hasActiveSubscription && (
                <button
                  onClick={handleSubscribe}
                  className="bg-white text-grub-red px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Subscribe to Plan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Subscription Status / Preview Card */}
        {displayData?.calendar && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  calendarMode === 'PREVIEW' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {calendarMode === 'PREVIEW' ? (
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {calendarMode === 'PREVIEW' ? 'Meal Plan Preview' : 'Active Subscription'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Plan Type: {displayData.calendar.subscriptionPeriod?.planType || 'Bi-Weekly'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  calendarMode === 'PREVIEW' ? 'text-blue-600' : 'text-grub-red'
                }`}>
                  {calendarMode === 'PREVIEW' ? displayData.calendar.totalMeals : displayData.calendar.progressPercentage + '%'}
                </div>
                <p className="text-xs text-gray-500">
                  {calendarMode === 'PREVIEW' ? 'Total Meals' : 'Complete'}
                </p>
              </div>
            </div>
            
            {/* Subscription Period - Only show for active subscriptions */}
            {calendarMode === 'SUBSCRIPTION' && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(displayData.calendar.subscriptionPeriod.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">End Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(displayData.calendar.subscriptionPeriod.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Days Left</p>
                    <p className="font-semibold text-grub-red">
                      {displayData.calendar.remainingDays}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Progress Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {calendarMode === 'PREVIEW' ? 'Meal Planning' : 'Meal Progress'}
                </span>
                <span className="text-sm text-gray-600">
                  {calendarMode === 'PREVIEW' 
                    ? `${displayData.calendar.totalMeals} meals planned`
                    : `${displayData.calendar.deliveredMeals} of ${displayData.calendar.totalMeals} delivered`
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                    calendarMode === 'PREVIEW' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-r from-grub-red to-red-500'
                  }`}
                  style={{ 
                    width: calendarMode === 'PREVIEW' ? '100%' : `${displayData.calendar.progressPercentage}%` 
                  }}
                ></div>
              </div>
              
              {/* Subscribe CTA for Preview Mode */}
              {calendarMode === 'PREVIEW' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-grub-red/5 to-red-50 rounded-lg border border-red-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <p className="text-sm font-semibold text-grub-red">Ready to start your meal plan?</p>
                      <p className="text-xs text-red-600">Subscribe now to activate your scheduled meals</p>
                    </div>
                    <button
                      onClick={() => navigate('/subscription')}
                      className="bg-grub-red text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span>Subscribe Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {displayData?.meals && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Weekly Meal Schedule</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isSubscribed 
                      ? 'Click on any date within your subscription period'
                      : `Click on dates from ${getNextSunday().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${new Date(getNextSunday().getTime() + 13 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (2 weeks)`
                    }
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Jump to date:</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate ? 
                      new Date(userMealPlans.mealPlans[0].planStartDate).toISOString().split('T')[0] : 
                      getNextSunday().toISOString().split('T')[0]
                    }
                    max={isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planEndDate ? 
                      new Date(userMealPlans.mealPlans[0].planEndDate).toISOString().split('T')[0] : 
                      (() => {
                        const nextSunday = getNextSunday();
                        const twoWeeksLater = new Date(nextSunday);
                        twoWeeksLater.setDate(nextSunday.getDate() + 13);
                        return twoWeeksLater.toISOString().split('T')[0];
                      })()
                    }
                    onChange={(e) => {
                      const newDate = e.target.value;
                      if (isDateClickable(newDate)) {
                        handleDateClick(newDate);
                      } else {
                        console.log('🚫 Date picker: Date not clickable:', newDate);
                        // Reset to current selected date if invalid
                        e.target.value = selectedDate;
                        alert('This date is not available for your subscription period.');
                      }
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            {/* Week Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {weekDates.map((date) => {
                const dayMeals = currentWeekMeals[date] || [];
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                const dayShort = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = new Date(date).getDate();
                const monthName = new Date(date).toLocaleDateString('en-US', { month: 'short' });
                const isToday = date === new Date().toISOString().split('T')[0];
                const hasMeals = dayMeals.length > 0;
                const isClickable = isDateClickable(date);
                const isSelected = date === selectedDate;
                
                return (
                  <div 
                    key={date} 
                    className={`p-4 min-h-[250px] transition-all duration-200 hover:bg-gray-50 ${
                      isToday ? 'bg-gradient-to-b from-grub-red/5 to-red-50' : ''
                    } ${
                      isSelected ? 'ring-2 ring-grub-red bg-red-50' : ''
                    }`}
                  >
                    {/* Day Header - ONLY this part should be clickable/non-clickable */}
                    <div className="text-center mb-4">
                      <div className={`text-sm font-medium ${
                        isToday ? 'text-grub-red' : 'text-gray-600'
                      }`}>
                        <span className="hidden sm:inline">{dayName}</span>
                        <span className="sm:hidden">{dayShort}</span>
                      </div>
                      
                      {/* Date Number - This is the ONLY clickable part */}
                      <div 
                        className={`text-xl font-bold mt-1 transition-all duration-200 inline-block ${
                          isToday 
                            ? 'bg-grub-red text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto shadow-lg cursor-pointer' 
                            : isSelected
                            ? 'bg-grub-red text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto cursor-pointer'
                            : isClickable
                            ? 'text-gray-800 hover:bg-grub-red hover:text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto cursor-pointer'
                            : 'text-gray-500 rounded-full w-10 h-10 flex items-center justify-center mx-auto cursor-not-allowed opacity-75 hover:bg-red-200 hover:text-red-700 hover:opacity-90 relative group'
                        }`}
                        onClick={() => handleDateClick(date)}
                        title={isClickable ? `Click to view ${dayName}, ${monthName} ${dayNumber}` : `${dayName}, ${monthName} ${dayNumber} - Not available`}
                      >
                        {dayNumber}
                        {/* X overlay for non-clickable dates on hover */}
                        {!isClickable && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs mt-1 text-gray-500">{monthName}</div>
                      {isToday && (
                        <div className="text-xs text-grub-red font-semibold mt-1">Today</div>
                      )}
                      {isSelected && !isToday && (
                        <div className="text-xs text-grub-red font-semibold mt-1">Selected</div>
                      )}
                      {!isClickable && (
                        <div className="text-xs text-gray-400 mt-1 opacity-60">Not Available</div>
                      )}
                    </div>
                    
                    {/* Meals - These should ALWAYS be fully visible and clickable */}
                    <div className="space-y-2">
                      {dayMeals.length === 0 ? (
                        <div className="text-center py-6">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <p className="text-xs text-gray-400">No meals</p>
                          <p className="text-xs text-gray-400">scheduled</p>
                        </div>
                      ) : (
                        dayMeals.map((meal) => {
                          const statusConfig = {
                            delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', border: 'border-green-200' },
                            preparing: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🍳', border: 'border-yellow-200' },
                            ready: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📦', border: 'border-blue-200' },
                            scheduled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📅', border: 'border-gray-200' },
                            planned: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '👁️', border: 'border-blue-200' },
                            cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕', border: 'border-red-200' }
                          };
                          
                          const config = statusConfig[meal.status] || statusConfig.scheduled;
                          
                          return (
                            <div
                              key={meal._id}
                              className={`${config.bg} ${config.text} ${config.border} border rounded-xl p-3 transition-all duration-200 hover:shadow-md cursor-pointer`}
                              title={`${meal.mealName} - ${meal.status}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wide">
                                  {meal.mealType}
                                </span>
                                <span className="text-sm">{config.icon}</span>
                              </div>
                              
                              <div className="text-sm font-medium mb-1 line-clamp-2" title={meal.mealName}>
                                {meal.mealName}
                              </div>
                              
                              <div className="text-xs opacity-75 mb-2">
                                🕐 {meal.deliveryTime.start} - {meal.deliveryTime.end}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold capitalize px-2 py-1 rounded-full bg-white/50">
                                  {meal.status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Summary Stats */}
        {displayData?.summary && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Meal Types Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Meal Breakdown</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(displayData.summary.byMealType).map(([type, count]) => {
                  const mealIcons = {
                    breakfast: '🌅',
                    lunch: '🍽️', 
                    dinner: '🌙'
                  };
                  return (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{mealIcons[type] || '🍴'}</span>
                        <span className="capitalize font-medium text-gray-700">{type}</span>
                      </div>
                      <span className="text-xl font-bold text-grub-red">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Status Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delivery Status</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(displayData.summary.byStatus).map(([status, count]) => {
                  const statusConfig = {
                    delivered: { color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
                    preparing: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🍳' },
                    ready: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '📦' },
                    scheduled: { color: 'text-gray-600', bg: 'bg-gray-50', icon: '📅' },
                    planned: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '👁️' },
                    cancelled: { color: 'text-red-600', bg: 'bg-red-50', icon: '❌' }
                  };
                  const config = statusConfig[status] || statusConfig.scheduled;
                  
                  return (
                    <div key={status} className={`flex items-center justify-between p-3 ${config.bg} rounded-lg`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{config.icon}</span>
                        <span className={`capitalize font-medium ${config.color}`}>{status}</span>
                      </div>
                      <span className={`text-xl font-bold ${config.color}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/weekly-menu')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-grub-red/5 hover:bg-grub-red/10 rounded-lg transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-grub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-grub-red group-hover:text-red-700">Plan New Meals</span>
                </button>
                
                <button
                  onClick={fetchCalendarData}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">Refresh Calendar</span>
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-700">Account Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCalendarPage;
