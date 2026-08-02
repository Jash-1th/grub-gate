import api from './api';
import { getAuthToken } from './secureAuthStorage';

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
    const token = await getAuthToken();
    const response = await api.get('/meal-calendar/subscription-status', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
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
    const token = await getAuthToken();
    const response = await api.get('/meal-calendar', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
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

export function hasSubscriptionCoverageForNextTwoWeeks(status?: SubscriptionStatus | null) {
  if (!status?.hasActiveSubscription) return false;

  const remainingDays = status.activeSubscription?.remainingDays;
  if (typeof remainingDays === 'number') {
    return remainingDays >= 14;
  }

  const endDate = status.activeSubscription?.subscriptionPeriod?.endDate;
  const normalizedEndDate = parseValidDate(endDate);
  if (!normalizedEndDate) return false;

  const coverageThreshold = new Date();
  coverageThreshold.setHours(0, 0, 0, 0);
  coverageThreshold.setDate(coverageThreshold.getDate() + 13);

  return normalizedEndDate >= coverageThreshold;
}

function getApiError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; errors?: { message?: string }[] } } }).response;
    return response?.data?.message || response?.data?.errors?.[0]?.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

function parseValidDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
