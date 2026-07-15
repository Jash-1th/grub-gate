import api from './api';

export type SubscriptionStatus = {
  hasActiveSubscription: boolean;
  hasOverlap?: boolean;
  activeSubscription?: {
    _id?: string;
    subscriptionPeriod?: {
      startDate?: string;
      endDate?: string;
      planType?: string;
    };
    progressPercentage?: number;
    remainingDays?: number;
  } | null;
};

export type SubscriptionCalendarMeal = {
  _id?: string;
  id?: string;
  date?: string;
  mealType?: string;
  mealName?: string;
  restaurant?: string;
  restaurantName?: string | null;
  status?: string;
  quantity?: number;
  price?: number;
};

export type SubscriptionCalendarData = {
  calendar?: {
    _id?: string;
    subscriptionPeriod?: {
      startDate?: string;
      endDate?: string;
      planType?: string;
    };
    totalMeals?: number;
    deliveredMeals?: number;
    progressPercentage?: number;
    remainingDays?: number;
  };
  meals: SubscriptionCalendarMeal[];
  summary?: {
    totalMeals?: number;
    byStatus?: Record<string, number>;
    byMealType?: Record<string, number>;
  };
};

export async function getSubscriptionStatus(params: Record<string, unknown> = {}) {
  try {
    const response = await api.get('/meal-calendar/subscription-status', { params });
    return {
      success: true,
      data: (response.data?.data || response.data) as SubscriptionStatus,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: getApiError(error, 'Unable to check subscription status.'),
    };
  }
}

export async function getMealCalendar(params: Record<string, unknown> = {}) {
  try {
    const response = await api.get('/meal-calendar', { params });
    return {
      success: true,
      data: (response.data?.data || response.data) as SubscriptionCalendarData,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: getApiError(error, 'Unable to load meal calendar.'),
    };
  }
}

function getApiError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; errors?: { message?: string }[] } } }).response;
    return response?.data?.message || response?.data?.errors?.[0]?.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
