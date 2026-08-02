import api from './api';

export async function getCurrentMealPlan() {
  try {
    const response = await api.get('/meal-plans/me', {
      params: { _ts: Date.now() },
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
      },
    });

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: getApiError(error, 'Unable to load meal plan.'),
    };
  }
}

export async function saveCurrentMealPlan(payload: Record<string, unknown>) {
  try {
    const response = await api.post('/meal-plans', payload);

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: getApiError(error, 'Unable to save meal plan.'),
    };
  }
}

export async function removeSelectedRestaurantFromMealPlan(restaurantId: string) {
  try {
    const response = await api.delete(`/meal-plans/selected-restaurants/${restaurantId}`);

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: getApiError(error, 'Unable to remove selected restaurant.'),
    };
  }
}

export async function clearRestaurantItemsFromMealPlan(userId: string, restaurantId: string) {
  try {
    const response = await api.delete(`/meal-plans/${userId}/clear-restaurant/${restaurantId}`);

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: getApiError(error, 'Unable to clear meals from this restaurant.'),
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
