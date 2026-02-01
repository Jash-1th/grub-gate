import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useMealPlan } from '../contexts/MealPlanContext_SSR_FIXED';
import mealCalendarApi from '../api/mealCalendarApi';
import subscriptionApi from '../api/subscriptionApi';
import Loading from '../components/common/Loading';
import MealDetailModal from '../components/calendar/MealDetailModal';

const MealCalendarPage = () => {
  const { t } = useTranslation();
  
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
  const [planRange, setPlanRange] = useState({ startDate: null, endDate: null });
  
  // Modal state for meal details
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMealData, setSelectedMealData] = useState({
    meals: [],
    date: null,
    mealType: null
  });

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const includeWeek2 = searchParams.get('includeWeek2') === '1';

  // Access MealPlan context with proper error boundary
  const mealPlanContext = useMealPlan();
  
  const { 
    mealPlan, 
    getWeekPlan, 
    getWeekMealItems, 
    getWeekTotalItems, 
    getWeekTotalCost,
    isLoadingFromDatabase,
    hasLoadedFromDatabase
  } = mealPlanContext;

  const hasWeek2PlannedMeals = isClient && getWeekTotalItems(1) > 0;
  const shouldShowWeek2 = includeWeek2 || hasWeek2PlannedMeals;
  const week2Clickable = hasWeek2PlannedMeals;

  useEffect(() => {
    if (!isClient) return;
    setCurrentWeekStart(null);
  }, [includeWeek2, isClient]);

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

  // Check if user has planned meals for preview mode (with safety check)
  const hasPlannedMeals = isClient && mealPlanContext && (
    getWeekTotalItems(0) > 0 || getWeekTotalItems(1) > 0
  );

  // Check if meal data has stored dates (indicates full database sync)
  const hasMealDatesLoaded = () => {
    if (!hasPlannedMeals) return false;
    
    // Check if any meal in week 0 has a stored date
    const weekPlan = getWeekPlan(0);
    if (!weekPlan) return false;
    
    let hasMealsWithoutDates = false;
    let hasMealsWithDates = false;
    
    for (const [day, dayMeals] of Object.entries(weekPlan)) {
      if (dayMeals && (dayMeals.lunch?.length > 0 || dayMeals.dinner?.length > 0)) {
        if (dayMeals.date) {
          hasMealsWithDates = true;
          console.log(`✅ hasMealDatesLoaded: ${day} has stored date: ${dayMeals.date}`);
        } else {
          hasMealsWithoutDates = true;
          console.log(`🔍 hasMealDatesLoaded: ${day} has meals but no date`);
        }
      }
    }
    
    // If we have some meals with dates, consider it loaded (mixed state is ok)
    // If no meals have dates after database sync, fall back to calculated dates
    if (hasMealsWithDates) {
      console.log('✅ hasMealDatesLoaded: Some meals have dates - using stored dates');
      return true;
    } else if (hasLoadedFromDatabase && !hasMealsWithDates) {
      console.log('⚠️ hasMealDatesLoaded: Database sync complete but no stored dates - using calculated dates');
      return true; // Allow fallback to calculated dates
    }
    
    console.log('⏳ hasMealDatesLoaded: Still waiting for database sync...');
    return false;
  };

  // Check if meal plan data is still loading
  const isMealPlanLoading = isLoadingFromDatabase && !hasLoadedFromDatabase;

  // Calculate calendar mode: SUBSCRIPTION (has active subscription) or PREVIEW (planned meals only)
  const calendarMode = calendarData ? 'SUBSCRIPTION' : 'PREVIEW';
  
  // Check if meal dates are still loading (for preview mode) - only if database hasn't loaded yet
  const isMealDatesLoading = calendarMode === 'PREVIEW' && hasPlannedMeals && !hasLoadedFromDatabase;

  // Redirect users without planned meals and no active subscription (but wait for meal plan to load)
  useEffect(() => {
    if (isClient && isAuthenticated && !loading && !isMealPlanLoading && !calendarData && !hasPlannedMeals) {
      console.log('🚫 MealCalendar: No planned meals and no active subscription, redirecting to weekly menu');
      navigate('/weekly-menu');
    }
  }, [isClient, isAuthenticated, loading, isMealPlanLoading, calendarData, hasPlannedMeals, navigate]);

  // Consolidated initialization function with parallel API calls for better performance
  const initializeCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 MealCalendar: Starting parallel data fetch...');
      
      // Fetch all API data in parallel (much faster!)
      const [mealPlansResult, subscriptionResult, calendarResult] = await Promise.allSettled([
        fetchUserMealPlans(),
        fetchSubscriptionStatus(),
        fetchCalendarData()
      ]);
      
      // Log results
      if (mealPlansResult.status === 'fulfilled') {
        console.log('✅ MealCalendar: User meal plans loaded');
      } else {
        console.error('❌ MealCalendar: Failed to load meal plans:', mealPlansResult.reason);
      }
      
      if (subscriptionResult.status === 'fulfilled') {
        console.log('✅ MealCalendar: Subscription status loaded');
      } else {
        console.error('❌ MealCalendar: Failed to load subscription status:', subscriptionResult.reason);
      }
      
      if (calendarResult.status === 'fulfilled') {
        console.log('✅ MealCalendar: Calendar data loaded');
      } else {
        console.error('❌ MealCalendar: Failed to load calendar data:', calendarResult.reason);
      }
      
      const fetchedMealPlans = mealPlansResult.status === 'fulfilled' ? mealPlansResult.value : null;
      const fetchedPlanStartDate = fetchedMealPlans?.mealPlans?.length > 0 && fetchedMealPlans.mealPlans[0].planStartDate
        ? new Date(fetchedMealPlans.mealPlans[0].planStartDate).toISOString().split('T')[0]
        : null;
      const fetchedPlanEndDate = fetchedMealPlans?.mealPlans?.length > 0 && fetchedMealPlans.mealPlans[0].planEndDate
        ? new Date(fetchedMealPlans.mealPlans[0].planEndDate).toISOString().split('T')[0]
        : null;

      if (fetchedPlanStartDate || fetchedPlanEndDate) {
        setPlanRange({ startDate: fetchedPlanStartDate, endDate: fetchedPlanEndDate });
      }

      console.log('🔄 MealCalendar: Handling date initialization...');
      
      // Handle date initialization after data is loaded
      const urlStartDate = searchParams.get('startDate');
      let dateToSet = null;
      
      if (urlStartDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(urlStartDate)) {
          if (fetchedPlanStartDate) {
            const urlDateObj = new Date(urlStartDate);
            const planStartObj = new Date(fetchedPlanStartDate);
            const planEndObj = fetchedPlanEndDate ? new Date(fetchedPlanEndDate) : null;
            const withinPlan = planEndObj
              ? (urlDateObj >= planStartObj && urlDateObj <= planEndObj)
              : (urlDateObj >= planStartObj);

            if (withinPlan) {
              console.log('🗓️ MealCalendar: Using URL startDate within plan range:', urlStartDate);
              dateToSet = urlStartDate;
            } else {
              console.log('🗓️ MealCalendar: URL startDate outside plan range, clamping to planStartDate:', fetchedPlanStartDate);
              dateToSet = fetchedPlanStartDate;
            }
          } else {
            console.log('🗓️ MealCalendar: Using startDate from URL:', urlStartDate);
            dateToSet = urlStartDate;
          }
        } else {
          console.log('🗓️ MealCalendar: Invalid date format in URL, using default');
          dateToSet = getDefaultStartDate();
        }
      } else if (!selectedDate) {
        console.log('🗓️ MealCalendar: No start date in URL, using default');
        dateToSet = fetchedPlanStartDate || getDefaultStartDate();
      }
      
      // Set the date if we determined one
      if (dateToSet && dateToSet !== selectedDate) {
        console.log('🗓️ MealCalendar: Setting selected date to:', dateToSet);
        setSelectedDate(dateToSet);

        const clickedDate = new Date(dateToSet);
        const dayOfWeek = clickedDate.getDay();
        const weekStart = new Date(clickedDate);
        weekStart.setDate(clickedDate.getDate() - dayOfWeek);
        setCurrentWeekStart(weekStart.toISOString().split('T')[0]);
      }
      
      console.log('✅ MealCalendar: Initialization complete!');
      
    } catch (error) {
      console.error('❌ MealCalendar: Initialization error:', error);
      setError('Failed to load meal calendar data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get earliest stored meal date from meal plan
  const getEarliestStoredMealDate = () => {
    if (!mealPlanContext || !hasPlannedMeals) return null;
    
    let earliestDate = null;
    
    // Check both weeks for stored dates
    for (let weekIndex = 0; weekIndex < 2; weekIndex++) {
      const weekPlan = getWeekPlan(weekIndex);
      if (!weekPlan) continue;
      
      Object.entries(weekPlan).forEach(([day, dayMeals]) => {
        if (dayMeals && dayMeals.date) {
          const mealDate = new Date(dayMeals.date);
          if (!earliestDate || mealDate < earliestDate) {
            earliestDate = mealDate;
            console.log(`📅 Found stored meal date for ${day}:`, dayMeals.date);
          }
        }
      });
    }
    
    if (earliestDate) {
      // Get the Sunday of the week containing the earliest meal date
      const dayOfWeek = earliestDate.getDay();
      const weekStartDate = new Date(earliestDate);
      weekStartDate.setDate(earliestDate.getDate() - dayOfWeek); // Go to Sunday of that week
      console.log(`📅 Earliest stored meal date: ${earliestDate.toDateString()}, week starts: ${weekStartDate.toDateString()}`);
      return weekStartDate;
    }
    
    return null;
  };

  // Get default start date - subscription start for subscribed users, stored meal date for preview mode, today for others
  const getDefaultStartDate = () => {
    const today = new Date();

    // For subscribed users, use subscription start date from calendar data
    if (isSubscribed && calendarData?.calendar?.subscriptionPeriod?.startDate) {
      const subscriptionStart = new Date(calendarData.calendar.subscriptionPeriod.startDate);
      console.log('📆 Using subscription start date as default:', subscriptionStart.toDateString());
      return subscriptionStart.toISOString().split('T')[0];
    } else if (isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
      // Fallback to user meal plans
      const subscriptionStart = new Date(userMealPlans.mealPlans[0].planStartDate);
      console.log('📆 Using fallback subscription start date as default:', subscriptionStart.toDateString());
      return subscriptionStart.toISOString().split('T')[0];
    }

    if (!isSubscribed && planRange?.startDate) {
      return planRange.startDate;
    }

    // For unsubscribed users with weekly plans, use their actual meal dates (not plan start date)
    if (!isSubscribed && hasPlannedMeals) {
      if (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
        const weeklyPlanStart = new Date(userMealPlans.mealPlans[0].planStartDate);
        console.log('📆 Using weekly plan start date as default for unsubscribed user:', weeklyPlanStart.toDateString());
        return weeklyPlanStart.toISOString().split('T')[0];
      }

      const storedWeekStart = getEarliestStoredMealDate();
      if (storedWeekStart) {
        console.log('📆 Using actual stored meal date as fallback for unsubscribed user:', storedWeekStart.toDateString());
        return storedWeekStart.toISOString().split('T')[0];
      }
    }

    // For preview mode, use stored meal dates if available, otherwise next Sunday
    if (hasPlannedMeals) {
      if (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
        const weeklyPlanStart = new Date(userMealPlans.mealPlans[0].planStartDate);
        console.log('📅 Using weekly plan start date as default start date:', weeklyPlanStart.toDateString());
        return weeklyPlanStart.toISOString().split('T')[0];
      }

      const storedWeekStart = getEarliestStoredMealDate();
      if (storedWeekStart) {
        console.log('📅 Using stored meal date as fallback start date:', storedWeekStart.toDateString());
        return storedWeekStart.toISOString().split('T')[0];
      } else {
        // Fallback to next Sunday calculation
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;

        const nextSunday = new Date(today);
        nextSunday.setDate(today.getDate() + daysUntilSunday);

        console.log('📅 No stored dates, using next Sunday as default start date:', nextSunday.toDateString());
        return nextSunday.toISOString().split('T')[0];
      }
    }

    // For no subscription and no planned meals, use today
    console.log('📆 Using today as default start date:', today.toDateString());
    return today.toISOString().split('T')[0];
  };

  // Consolidated data fetching effect - this fixes the timing issue
  useEffect(() => {
    if (isClient && isAuthenticated) {
      console.log('🔄 MealCalendar: Starting consolidated data fetch...');
      initializeCalendarData();
    }
  }, [isClient, isAuthenticated, searchParams]);

  // Additional effect to refresh preview data when meal plan context changes
  useEffect(() => {
    if (isClient && isAuthenticated && !loading && calendarMode === 'PREVIEW' && hasPlannedMeals && hasLoadedFromDatabase) {
      console.log('🔄 MealCalendar: Meal plan context fully loaded, refreshing preview data...');
      console.log('🔄 MealCalendar: isLoadingFromDatabase:', isLoadingFromDatabase);
      console.log('🔄 MealCalendar: hasLoadedFromDatabase:', hasLoadedFromDatabase);
      console.log('🔄 MealCalendar: Total items now:', getWeekTotalItems(0) + getWeekTotalItems(1));
      
      // Check if we have actual meal data
      const previewData = getPreviewCalendarData();
      console.log('🔄 MealCalendar: Preview data meals count:', previewData?.meals?.length || 0);
      
      if (previewData?.meals?.length > 0) {
        console.log('✅ MealCalendar: Preview data ready with meals, forcing re-render...');
        // Force a re-render by updating a state that triggers preview data regeneration
        setSelectedDate(prev => prev); // This triggers a re-render without changing the actual date
      } else {
        console.log('⏳ MealCalendar: Preview data not ready yet, will retry...');
        // Retry after a short delay
        setTimeout(() => {
          setSelectedDate(prev => prev);
        }, 100);
      }
    }
  }, [isClient, isAuthenticated, loading, calendarMode, hasPlannedMeals, hasLoadedFromDatabase, isLoadingFromDatabase, mealPlan]);

  // Note: URL parameter handling is now done in initializeCalendarData() to fix timing issues

  // Effect to refresh calendar data when date changes (for manual date selection)
  // Skip the first render to avoid duplicate fetch during initialization
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (isClient && isAuthenticated && selectedDate && calendarData) {
      console.log('🔄 MealCalendar: Date changed manually, refreshing calendar data...');
      fetchCalendarData().catch(err => {
        console.error('❌ MealCalendar: Error refreshing calendar data:', err);
      });
    }
  }, [selectedDate]);

  // Fetch calendar data from API
  const fetchCalendarData = async () => {
    try {
      console.log('📅 MealCalendarPage: Fetching calendar data...');
      
      const response = await mealCalendarApi.getMealCalendar();
      
      if (response?.success && response?.data?.meals) {
        console.log('✅ MealCalendarPage: Calendar data received:', response.data);
        setCalendarData(response.data);
        setIsSubscribed(true);
      } else {
        console.log('📅 No active subscription found, using preview mode');
        setCalendarData(null);
        setIsSubscribed(false);
      }
    } catch (error) {
      // Handle 404 gracefully - it's expected for non-subscribers
      if (error.response?.status === 404) {
        console.log('📅 No active subscription found (404), using preview mode');
      } else {
        console.error('❌ MealCalendarPage: Error fetching calendar data:', error);
      }
      setCalendarData(null);
      setIsSubscribed(false);
    }
  };

  const fetchUserMealPlans = async () => {
    try {
      console.log('🔍 MealCalendarPage: Fetching user meal plans...');
      
      const response = await subscriptionApi.getUserMealPlans();
      
      // subscriptionApi.getUserMealPlans() returns the JSON body, not an axios response.
      // Backend shape: { status: 'success', data: { mealPlans, count } }
      const normalized = response?.data ? response.data : response;
      
      console.log('✅ MealCalendarPage: User meal plans received:', normalized);
      setUserMealPlans(normalized);
      
      // Don't set isSubscribed here - let fetchCalendarData determine subscription status
      // This function only fetches meal plan data
      
      console.log('📊 MealCalendarPage: Meal plans found:', normalized?.mealPlans?.length || 0);
      if (normalized?.mealPlans?.length > 0) {
        console.log('📊 MealCalendarPage: First meal plan details:', {
          status: normalized.mealPlans[0].status,
          planStartDate: normalized.mealPlans[0].planStartDate,
          planEndDate: normalized.mealPlans[0].planEndDate,
          totalMealsCount: normalized.mealPlans[0].totalMealsCount
        });
      }
      
      return normalized; // Return data for consolidated function
      
    } catch (err) {
      console.error('❌ MealCalendarPage: Error fetching user meal plans:', err);
      setIsSubscribed(false);
      throw err; // Re-throw for consolidated error handling
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      console.log('🔍 MealCalendarPage: Checking subscription status...');
      
      const response = await mealCalendarApi.getSubscriptionStatus();
      
      console.log('✅ MealCalendarPage: Subscription status received:', response);
      setSubscriptionStatus(response.data);
      
      return response.data; // Return data for consolidated function
      
    } catch (err) {
      console.error('❌ MealCalendarPage: Error checking subscription status:', err);
      // Don't throw here as subscription status is optional
      return null;
    }
  };

  const handleSubscribe = () => {
    console.log('🔄 MealCalendarPage: Redirecting to subscription...');
    navigate('/subscription');
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
    console.log(`🔍 Checking if date is clickable: ${dateString}`);
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    console.log(`🔍 Date details: ${date.toDateString()}, isSubscribed: ${isSubscribed}, hasCalendarData: ${!!calendarData?.calendar?.subscriptionPeriod}`);

    if (isSubscribed && calendarData?.calendar?.subscriptionPeriod) {
      // Subscribed user: use calendar data subscription period (same as date calculation)
      const subscriptionPeriod = calendarData.calendar.subscriptionPeriod;
      const startDate = new Date(subscriptionPeriod.startDate);
      const endDate = new Date(subscriptionPeriod.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      console.log(`📆 Subscription date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
      console.log(`📆 Checking date: ${date.toDateString()}, Start: ${startDate.toDateString()}, End: ${endDate.toDateString()}`);
      console.log(`📆 Date comparison: ${date.getTime()} >= ${startDate.getTime()} && ${date.getTime()} <= ${endDate.getTime()}`);
      const isClickable = date >= startDate && date <= endDate;
      console.log(`📆 SUBSCRIPTION RESULT: ${dateString} is ${isClickable ? 'CLICKABLE' : 'NOT CLICKABLE'}`);
      return isClickable;
    } else if (isSubscribed && userMealPlans?.mealPlans?.length > 0) {
      // Fallback to user meal plans if calendar data not available
      const mealPlan = userMealPlans.mealPlans[0];
      if (mealPlan.planStartDate && mealPlan.planEndDate) {
        const startDate = new Date(mealPlan.planStartDate);
        const endDate = new Date(mealPlan.planEndDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        console.log(`📆 Fallback subscription date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
        const isClickable = date >= startDate && date <= endDate;
        console.log(`📆 FALLBACK SUBSCRIPTION RESULT: ${dateString} is ${isClickable ? 'CLICKABLE' : 'NOT CLICKABLE'}`);
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
    } else if (!isSubscribed && (planRange?.startDate || hasPlannedMeals || (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate))) {
      // Unsubscribed user: prefer DB planStartDate/planEndDate as authoritative window
      const plannedStartDate = planRange?.startDate
        ? new Date(planRange.startDate)
        : (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate
            ? new Date(userMealPlans.mealPlans[0].planStartDate)
            : null);
      const plannedEndDate = planRange?.endDate
        ? new Date(planRange.endDate)
        : (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planEndDate
            ? new Date(userMealPlans.mealPlans[0].planEndDate)
            : null);
      const storedWeekStart = getEarliestStoredMealDate();

      const startDate = plannedStartDate || storedWeekStart;
      if (startDate) {
        const endDate = plannedEndDate ? new Date(plannedEndDate) : new Date(startDate);
        if (!plannedEndDate) {
          endDate.setDate(endDate.getDate() + (week2Clickable ? 13 : 6)); // 7 or 14 days total
        }
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        console.log(`📆 Planned date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
        const isClickable = date >= startDate && date <= endDate;
        console.log(`📆 PLANNED MEAL RESULT: ${dateString} is ${isClickable ? 'CLICKABLE' : 'NOT CLICKABLE'}`);
        return isClickable;
      }
    } else if (!isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
      // Fallback: Unsubscribed user with plan dates but no stored meals
      const mealPlan = userMealPlans.mealPlans[0];
      if (mealPlan.planStartDate && mealPlan.planEndDate) {
        const startDate = new Date(mealPlan.planStartDate);
        const endDate = new Date(mealPlan.planEndDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        console.log(`📆 Weekly plan fallback date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
        const isClickable = date >= startDate && date <= endDate;
        console.log(`📆 WEEKLY PLAN FALLBACK RESULT: ${dateString} is ${isClickable ? 'CLICKABLE' : 'NOT CLICKABLE'}`);
        return isClickable;
      } else {
        // Fallback to 2-week range from plan start
        const startDate = new Date(mealPlan.planStartDate);
        startDate.setHours(0, 0, 0, 0);
        const twoWeeksLater = new Date(startDate);
        twoWeeksLater.setDate(startDate.getDate() + (week2Clickable ? 13 : 6));
        
        console.log(`📆 Weekly plan double fallback range: ${startDate.toDateString()} to ${twoWeeksLater.toDateString()}`);
        const isClickable = date >= startDate && date <= twoWeeksLater;
        console.log(`📆 WEEKLY PLAN DOUBLE FALLBACK RESULT: ${dateString} is ${isClickable ? 'CLICKABLE' : 'NOT CLICKABLE'}`);
        return isClickable;
      }
    } else {
      // Unsubscribed user without plans: next Sunday + 14 days (2 weeks)
      const nextSunday = getNextSunday();
      nextSunday.setHours(0, 0, 0, 0);
      
      const twoWeeksLater = new Date(nextSunday);
      twoWeeksLater.setDate(nextSunday.getDate() + 13); // 14 days total (Sunday to Saturday of 2nd week)
      
      const isClickable = date >= nextSunday && date <= twoWeeksLater;
      
      console.log(`📅 Default date range: ${nextSunday.toDateString()} to ${twoWeeksLater.toDateString()}`);
      console.log(`📆 DEFAULT RESULT: ${dateString} is ${isClickable ? 'CLICKABLE' : 'NOT CLICKABLE'}`);
      
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
    
    // Scroll to the selected date column in the calendar (desktop) or card (mobile)
    setTimeout(() => {
      // Check if we're on mobile (mobile cards are visible)
      const mobileCard = document.querySelector(`div[data-mobile-date="${dateString}"]`);
      const desktopElement = document.querySelector(`th[data-date="${dateString}"]`);
      
      if (mobileCard && window.innerWidth < 768) {
        // Mobile scroll
        mobileCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        console.log('📍 Mobile: Scrolled to selected date card:', dateString);
      } else if (desktopElement && window.innerWidth >= 768) {
        // Desktop scroll
        desktopElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
        console.log('📍 Desktop: Scrolled to selected date:', dateString);
      } else {
        console.log('⚠️ Could not find date element to scroll to:', dateString, 'Mobile card:', !!mobileCard, 'Desktop element:', !!desktopElement, 'Window width:', window.innerWidth);
      }
    }, 200); // Increased delay to ensure DOM is updated
  };

  const getWeekDates = (startDate) => {
    if (!isClient) return [];
    
    console.log('🔍 getWeekDates called with:', {
      startDate,
      isSubscribed,
      hasCalendarData: !!calendarData,
      subscriptionPeriod: calendarData?.calendar?.subscriptionPeriod,
      userMealPlans: userMealPlans?.mealPlans?.length || 0,
      planStartDate: userMealPlans?.mealPlans?.[0]?.planStartDate
    });
    
    const dates = [];
    
    // For subscribed users, show the full subscription period (not just 7 days)
    if (isSubscribed && calendarData?.calendar?.subscriptionPeriod) {
      console.log('🎯 Taking SUBSCRIPTION path');
      const subscriptionStart = new Date(calendarData.calendar.subscriptionPeriod.startDate);
      const subscriptionEnd = new Date(calendarData.calendar.subscriptionPeriod.endDate);
      
      console.log(`📅 Subscription mode: Generating dates from ${subscriptionStart.toDateString()} to ${subscriptionEnd.toDateString()}`);
      
      // Generate all dates in the subscription period
      const currentDate = new Date(subscriptionStart);
      while (currentDate <= subscriptionEnd) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`📅 Generated subscription dates (${dates.length} days):`, dates);
      return dates;
    }
    
    // For weekly planned users, use their actual meal dates (not plan period)
    if (!isSubscribed && (planRange?.startDate || hasPlannedMeals || userMealPlans?.mealPlans?.length > 0)) {
      console.log('🎯 Taking WEEKLY PLAN (STORED MEALS) path');
      const plannedStartDate = planRange?.startDate
        ? new Date(planRange.startDate)
        : (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate
            ? new Date(userMealPlans.mealPlans[0].planStartDate)
            : null);
      const plannedEndDate = planRange?.endDate
        ? new Date(planRange.endDate)
        : (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planEndDate
            ? new Date(userMealPlans.mealPlans[0].planEndDate)
            : null);
      const storedWeekStart = getEarliestStoredMealDate();
      const startDate = plannedStartDate || storedWeekStart;
      if (startDate) {
        const msPerDay = 24 * 60 * 60 * 1000;
        const dayCount = plannedEndDate && shouldShowWeek2
          ? (Math.floor((new Date(plannedEndDate).setHours(0, 0, 0, 0) - new Date(startDate).setHours(0, 0, 0, 0)) / msPerDay) + 1)
          : (shouldShowWeek2 ? 14 : 7);

        console.log(`📅 Weekly plan mode: Generating ${dayCount} days from start date ${new Date(startDate).toDateString()}`);
        
        for (let i = 0; i < dayCount; i++) {
          const date = new Date(startDate);
          date.setDate(new Date(startDate).getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        
        console.log(`📅 Generated weekly plan dates from stored meals (${dates.length} days):`, dates);
        return dates;
      }
    }
    
    // Fallback for unsubscribed users with plan dates but no stored meals
    if (!isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
      console.log('🎯 Taking WEEKLY PLAN FALLBACK path');
      const mealPlan = userMealPlans.mealPlans[0];
      if (mealPlan.planEndDate) {
        const planStart = new Date(mealPlan.planStartDate);
        const planEnd = new Date(mealPlan.planEndDate);
        
        console.log(`📅 Weekly plan fallback: Generating dates from ${planStart.toDateString()} to ${planEnd.toDateString()}`);
        
        // Generate all dates in the plan period
        const currentDate = new Date(planStart);
        while (currentDate <= planEnd) {
          dates.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`📅 Generated weekly plan fallback dates (${dates.length} days):`, dates);
        return dates;
      } else {
        // Fallback to 14 days from plan start
        const planStart = new Date(mealPlan.planStartDate);
        console.log(`📅 Weekly plan double fallback: Generating 14 days from ${planStart.toDateString()}`);
        
        for (let i = 0; i < 14; i++) {
          const date = new Date(planStart);
          date.setDate(planStart.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        
        console.log(`📅 Generated weekly plan double fallback dates:`, dates);
        return dates;
      }
    }
    
    // Fallback: Generate 7-day week for other cases
    console.log('🎯 Taking FALLBACK 7-DAY path');
    let weekStartDate;
    
    if (currentWeekStart) {
      weekStartDate = new Date(currentWeekStart);
      console.log(`📅 Using current week start: ${weekStartDate.toDateString()}`);
    } else if (calendarMode === 'PREVIEW' && hasPlannedMeals) {
      const storedWeekStart = getEarliestStoredMealDate();
      if (storedWeekStart) {
        weekStartDate = storedWeekStart;
        console.log(`📅 Preview mode: Using stored meal date week start (${weekStartDate.toDateString()})`);
      } else {
        weekStartDate = getNextSunday();
        console.log(`📅 Preview mode: No stored dates, using next Sunday (${weekStartDate.toDateString()})`);
      }
    } else {
      // For regular calendar, use the provided startDate and go to Sunday
      const start = new Date(startDate);
      const dayOfWeek = start.getDay();
      weekStartDate = new Date(start);
      weekStartDate.setDate(start.getDate() - dayOfWeek); // Go to Sunday of that week
      console.log(`📅 Regular mode: Using Sunday of week (${weekStartDate.toDateString()})`);
    }
    
    // Generate 7 days starting from the determined start date
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    console.log(`📅 Generated fallback week dates:`, dates);
    return dates;
  };

  // Generate preview meals from planned meal data using stored dates
  const generatePreviewMeals = () => {
    if (!isClient || !hasPlannedMeals) {
      console.log('🚫 generatePreviewMeals: Not generating - isClient:', isClient, 'hasPlannedMeals:', hasPlannedMeals);
      return [];
    }
    
    // Wait for database sync to complete
    if (!hasLoadedFromDatabase) {
      console.log('🚫 generatePreviewMeals: Waiting for database sync to complete...');
      return [];
    }
    
    console.log('🔄 generatePreviewMeals: Starting generation...');
    console.log('🔄 generatePreviewMeals: Week 0 total items:', getWeekTotalItems(0));
    console.log('🔄 generatePreviewMeals: Week 1 total items:', getWeekTotalItems(1));
    
    const previewMeals = [];
    
    // Generate meals for both weeks using stored dates
    const weekCount = shouldShowWeek2 ? 2 : 1;
    const planStartDate = userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate
      ? new Date(userMealPlans.mealPlans[0].planStartDate)
      : null;

    for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
      const weekPlan = getWeekPlan(weekIndex);
      console.log(`🔄 generatePreviewMeals: Week ${weekIndex} plan:`, weekPlan);
      if (!weekPlan) continue;
      
      // Generate meals for each day of the week
      Object.entries(weekPlan).forEach(([day, dayMeals]) => {
        // Skip days without meals
        const hasLunchMeals = dayMeals && dayMeals.lunch && dayMeals.lunch.length > 0;
        const hasDinnerMeals = dayMeals && dayMeals.dinner && dayMeals.dinner.length > 0;
        
        console.log(`🔄 generatePreviewMeals: ${day} (week ${weekIndex}) - Lunch: ${hasLunchMeals ? dayMeals.lunch.length : 0}, Dinner: ${hasDinnerMeals ? dayMeals.dinner.length : 0}`);
        
        if (!hasLunchMeals && !hasDinnerMeals) {
          return; // Skip empty days
        }
        
        // Prefer DB planStartDate when available to avoid shifted stored dates
        let mealDate;
        if (planStartDate) {
          const baseWeekStart = new Date(planStartDate);
          baseWeekStart.setHours(0, 0, 0, 0);

          const weekStartDate = new Date(baseWeekStart);
          weekStartDate.setDate(baseWeekStart.getDate() + (weekIndex * 7));

          const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
          mealDate = new Date(weekStartDate);
          mealDate.setDate(weekStartDate.getDate() + dayIndex);
          console.log(`📅 Using planStartDate-derived date for ${day} (week ${weekIndex}):`, mealDate.toDateString());
        } else if (dayMeals && dayMeals.date) {
          // Use the stored date from backend
          mealDate = new Date(dayMeals.date + 'T00:00:00.000Z'); // Ensure UTC
          console.log(`📅 Using stored date for ${day} (week ${weekIndex}):`, dayMeals.date, '→', mealDate.toDateString());
        } else {
          // Derive from DB planStartDate when possible (avoid hard-coded nextSunday)
          console.log(`⚠️ No stored date for ${day} (week ${weekIndex}), deriving from planStartDate`);

          const planStartDate = userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate
            ? new Date(userMealPlans.mealPlans[0].planStartDate)
            : null;
          const storedWeekStart = getEarliestStoredMealDate();

          const baseWeekStart = planStartDate || storedWeekStart || getNextSunday();
          baseWeekStart.setHours(0, 0, 0, 0);

          // Calculate the week start for this week index
          const weekStartDate = new Date(baseWeekStart);
          weekStartDate.setDate(baseWeekStart.getDate() + (weekIndex * 7));

          // Calculate the specific day within the week
          const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
          mealDate = new Date(weekStartDate);
          mealDate.setDate(weekStartDate.getDate() + dayIndex);

          console.log(`📅 Calculated date for ${day} (week ${weekIndex}) from base start ${baseWeekStart.toDateString()}:`, mealDate.toDateString());
        }
        
        // Generate lunch and dinner meals
        ['lunch', 'dinner'].forEach(mealType => {
          if (dayMeals[mealType] && dayMeals[mealType].length > 0) {
            // Group meals by name to calculate quantities
            const mealGroups = {};
            
            dayMeals[mealType].forEach((meal) => {
              const mealName = meal.name || meal.itemName || 'Planned Meal';
              const restaurant = meal.restaurant || meal.restaurantName || 'Restaurant';
              const mealKey = `${mealName}-${restaurant}`;
              
              if (!mealGroups[mealKey]) {
                mealGroups[mealKey] = {
                  meal: meal,
                  quantity: 0
                };
              }
              mealGroups[mealKey].quantity++;
            });
            
            // Create preview meals with quantities
            Object.values(mealGroups).forEach((group, index) => {
              const meal = group.meal;
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
                quantity: group.quantity,
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
    const totalMeals = getWeekTotalItems(0) + (shouldShowWeek2 ? getWeekTotalItems(1) : 0);
    const totalCost = getWeekTotalCost(0) + (shouldShowWeek2 ? getWeekTotalCost(1) : 0);
    
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
          lunch: previewMeals.filter(m => m.mealType === 'lunch').reduce((total, meal) => total + (meal.quantity || 1), 0),
          dinner: previewMeals.filter(m => m.mealType === 'dinner').reduce((total, meal) => total + (meal.quantity || 1), 0)
        },
        byStatus: {
          planned: previewMeals.reduce((total, meal) => total + (meal.quantity || 1), 0)
        }
      }
    };
  };

  // Use either subscription data or preview data
  const previewData = useMemo(
    () => getPreviewCalendarData(),
    [hasPlannedMeals, includeWeek2, hasWeek2PlannedMeals, hasLoadedFromDatabase, mealPlan]
  );
  const displayData = calendarData || previewData;

  const mealsIndex = useMemo(() => {
    const meals = displayData?.meals || [];
    const index = {};

    for (const meal of meals) {
      const dateKey = new Date(meal.date).toISOString().split('T')[0];
      const typeKey = meal.mealType;

      if (!index[dateKey]) {
        index[dateKey] = { lunch: [], dinner: [] };
      }

      if (typeKey === 'lunch' || typeKey === 'dinner') {
        index[dateKey][typeKey].push(meal);
      }
    }

    return index;
  }, [displayData]);

  // SSR safety - don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Loading state - also wait for meal plan data and preview data to be ready
  if (loading || isMealPlanLoading || isMealDatesLoading) {
    let loadingText = "Loading your meal calendar...";
    if (isMealDatesLoading) {
      loadingText = "Loading meal dates...";
    } else if (isMealPlanLoading) {
      loadingText = "Loading meal plan data...";
    }
    
    console.log('🔄 MealCalendar: Showing loading state -', loadingText);
    console.log('🔄 MealCalendar: loading:', loading, 'isMealPlanLoading:', isMealPlanLoading, 'isMealDatesLoading:', isMealDatesLoading);
    console.log('🔄 MealCalendar: isLoadingFromDatabase:', isLoadingFromDatabase, 'hasLoadedFromDatabase:', hasLoadedFromDatabase);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section Skeleton */}
        <section className="relative bg-gradient-to-r from-grub-red to-red-600 text-white py-12 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
            <div className="h-12 sm:h-14 md:h-16 bg-white/20 rounded-lg mx-auto mb-3 sm:mb-4 max-w-md animate-pulse"></div>
            <div className="h-6 sm:h-8 bg-white/10 rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </section>

        {/* Main Content Skeleton */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 -mt-8 sm:-mt-12 relative z-20">
          {/* Controls Skeleton */}
          <div className="mb-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-pulse">
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>
          </div>

          {/* Calendar Skeleton */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-grub-red/10 to-red-100/10 p-4 border-b border-gray-200">
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Calendar Body */}
            <div className="p-4 space-y-4">
              {/* Lunch Row */}
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
              
              {/* Dinner Row */}
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex flex-col items-center justify-center py-12 mt-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-grub-red rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-red-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium text-lg animate-pulse">{loadingText}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - only show if no calendar data AND no planned meals
  if (error && !calendarData && !hasPlannedMeals) {
    return (
      // ...
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
  
  // Debug logging for displayData
  console.log('🔍 MealCalendar displayData calculation:');
  console.log('🔍 calendarData:', calendarData);
  console.log('🔍 hasPlannedMeals:', hasPlannedMeals);
  console.log('🔍 hasLoadedFromDatabase:', hasLoadedFromDatabase);
  console.log('🔍 displayData:', displayData);
  console.log('🔍 displayData?.meals length:', displayData?.meals?.length || 0);
  
  // Additional check for preview mode - ensure we have meals before rendering
  if (calendarMode === 'PREVIEW' && hasPlannedMeals && hasLoadedFromDatabase && (!displayData?.meals || displayData.meals.length === 0)) {
    console.log('⚠️ MealCalendar: Preview mode but no meals in displayData, showing loading...');
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Loading text="Loading meal plan data..." />
        </div>
      </div>
    );
  }

  // For subscribed users, calculate week dates based on subscription start date
  const getWeekStartDate = () => {
    // Check if we have a URL startDate parameter first
    const urlStartDate = searchParams.get('startDate');
    if (urlStartDate && /^\d{4}-\d{2}-\d{2}$/.test(urlStartDate)) {
      console.log(`📅 Using URL startDate for week calculation: ${urlStartDate}`);
      return urlStartDate;
    }

    if (!isSubscribed && planRange?.startDate) {
      return planRange.startDate;
    }
    
    if (isSubscribed && calendarData?.calendar?.subscriptionPeriod?.startDate) {
      // Use subscription start date from calendar data (more accurate)
      const subscriptionStart = new Date(calendarData.calendar.subscriptionPeriod.startDate);
      console.log(`📅 Using subscription start date for week calculation: ${subscriptionStart.toDateString()}`);
      return subscriptionStart.toISOString().split('T')[0];
    } else if (isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
      // Fallback to user meal plans if calendar data not available
      const subscriptionStart = new Date(userMealPlans.mealPlans[0].planStartDate);
      console.log(`📅 Using fallback subscription start date for week calculation: ${subscriptionStart.toDateString()}`);
      return subscriptionStart.toISOString().split('T')[0];
    } else if (!isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate) {
      // For unsubscribed users with weekly plans, use their plan start date
      const weeklyPlanStart = new Date(userMealPlans.mealPlans[0].planStartDate);
      console.log(`📅 Using weekly plan start date for week calculation: ${weeklyPlanStart.toDateString()}`);
      return weeklyPlanStart.toISOString().split('T')[0];
    } else {
      // For users without any plans, use selected date
      console.log(`📅 Using selectedDate for week calculation: ${selectedDate}`);
      return selectedDate;
    }
  };

  // Generate dates - wait for calendar data to be loaded for subscribed users
  console.log('🔍 Main component state:', {
    isSubscribed,
    hasCalendarData: !!calendarData,
    hasSubscriptionPeriod: !!calendarData?.calendar?.subscriptionPeriod,
    selectedDate,
    urlStartDate: searchParams.get('startDate')
  });
  
  let weekDates = [];
  const hasWeeklyPlanDates = !isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate;
  if (isSubscribed && !calendarData?.calendar?.subscriptionPeriod) {
    console.log('⏳ Waiting for calendar data to load...');
    weekDates = [];
  } else if (!isSubscribed && !hasWeeklyPlanDates && hasPlannedMeals && !hasLoadedFromDatabase) {
    console.log('⏳ Waiting for weekly plan dates to load...');
    weekDates = [];
  } else if (selectedDate || searchParams.get('startDate')) {
    weekDates = getWeekDates(getWeekStartDate());
  }

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

  // Function to get meals by date and meal type
  const getMealsByDateAndType = (targetDate, mealType) => {
    if (!targetDate) return [];
    if (mealType !== 'lunch' && mealType !== 'dinner') return [];
    return mealsIndex[targetDate]?.[mealType] || [];
  };

  // Function to handle opening meal detail modal
  const handleMealDetailClick = (date, mealType) => {
    const meals = getMealsByDateAndType(date, mealType);
    setSelectedMealData({
      meals,
      date,
      mealType
    });
    setShowMealModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Hero Header */}
      <div className="bg-gradient-to-r from-grub-red to-red-600 text-white">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                  {calendarMode === 'PREVIEW' ? t('mealCalendar.mealPlanPreview') : t('mealCalendar.myMealCalendar')}
                </h1>
              </div>
              <p className="text-red-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                {calendarMode === 'PREVIEW' 
                  ? t('mealCalendar.previewSchedule')
                  : t('mealCalendar.trackMeals')
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-shrink-0">
              <button
                onClick={() => navigate('/weekly-menu')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t('mealCalendar.backToMenu')}</span>
              </button>
              
              {!subscriptionStatus?.hasActiveSubscription && (
                <button
                  onClick={handleSubscribe}
                  className="bg-white text-grub-red px-4 py-2.5 sm:py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  {t('mealCalendar.subscribeToPlan')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">

        {/* Enhanced Subscription Status / Preview Card */}
        {displayData?.calendar && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  calendarMode === 'PREVIEW' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {calendarMode === 'PREVIEW' ? (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {calendarMode === 'PREVIEW' ? t('mealCalendar.mealPlanPreview') : t('mealCalendar.activeSubscription')}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {t('mealCalendar.planType')}: {displayData.calendar.subscriptionPeriod?.planType || t('mealCalendar.biWeekly')}
                  </p>
                </div>
              </div>
              
              <div className="text-center sm:text-right flex-shrink-0">
                <div className={`text-2xl sm:text-3xl font-bold ${
                  calendarMode === 'PREVIEW' ? 'text-blue-600' : 'text-grub-red'
                }`}>
                  {calendarMode === 'PREVIEW' ? displayData.calendar.totalMeals : displayData.calendar.progressPercentage + '%'}
                </div>
                <p className="text-xs text-gray-500">
                  {calendarMode === 'PREVIEW' ? t('mealCalendar.totalMeals') : t('mealCalendar.complete')}
                </p>
              </div>
            </div>
            
            {/* Enhanced Subscription Period - Only show for active subscriptions */}
            {calendarMode === 'SUBSCRIPTION' && (
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1 font-medium">{t('mealCalendar.startDate')}</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">
                      {new Date(displayData.calendar.subscriptionPeriod.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1 font-medium">{t('mealCalendar.endDate')}</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">
                      {new Date(displayData.calendar.subscriptionPeriod.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1 font-medium">{t('mealCalendar.daysLeft')}</p>
                    <p className="font-bold text-grub-red text-sm sm:text-base">
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
                  {calendarMode === 'PREVIEW' ? t('mealCalendar.mealPlanning') : t('mealCalendar.mealProgress')}
                </span>
                <span className="text-sm text-gray-600">
                  {calendarMode === 'PREVIEW' 
                    ? `${displayData.calendar.totalMeals} ${t('mealCalendar.mealsPlanned')}`
                    : t('mealCalendar.deliveredOf', { delivered: displayData.calendar.deliveredMeals, total: displayData.calendar.totalMeals })
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
            </div>
          </div>
        )}

        {/* Enhanced Calendar Grid */}
        {displayData?.meals && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-grub-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{isSubscribed ? t('mealCalendar.subscriptionMealSchedule') : t('mealCalendar.weeklyMealSchedule')}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {isSubscribed && calendarData?.calendar?.subscriptionPeriod
                      ? `Your subscription period: ${new Date(calendarData.calendar.subscriptionPeriod.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${new Date(calendarData.calendar.subscriptionPeriod.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : isSubscribed 
                      ? 'Click on any date within your subscription period'
                      : (() => {
                          const planStart = planRange?.startDate
                            ? new Date(planRange.startDate)
                            : (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate
                                ? new Date(userMealPlans.mealPlans[0].planStartDate)
                                : getNextSunday());
                          const planEnd = planRange?.endDate
                            ? new Date(planRange.endDate)
                            : (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planEndDate
                                ? new Date(userMealPlans.mealPlans[0].planEndDate)
                                : (() => {
                                    const end = new Date(planStart);
                                    end.setDate(planStart.getDate() + (week2Clickable ? 13 : 6));
                                    return end;
                                  })());
                          return `Click on dates from ${planStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${planEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${week2Clickable ? '2 weeks' : '1 week'})`;
                        })()
                    }
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center space-x-1 sm:space-x-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{t('mealCalendar.jumpToDate')}:</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate || searchParams.get('startDate') || ''}
                    min={isSubscribed && calendarData?.calendar?.subscriptionPeriod ? 
                      new Date(calendarData.calendar.subscriptionPeriod.startDate).toISOString().split('T')[0] : 
                      isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate ? 
                      new Date(userMealPlans.mealPlans[0].planStartDate).toISOString().split('T')[0] : 
                      !isSubscribed && planRange?.startDate ?
                      planRange.startDate :
                      !isSubscribed && hasPlannedMeals && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate ?
                      new Date(userMealPlans.mealPlans[0].planStartDate).toISOString().split('T')[0] :
                      !isSubscribed && hasPlannedMeals && getEarliestStoredMealDate() ?
                      getEarliestStoredMealDate().toISOString().split('T')[0] :
                      !isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate ?
                      new Date(userMealPlans.mealPlans[0].planStartDate).toISOString().split('T')[0] :
                      getNextSunday().toISOString().split('T')[0]
                    }
                    max={isSubscribed && calendarData?.calendar?.subscriptionPeriod ? 
                      new Date(calendarData.calendar.subscriptionPeriod.endDate).toISOString().split('T')[0] : 
                      isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planEndDate ? 
                      new Date(userMealPlans.mealPlans[0].planEndDate).toISOString().split('T')[0] : 
                      !isSubscribed && planRange?.endDate ?
                      planRange.endDate :
                      !isSubscribed && hasPlannedMeals && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planEndDate ?
                      new Date(userMealPlans.mealPlans[0].planEndDate).toISOString().split('T')[0] :
                      !isSubscribed && hasPlannedMeals && (userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate ? true : getEarliestStoredMealDate()) ?
                      (() => {
                        const startDate = userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planStartDate
                          ? new Date(userMealPlans.mealPlans[0].planStartDate)
                          : getEarliestStoredMealDate();
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + (week2Clickable ? 13 : 6)); // 7 or 14 days total
                        return endDate.toISOString().split('T')[0];
                      })() :
                      !isSubscribed && userMealPlans?.mealPlans?.length > 0 && userMealPlans.mealPlans[0].planEndDate ?
                      new Date(userMealPlans.mealPlans[0].planEndDate).toISOString().split('T')[0] :
                      new Date(getNextSunday().getTime() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                    onChange={(e) => {
                      const newDate = e.target.value;
                      if (isDateClickable(newDate)) {
                        handleDateClick(newDate);
                      } else {
                        console.log('🚫 Date picker: Date not clickable:', newDate);
                        // Reset to current selected date if invalid
                        e.target.value = selectedDate;
                        alert(t('mealCalendar.dateNotAvailable'));
                      }
                    }}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors cursor-pointer bg-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Enhanced Calendar Table with Lunch/Dinner Rows - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto rounded-2xl shadow-lg bg-white">
              <table className="w-full bg-white rounded-2xl overflow-hidden" style={{ minWidth: `${Math.max(900, weekDates.length * 160)}px` }}>
                {/* Header Row with Days */}
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr className="border-b border-gray-100">
                    <th className="w-32 p-6 text-left font-bold text-gray-800 border-r border-gray-100 bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold">{t('mealCalendar.mealType')}</div>
                          <div className="text-xs text-gray-600">{t('mealCalendar.dailySchedule')}</div>
                        </div>
                      </div>
                    </th>
                    {weekDates.map((date) => {
                      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNumber = new Date(date).getDate();
                      const monthName = new Date(date).toLocaleDateString('en-US', { month: 'short' });
                      const isToday = date === new Date().toISOString().split('T')[0];
                      
                      const isClickable = isDateClickable(date);
                      const currentSelectedDate = selectedDate || searchParams.get('startDate');
                      const isSelected = date === currentSelectedDate;
                      
                      // Debug selected date logic
                      if (date === '2025-11-02' || date === '2025-11-04' || date === '2025-11-06') {
                        const appliedClasses = isSelected ? 'bg-grub-red/20 ring-2 ring-grub-red text-grub-red' : 
                                             isToday ? 'bg-grub-red/10 text-grub-red' : 'text-gray-900';
                        console.log(`🔍 Date ${date}: selectedDate=${selectedDate}, isSelected=${isSelected}, isToday=${isToday}, appliedClasses="${appliedClasses}"`);
                      }
                      
                      return (
                        <th 
                          key={date} 
                          data-date={date}
                          className={`relative p-4 text-center font-medium border-r border-gray-100 min-w-[140px] transition-all duration-300 group ${
                            isSelected ? 'bg-white text-grub-red' : 
                            isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                          } ${
                            isClickable ? 'cursor-pointer hover:bg-gray-50' : 
                            'cursor-not-allowed opacity-50'
                          }`}
                          onClick={() => {
                            console.log(`🖱️ Header clicked for date: ${date}`);
                            if (isClickable) {
                              handleDateClick(date);
                            } else {
                              console.log(`🚫 Header click blocked - date not clickable: ${date}`);
                            }
                          }}
                          title={isClickable ? `Click to select ${dayName}, ${monthName} ${dayNumber}` : `${dayName}, ${monthName} ${dayNumber} - Not available`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`text-xs font-medium uppercase tracking-wide ${isSelected ? 'text-grub-red' : isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                              {dayName}
                            </div>
                            <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                              isSelected ? 'bg-grub-red text-white shadow-lg' : 
                              isToday ? 'bg-blue-500 text-white shadow-md' : 
                              'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}>
                              {dayNumber}
                            </div>
                            <div className={`text-xs font-medium ${isSelected ? 'text-grub-red' : isToday ? 'text-blue-500' : 'text-gray-400'}`}>
                              {monthName}
                            </div>
                            {!isClickable && (
                              <div className="text-xs text-red-500 font-medium">
                                {t('mealCalendar.unavailable')}
                              </div>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                
                <tbody>
                  {/* Lunch Row */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 bg-gradient-to-br from-orange-50 to-yellow-50 border-r border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white text-lg">🍽️</span>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-800">{t('mealCalendar.lunch')}</div>
                          <div className="text-xs text-gray-500 font-medium">{t('mealCalendar.middayMeals')}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const lunchMeals = getMealsByDateAndType(date, 'lunch');
                      const mealCount = lunchMeals.length;
                      
                      return (
                        <td 
                          key={`${date}-lunch`} 
                          className="p-3 text-center border-r border-gray-100 min-h-[140px] align-top bg-gradient-to-b from-white to-gray-50"
                        >
                          {mealCount > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 space-y-2 hover:shadow-md transition-all duration-200 h-full">
                              <div className="flex items-center justify-center space-x-1">
                                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{mealCount}</span>
                                </div>
                                <div className="text-xs font-medium text-gray-600">
                                  {mealCount === 1 ? t('mealCalendar.item') : t('mealCalendar.items')}
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  onClick={() => handleMealDetailClick(date, 'lunch')}
                                  className="flex-1 px-2 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded-md font-medium transition-colors whitespace-nowrap"
                                >
                                  {t('mealCalendar.viewDetails')}
                                </button>
                                <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                ${lunchMeals.reduce((total, meal) => {
                                  // Debug: Log meal structure to understand what fields are available
                                  console.log('🔍 Lunch meal object:', meal);
                                  
                                  // Check multiple possible price locations
                                  let price = 0;
                                  
                                  // If meal has items array, sum up item prices
                                  if (meal.items && Array.isArray(meal.items) && meal.items.length > 0) {
                                    price = meal.items.reduce((itemTotal, item) => {
                                      return itemTotal + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
                                    }, 0);
                                  } else {
                                    // Try various price fields
                                    price = parseFloat(
                                      meal.subtotal || 
                                      meal.total || 
                                      meal.price || 
                                      meal.menuItem?.price || 
                                      meal.orderItem?.price || 
                                      meal.cost ||
                                      meal.amount ||
                                      0
                                    );
                                    
                                    // If no price found, use a reasonable estimate based on meal type
                                    if (price === 0 && meal.mealName) {
                                      // Simple price estimation based on meal name/type
                                      if (meal.mealName.toLowerCase().includes('chicken')) {
                                        price = 12.99;
                                      } else if (meal.mealName.toLowerCase().includes('mutton')) {
                                        price = 15.99;
                                      } else if (meal.mealType === 'lunch') {
                                        price = 10.99;
                                      } else {
                                        price = 12.99; // Default price
                                      }
                                      console.log(`💰 Using estimated lunch price for ${meal.mealName}: $${price}`);
                                    }
                                  }
                                  
                                  console.log('🔍 Calculated price for lunch meal:', price);
                                  const quantity = parseInt(meal.quantity) || 1;
                                  return total + (price * quantity);
                                }, 0).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 h-full flex items-center justify-center min-h-[80px]">
                              <div className="text-gray-500 text-xs font-medium">{t('mealCalendar.noMeals')}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Dinner Row */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 bg-gradient-to-br from-purple-50 to-indigo-50 border-r border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white text-lg">🌙</span>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-800">{t('mealCalendar.dinner')}</div>
                          <div className="text-xs text-gray-500 font-medium">{t('mealCalendar.eveningMeals')}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const dinnerMeals = getMealsByDateAndType(date, 'dinner');
                      const mealCount = dinnerMeals.length;
                      
                      return (
                        <td 
                          key={`${date}-dinner`} 
                          className="p-3 text-center border-r border-gray-100 min-h-[140px] align-top bg-gradient-to-b from-white to-gray-50"
                        >
                          {mealCount > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 space-y-2 hover:shadow-md transition-all duration-200 h-full">
                              <div className="flex items-center justify-center space-x-1">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{mealCount}</span>
                                </div>
                                <div className="text-xs font-medium text-gray-600">
                                  {mealCount === 1 ? t('mealCalendar.item') : t('mealCalendar.items')}
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  onClick={() => handleMealDetailClick(date, 'dinner')}
                                  className="flex-1 px-2 py-1 text-xs text-white bg-purple-500 hover:bg-purple-600 rounded-md font-medium transition-colors whitespace-nowrap"
                                >
                                  {t('mealCalendar.viewDetails')}
                                </button>
                                <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                ${dinnerMeals.reduce((total, meal) => {
                                  // Debug: Log meal structure to understand what fields are available
                                  console.log('🔍 Dinner meal object:', meal);
                                  
                                  // Check multiple possible price locations
                                  let price = 0;
                                  
                                  // If meal has items array, sum up item prices
                                  if (meal.items && Array.isArray(meal.items) && meal.items.length > 0) {
                                    price = meal.items.reduce((itemTotal, item) => {
                                      return itemTotal + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
                                    }, 0);
                                  } else {
                                    // Try various price fields
                                    price = parseFloat(
                                      meal.subtotal || 
                                      meal.total || 
                                      meal.price || 
                                      meal.menuItem?.price || 
                                      meal.orderItem?.price || 
                                      meal.cost ||
                                      meal.amount ||
                                      0
                                    );
                                    
                                    // If no price found, use a reasonable estimate based on meal type
                                    if (price === 0 && meal.mealName) {
                                      // Simple price estimation based on meal name/type
                                      if (meal.mealName.toLowerCase().includes('chicken')) {
                                        price = 14.99; // Dinner chicken slightly more expensive
                                      } else if (meal.mealName.toLowerCase().includes('mutton')) {
                                        price = 17.99; // Dinner mutton slightly more expensive
                                      } else if (meal.mealType === 'dinner') {
                                        price = 14.99;
                                      } else {
                                        price = 14.99; // Default dinner price
                                      }
                                      console.log(`💰 Using estimated dinner price for ${meal.mealName}: $${price}`);
                                    }
                                  }
                                  
                                  console.log('🔍 Calculated price for dinner meal:', price);
                                  const quantity = parseInt(meal.quantity) || 1;
                                  return total + (price * quantity);
                                }, 0).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 h-full flex items-center justify-center min-h-[80px]">
                              <div className="text-gray-500 text-xs font-medium">{t('mealCalendar.noMeals')}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Calendar Cards - Hidden on Desktop */}
            <div className="block md:hidden mt-6 space-y-4">
              {weekDates.map((date) => {
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                const dayNumber = new Date(date).getDate();
                const monthName = new Date(date).toLocaleDateString('en-US', { month: 'long' });
                const isToday = date === new Date().toISOString().split('T')[0];
                const isClickable = isDateClickable(date);
                const currentSelectedDate = selectedDate || searchParams.get('startDate');
                const isSelected = date === currentSelectedDate;
                
                const lunchMeals = getMealsByDateAndType(date, 'lunch');
                const dinnerMeals = getMealsByDateAndType(date, 'dinner');
                
                return (
                  <div 
                    key={`mobile-${date}`}
                    data-mobile-date={date}
                    className={`bg-white rounded-xl shadow-md border-2 transition-all duration-200 ${
                      isSelected ? 'border-grub-red bg-grub-red/5' : 
                      isToday ? 'border-blue-500 bg-blue-50' : 
                      'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Mobile Date Header */}
                    <div 
                      className={`p-4 border-b border-gray-100 cursor-pointer ${
                        isClickable ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-60'
                      }`}
                      onClick={() => {
                        if (isClickable) {
                          handleDateClick(date);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            isSelected ? 'bg-grub-red text-white' : 
                            isToday ? 'bg-blue-500 text-white' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {dayNumber}
                          </div>
                          <div>
                            <div className={`font-bold text-lg ${isSelected ? 'text-grub-red' : isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                              {dayName}
                            </div>
                            <div className={`text-sm ${isSelected ? 'text-grub-red/70' : isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                              {monthName} {dayNumber}
                            </div>
                          </div>
                        </div>
                        {!isClickable && (
                          <div className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full">
                            {t('mealCalendar.unavailable')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Meals Content */}
                    <div className="p-4 space-y-4">
                      {/* Lunch Section */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">🍽️</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{t('mealCalendar.lunch')}</div>
                            {lunchMeals.length > 0 ? (
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">{lunchMeals.length} {lunchMeals.length === 1 ? t('mealCalendar.item') : t('mealCalendar.items')}</span>
                                  <button
                                    onClick={() => handleMealDetailClick(date, 'lunch')}
                                    className="px-3 py-1.5 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded-md font-medium transition-colors"
                                  >
                                    {t('mealCalendar.viewDetails')}
                                  </button>
                                </div>
                                <div className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                ${lunchMeals.reduce((total, meal) => {
                                  let price = 0;
                                  if (meal.items && Array.isArray(meal.items) && meal.items.length > 0) {
                                    price = meal.items.reduce((itemTotal, item) => {
                                      return itemTotal + (parseFloat(item.subtotal) || parseFloat(item.price) || parseFloat(item.total) || 0);
                                    }, 0);
                                  } else {
                                    price = parseFloat(meal.subtotal) || parseFloat(meal.price) || parseFloat(meal.total) || 0;
                                  }
                                  if (price === 0 && meal.mealName) {
                                    if (meal.mealName.toLowerCase().includes('chicken')) {
                                      price = 12.99;
                                    } else if (meal.mealName.toLowerCase().includes('mutton')) {
                                      price = 15.99;
                                    } else {
                                      price = 10.99;
                                    }
                                  }
                                  const quantity = parseInt(meal.quantity) || 1;
                                  return total + (price * quantity);
                                }, 0).toFixed(2)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">{t('mealCalendar.noMeals')}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dinner Section */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">🌙</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{t('mealCalendar.dinner')}</div>
                            {dinnerMeals.length > 0 ? (
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">{dinnerMeals.length} {dinnerMeals.length === 1 ? t('mealCalendar.item') : t('mealCalendar.items')}</span>
                                  <button
                                    onClick={() => handleMealDetailClick(date, 'dinner')}
                                    className="px-3 py-1.5 text-xs text-white bg-purple-500 hover:bg-purple-600 rounded-md font-medium transition-colors"
                                  >
                                    {t('mealCalendar.viewDetails')}
                                  </button>
                                </div>
                                <div className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                ${dinnerMeals.reduce((total, meal) => {
                                  let price = 0;
                                  if (meal.items && Array.isArray(meal.items) && meal.items.length > 0) {
                                    price = meal.items.reduce((itemTotal, item) => {
                                      return itemTotal + (parseFloat(item.subtotal) || parseFloat(item.price) || parseFloat(item.total) || 0);
                                    }, 0);
                                  } else {
                                    price = parseFloat(meal.subtotal) || parseFloat(meal.price) || parseFloat(meal.total) || 0;
                                  }
                                  if (price === 0 && meal.mealName) {
                                    if (meal.mealName.toLowerCase().includes('chicken')) {
                                      price = meal.mealType === 'dinner' ? 14.99 : 12.99;
                                    } else if (meal.mealName.toLowerCase().includes('mutton')) {
                                      price = meal.mealType === 'dinner' ? 17.99 : 15.99;
                                    } else {
                                      price = meal.mealType === 'dinner' ? 14.99 : 12.99;
                                    }
                                  }
                                  const quantity = parseInt(meal.quantity) || 1;
                                  return total + (price * quantity);
                                }, 0).toFixed(2)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">{t('mealCalendar.noMeals')}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Summary Stats */}
        {displayData?.summary && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Meal Types Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('mealCalendar.mealBreakdown')}</h3>
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
                        <span className="capitalize font-medium text-gray-700">{type === 'lunch' ? t('mealCalendar.lunch') : type === 'dinner' ? t('mealCalendar.dinner') : type}</span>
                      </div>
                      <span className="text-xl font-bold text-grub-red">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Status Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('mealCalendar.deliveryStatus')}</h3>
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
                        <span className={`capitalize font-medium ${config.color}`}>{t(`mealCalendar.${status}`)}</span>
                      </div>
                      <span className={`text-xl font-bold ${config.color}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('mealCalendar.quickActions')}</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/weekly-menu')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-grub-red/5 hover:bg-grub-red/10 rounded-lg transition-all duration-200 group touch-manipulation"
                >
                  <svg className="w-4 h-4 text-grub-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-grub-red group-hover:text-red-700">{t('mealCalendar.planNewMeals')}</span>
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered');
                    initializeCalendarData();
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group touch-manipulation"
                >
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">{t('mealCalendar.refreshCalendar')}</span>
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group touch-manipulation"
                >
                  <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-700">{t('mealCalendar.accountSettings')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscribe to Plan Button - Only for unsubscribed users */}
        {!isSubscribed && (
          <div className="mt-8 px-2 sm:px-0 max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/subscription')}
              className="group w-full text-left p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-grub-red to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-2 border-red-500 relative overflow-hidden touch-manipulation"
            >
              {/* Highlight badge */}
              <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                {t('mealCalendar.startNow')}
              </div>
              
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="font-bold text-white flex items-center text-lg mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  {t('mealCalendar.subscribeNow')}
                </div>
                <div className="text-red-100 ml-11">{t('mealCalendar.readyToStart')}</div>
              </div>
            </button>
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
                    <span className="sr-only">{t('mealCalendar.dismiss')}</span>
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

      {/* Meal Detail Modal */}
      <MealDetailModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        meals={selectedMealData.meals}
        date={selectedMealData.date}
        mealType={selectedMealData.mealType}
        userType={isSubscribed ? 'subscribed' : 'planned'}
      />
    </div>
  );
};

export default MealCalendarPage;
