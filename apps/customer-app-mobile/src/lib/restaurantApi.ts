import api from './api';

export type Restaurant = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  cuisine?: string[] | string;
  cuisines?: string[];
  preferences?: string[];
  distance?: string;
  rating?: number;
  reviewCount?: number;
  deliveryFee?: number;
  avgDeliveryTime?: number;
  image?: string;
  logo?: string;
  images?: string[];
  imageUrl?: string;
  deliveryTime?: string;
  isPopular?: boolean;
  isTopRated?: boolean;
  address?: {
    city?: string;
    state?: string;
    province?: string;
    country?: string;
  };
};

export type MenuItem = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  imageUrl?: string;
  category?: string;
  cuisine?: string;
  rating?: number;
  reviewCount?: number;
  totalOrders?: number;
  servings?: number;
  spiceLevel?: number;
  dietaryTags?: string[];
  dietary?: string[];
  dietaryPreferences?: string[];
  preferences?: string[];
  nutritionInfo?: {
    calories?: number | string;
    protein?: number | string;
    carbs?: number | string;
    fat?: number | string;
  };
  nutritionalInfo?: {
    calories?: number | string;
    protein?: number | string;
    carbs?: number | string;
    fat?: number | string;
  };
  ingredients?: string[];
  allergens?: string[];
  status?: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  availability?: Record<string, { lunch?: boolean; dinner?: boolean }>;
};

export type RestaurantSearchResult = {
  success: boolean;
  data: Restaurant[];
  totalItems?: number;
  message?: string;
  error?: string;
};

export async function getRestaurantsByPostalCode(postalCode: string, options: { page?: number; limit?: number } = {}) {
  try {
    const response = await api.get('/restaurants/by-postal-code', {
      params: {
        postalCode: postalCode.toUpperCase(),
        page: options.page || 1,
        limit: options.limit || 20,
      },
    });

    const data = response.data?.data;
    const restaurants = Array.isArray(data) ? data : data?.restaurants || [];

    return {
      success: true,
      data: restaurants,
      totalItems: response.data?.pagination?.totalItems || data?.total || restaurants.length,
      message: response.data?.message,
    } satisfies RestaurantSearchResult;
  } catch (error) {
    return {
      success: false,
      data: [],
      error: getApiError(error),
    } satisfies RestaurantSearchResult;
  }
}

export async function getRestaurant(restaurantId: string) {
  try {
    const response = await api.get(`/restaurants/${restaurantId}`);
    const data = response.data?.data;

    return {
      success: true,
      data: (data?.restaurant || data) as Restaurant,
      message: response.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: getApiError(error),
    };
  }
}

export async function getRestaurantMenu(restaurantId: string, filters: Record<string, string> = {}) {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/menu`, {
      params: filters,
    });
    const data = response.data?.data;
    const menuItems = data?.menuItems || data?.items || data || [];

    return {
      success: true,
      data: {
        menuItems: Array.isArray(menuItems) ? (menuItems as MenuItem[]) : [],
      },
      message: response.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      data: { menuItems: [] as MenuItem[] },
      error: getApiError(error),
    };
  }
}

function getApiError(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; errors?: { message?: string }[] } } }).response;
    return response?.data?.message || response?.data?.errors?.[0]?.message || 'Failed to fetch restaurants';
  }

  if (error instanceof Error) return error.message;
  return 'Failed to fetch restaurants';
}
