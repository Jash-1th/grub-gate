import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { getCurrentMealPlan, saveCurrentMealPlan } from '../lib/mealPlanApi';
import type { MenuItem, Restaurant } from '../lib/restaurantApi';

const STORAGE_KEY = 'grubgate.customer.mobileMealPlan';

export const daysOfWeek = [
  { id: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { id: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { id: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { id: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { id: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
] as const;

export const mealTypes = [
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
] as const;

export type DayId = (typeof daysOfWeek)[number]['id'];
export type MealType = (typeof mealTypes)[number]['id'];

export type PlannedMealItem = MenuItem & {
  planId: string;
  restaurantId: string;
  restaurantName: string;
  day: DayId;
  mealType: MealType;
};

type WeekPlan = Record<DayId, Record<MealType, PlannedMealItem[]>>;

type MealPlanState = {
  selectedRestaurantId: string | null;
  selectedRestaurantName: string | null;
  selectedRestaurantData: Restaurant | null;
  selectedRestaurants: SelectedRestaurant[];
  maxRestaurants: number | null;
  weeklyPlans: { week0: WeekPlan; week1: WeekPlan };
};

type MealPlanContextValue = MealPlanState & {
  hasHydrated: boolean;
  isSyncing: boolean;
  setSelectedRestaurant: (restaurantId: string, restaurantName: string, restaurantData?: Restaurant | null) => void;
  addSelectedRestaurant: (restaurantId: string, restaurantName: string, restaurantData?: Restaurant | null) => boolean;
  canAddRestaurant: () => boolean;
  isRestaurantSelected: (restaurantId: string) => boolean;
  getSelectedRestaurantCount: () => number;
  getSelectedRestaurants: () => SelectedRestaurant[];
  removeSelectedRestaurant: (restaurantId: string) => void;
  clearItemsByRestaurant: (restaurantId: string, weekIndex?: number) => number;
  getItemCountForRestaurant: (restaurantId: string, weekIndex?: number) => number;
  addItemToPlan: (item: MenuItem, day: DayId, mealType: MealType, weekIndex?: number) => void;
  removeItemFromPlan: (planId: string, day: DayId, mealType: MealType, weekIndex?: number) => void;
  clearSlot: (day: DayId, mealType: MealType, weekIndex?: number) => void;
  clearWeek: (weekIndex?: number) => void;
  getMealItems: (day: DayId, mealType: MealType, weekIndex?: number) => PlannedMealItem[];
  getTotalItems: (weekIndex?: number) => number;
  getTotalCost: (weekIndex?: number) => number;
};

const MealPlanContext = createContext<MealPlanContextValue | null>(null);

const initialState: MealPlanState = {
  selectedRestaurantId: null,
  selectedRestaurantName: null,
  selectedRestaurantData: null,
  selectedRestaurants: [],
  maxRestaurants: 2,
  weeklyPlans: { week0: createEmptyWeekPlan(), week1: createEmptyWeekPlan() },
};

type SelectedRestaurant = {
  restaurantId: string;
  restaurantName: string;
  restaurantData?: Restaurant | null;
  addedAt?: string | Date;
};

export function MealPlanProvider({ children }: PropsWithChildren) {
  const { user, isAuthenticated, isHydrating } = useAuth();
  const [state, setState] = useState<MealPlanState>(initialState);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasLoadedFromDatabase, setHasLoadedFromDatabase] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const saved = await getStoredMealPlan();
      if (!mounted) return;

      if (saved) setState(normalizeState(saved));

      setHasHydrated(true);
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated || isAuthenticated) return;
    setStoredMealPlan(state);
  }, [hasHydrated, isAuthenticated, state]);

  useEffect(() => {
    let mounted = true;

    async function loadFromDatabase() {
      if (isHydrating || !hasHydrated) return;

      if (!isAuthenticated) {
        setHasLoadedFromDatabase(false);
        return;
      }

      setIsSyncing(true);
      const result = await getCurrentMealPlan();

      if (!mounted) return;

      if (result.success && result.data) {
        const nextState = stateFromDatabase(result.data);
        setState(nextState);
        await setStoredMealPlan(nextState);
      }

      setHasLoadedFromDatabase(true);
      setIsSyncing(false);
    }

    loadFromDatabase();

    return () => {
      mounted = false;
    };
  }, [hasHydrated, isAuthenticated, isHydrating]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !hasLoadedFromDatabase || !user) return;

    const timeout = setTimeout(async () => {
      const payload = buildDatabasePayload(state, getUserId(user));
      if (!payload) return;

      await saveCurrentMealPlan(payload);
      await setStoredMealPlan(state);
    }, 800);

    return () => clearTimeout(timeout);
  }, [hasHydrated, hasLoadedFromDatabase, isAuthenticated, state, user]);

  const setSelectedRestaurant = useCallback((restaurantId: string, restaurantName: string, restaurantData?: Restaurant | null) => {
    setState((current) => ({
      ...current,
      selectedRestaurantId: restaurantId,
      selectedRestaurantName: restaurantName,
      selectedRestaurantData: restaurantData || {
        _id: restaurantId,
        id: restaurantId,
        name: restaurantName,
      },
      selectedRestaurants: upsertSelectedRestaurant(current.selectedRestaurants, {
        restaurantId,
        restaurantName,
        restaurantData: restaurantData || null,
        addedAt: new Date().toISOString(),
      }),
    }));
  }, []);

  const addSelectedRestaurant = useCallback((restaurantId: string, restaurantName: string, restaurantData?: Restaurant | null) => {
    let didAddRestaurant = false;

    setState((current) => {
      const alreadySelected = current.selectedRestaurants.some((restaurant) => restaurant.restaurantId === restaurantId);
      if (alreadySelected) return current;

      const maxRestaurants = current.maxRestaurants;
      if (typeof maxRestaurants === 'number' && current.selectedRestaurants.length >= maxRestaurants) {
        return current;
      }

      didAddRestaurant = true;
      const nextRestaurant = {
        restaurantId,
        restaurantName,
        restaurantData: restaurantData || null,
        addedAt: new Date().toISOString(),
      };

      return {
        ...current,
        selectedRestaurantId: restaurantId,
        selectedRestaurantName: restaurantName,
        selectedRestaurantData: restaurantData || {
          _id: restaurantId,
          id: restaurantId,
          name: restaurantName,
        },
        selectedRestaurants: [...current.selectedRestaurants, nextRestaurant],
      };
    });

    return didAddRestaurant;
  }, []);

  const canAddRestaurant = useCallback(() => {
    if (state.maxRestaurants === null || state.maxRestaurants === undefined) return true;
    return state.selectedRestaurants.length < state.maxRestaurants;
  }, [state.maxRestaurants, state.selectedRestaurants.length]);

  const isRestaurantSelected = useCallback((restaurantId: string) => {
    return state.selectedRestaurants.some((restaurant) => restaurant.restaurantId === restaurantId);
  }, [state.selectedRestaurants]);

  const getSelectedRestaurantCount = useCallback(() => {
    return state.selectedRestaurants.length;
  }, [state.selectedRestaurants.length]);

  const getSelectedRestaurants = useCallback(() => {
    return state.selectedRestaurants;
  }, [state.selectedRestaurants]);

  const removeSelectedRestaurant = useCallback((restaurantId: string) => {
    setState((current) => {
      const nextRestaurants = current.selectedRestaurants.filter((restaurant) => restaurant.restaurantId !== restaurantId);
      const removedCurrent = current.selectedRestaurantId === restaurantId;
      const nextCurrent = removedCurrent ? nextRestaurants[0] : null;

      return {
        ...current,
        selectedRestaurantId: removedCurrent ? nextCurrent?.restaurantId || null : current.selectedRestaurantId,
        selectedRestaurantName: removedCurrent ? nextCurrent?.restaurantName || null : current.selectedRestaurantName,
        selectedRestaurantData: removedCurrent ? nextCurrent?.restaurantData || null : current.selectedRestaurantData,
        selectedRestaurants: nextRestaurants,
      };
    });
  }, []);

  const clearItemsByRestaurant = useCallback((restaurantId: string, weekIndex: number = 0) => {
    let removedCount = 0;
    const weekKey = `week${weekIndex}` as keyof typeof initialState.weeklyPlans;

    setState((current) => {
      const weeklyPlan = createEmptyWeekPlan();

      daysOfWeek.forEach((day) => {
        mealTypes.forEach((mealType) => {
          const items = current.weeklyPlans[weekKey][day.id][mealType.id];
          const remainingItems = items.filter((item) => item.restaurantId !== restaurantId);
          removedCount += items.length - remainingItems.length;
          weeklyPlan[day.id][mealType.id] = remainingItems;
        });
      });

      return {
        ...current,
        weeklyPlans: {
          ...current.weeklyPlans,
          [weekKey]: weeklyPlan,
        },
      };
    });

    return removedCount;
  }, []);

  const getItemCountForRestaurant = useCallback((restaurantId: string, weekIndex?: number) => {
    const weekKeys = typeof weekIndex === 'number'
      ? [`week${weekIndex}` as keyof typeof state.weeklyPlans]
      : (['week0', 'week1'] as Array<keyof typeof state.weeklyPlans>);

    return weekKeys.reduce((weekTotal, weekKey) => (
      weekTotal +
      daysOfWeek.reduce((dayTotal, day) => (
        dayTotal +
        mealTypes.reduce((mealTotal, mealType) => (
          mealTotal + state.weeklyPlans[weekKey][day.id][mealType.id].filter((item) => item.restaurantId === restaurantId).length
        ), 0)
      ), 0)
    ), 0);
  }, [state.weeklyPlans]);

  const addItemToPlan = useCallback((item: MenuItem, day: DayId, mealType: MealType, weekIndex: number = 0) => {
    const weekKey = `week${weekIndex}` as keyof typeof initialState.weeklyPlans;
    setState((current) => {
      if (!current.selectedRestaurantId || !current.selectedRestaurantName) return current;

      const plannedItem: PlannedMealItem = {
        ...item,
        planId: `${getMenuItemId(item)}-${day}-${mealType}-${Date.now()}`,
        restaurantId: current.selectedRestaurantId,
        restaurantName: current.selectedRestaurantName,
        day,
        mealType,
      };

      return {
        ...current,
        weeklyPlans: {
          ...current.weeklyPlans,
          [weekKey]: {
            ...current.weeklyPlans[weekKey],
            [day]: {
              ...current.weeklyPlans[weekKey][day],
              [mealType]: [...current.weeklyPlans[weekKey][day][mealType], plannedItem],
            },
          },
        },
      };
    });
  }, []);

  const removeItemFromPlan = useCallback((planId: string, day: DayId, mealType: MealType, weekIndex: number = 0) => {
    const weekKey = `week${weekIndex}` as keyof typeof initialState.weeklyPlans;
    setState((current) => ({
      ...current,
      weeklyPlans: {
        ...current.weeklyPlans,
        [weekKey]: {
          ...current.weeklyPlans[weekKey],
          [day]: {
            ...current.weeklyPlans[weekKey][day],
            [mealType]: current.weeklyPlans[weekKey][day][mealType].filter((item) => item.planId !== planId),
          },
        },
      },
    }));
  }, []);

  const clearSlot = useCallback((day: DayId, mealType: MealType, weekIndex: number = 0) => {
    const weekKey = `week${weekIndex}` as keyof typeof initialState.weeklyPlans;
    setState((current) => ({
      ...current,
      weeklyPlans: {
        ...current.weeklyPlans,
        [weekKey]: {
          ...current.weeklyPlans[weekKey],
          [day]: {
            ...current.weeklyPlans[weekKey][day],
            [mealType]: [],
          },
        },
      },
    }));
  }, []);

  const clearWeek = useCallback((weekIndex: number = 0) => {
    const weekKey = `week${weekIndex}` as keyof typeof initialState.weeklyPlans;
    setState((current) => ({
      ...current,
      weeklyPlans: {
        ...current.weeklyPlans,
        [weekKey]: createEmptyWeekPlan(),
      },
    }));
  }, []);

  const getMealItems = useCallback((day: DayId, mealType: MealType, weekIndex: number = 0) => {
    const weekKey = `week${weekIndex}` as keyof typeof state.weeklyPlans;
    return state.weeklyPlans[weekKey][day][mealType];
  }, [state.weeklyPlans]);

  const getTotalItems = useCallback((weekIndex: number = 0) => {
    const weekKey = `week${weekIndex}` as keyof typeof state.weeklyPlans;
    return daysOfWeek.reduce((total, day) => (
      total +
      mealTypes.reduce((mealTotal, mealType) => mealTotal + state.weeklyPlans[weekKey][day.id][mealType.id].length, 0)
    ), 0);
  }, [state.weeklyPlans]);

  const getTotalCost = useCallback((weekIndex: number = 0) => {
    const weekKey = `week${weekIndex}` as keyof typeof state.weeklyPlans;
    return daysOfWeek.reduce((total, day) => (
      total +
      mealTypes.reduce((mealTotal, mealType) => (
        mealTotal + state.weeklyPlans[weekKey][day.id][mealType.id].reduce((slotTotal, item) => slotTotal + (item.price || 0), 0)
      ), 0)
    ), 0);
  }, [state.weeklyPlans]);

  const value = useMemo<MealPlanContextValue>(() => ({
    ...state,
    hasHydrated,
    isSyncing,
    setSelectedRestaurant,
    addSelectedRestaurant,
    canAddRestaurant,
    isRestaurantSelected,
    getSelectedRestaurantCount,
    getSelectedRestaurants,
    removeSelectedRestaurant,
    clearItemsByRestaurant,
    getItemCountForRestaurant,
    addItemToPlan,
    removeItemFromPlan,
    clearSlot,
    clearWeek,
    getMealItems,
    getTotalItems,
    getTotalCost,
  }), [
    addItemToPlan,
    addSelectedRestaurant,
    canAddRestaurant,
    clearSlot,
    clearWeek,
    clearItemsByRestaurant,
    getMealItems,
    getItemCountForRestaurant,
    getSelectedRestaurantCount,
    getSelectedRestaurants,
    getTotalCost,
    getTotalItems,
    hasHydrated,
    isRestaurantSelected,
    isSyncing,
    removeItemFromPlan,
    removeSelectedRestaurant,
    setSelectedRestaurant,
    state,
  ]);

  return <MealPlanContext.Provider value={value}>{children}</MealPlanContext.Provider>;
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);

  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }

  return context;
}

function createEmptyWeekPlan(): WeekPlan {
  return daysOfWeek.reduce((week, day) => {
    week[day.id] = {
      lunch: [],
      dinner: [],
    };

    return week;
  }, {} as WeekPlan);
}

function mergeWeekPlan(weekPlan?: Partial<WeekPlan>) {
  const empty = createEmptyWeekPlan();
  if (!weekPlan) return empty;

  daysOfWeek.forEach((day) => {
    mealTypes.forEach((mealType) => {
      const dayPlan = weekPlan[day.id];
      empty[day.id][mealType.id] = Array.isArray(dayPlan?.[mealType.id])
        ? dayPlan[mealType.id]
        : [];
    });
  });

  return empty;
}

function normalizeState(saved: Partial<MealPlanState> & { weeklyPlan?: WeekPlan }): MealPlanState {
  // Handle backward compatibility with saved states that have weeklyPlan instead of weeklyPlans
  let weeklyPlans = initialState.weeklyPlans;
  if (saved.weeklyPlans) {
    weeklyPlans = {
      week0: mergeWeekPlan(saved.weeklyPlans.week0),
      week1: mergeWeekPlan(saved.weeklyPlans.week1),
    };
  } else if (saved.weeklyPlan) {
    weeklyPlans = {
      week0: mergeWeekPlan(saved.weeklyPlan),
      week1: createEmptyWeekPlan(),
    };
  }

  return {
    ...initialState,
    ...saved,
    selectedRestaurants: Array.isArray(saved.selectedRestaurants) ? saved.selectedRestaurants : [],
    maxRestaurants: saved.maxRestaurants === undefined ? initialState.maxRestaurants : saved.maxRestaurants,
    weeklyPlans,
  };
}

function stateFromDatabase(data: Record<string, unknown>): MealPlanState {
  const weeklyPlansData = data.weeklyPlans as { week0?: Partial<WeekPlan>; week1?: Partial<WeekPlan> } | undefined;
  const selectedRestaurants = Array.isArray(data.selectedRestaurants)
    ? data.selectedRestaurants.map((restaurant) => normalizeSelectedRestaurant(restaurant)).filter(Boolean) as SelectedRestaurant[]
    : [];
  const firstRestaurant = selectedRestaurants[0];
  const selectedRestaurantData = data.selectedRestaurantData && typeof data.selectedRestaurantData === 'object'
    ? data.selectedRestaurantData as Restaurant
    : firstRestaurant
      ? {
          _id: firstRestaurant.restaurantId,
          id: firstRestaurant.restaurantId,
          name: firstRestaurant.restaurantName,
        }
      : null;

  return {
    selectedRestaurantId: firstRestaurant?.restaurantId || stringOrNull(data.selectedRestaurantId),
    selectedRestaurantName: firstRestaurant?.restaurantName || stringOrNull(data.selectedRestaurantName),
    selectedRestaurantData,
    selectedRestaurants,
    maxRestaurants: typeof data.maxRestaurants === 'number' ? data.maxRestaurants : 2,
    weeklyPlans: {
      week0: mergeWeekPlan(weeklyPlansData?.week0),
      week1: mergeWeekPlan(weeklyPlansData?.week1),
    },
  };
}

function buildDatabasePayload(state: MealPlanState, userId: string | null) {
  if (!userId) return null;

  const selectedRestaurants = state.selectedRestaurants
    .map((restaurant) => ({
      restaurantId: restaurant.restaurantId,
      restaurantName: restaurant.restaurantName,
      addedAt: restaurant.addedAt || new Date().toISOString(),
    }))
    .filter((restaurant) => restaurant.restaurantId && restaurant.restaurantName);

  return {
    userId,
    weeklyPlans: {
      week0: state.weeklyPlans.week0,
      week1: state.weeklyPlans.week1,
    },
    totalItems: countWeekItems(state.weeklyPlans.week0) + countWeekItems(state.weeklyPlans.week1),
    selectedRestaurants,
    selectedRestaurantId: state.selectedRestaurantId,
    selectedRestaurantName: state.selectedRestaurantName,
    selectedRestaurantData: state.selectedRestaurantData,
    maxRestaurants: state.maxRestaurants,
  };
}

function upsertSelectedRestaurant(restaurants: SelectedRestaurant[], nextRestaurant: SelectedRestaurant) {
  const existingIndex = restaurants.findIndex((restaurant) => restaurant.restaurantId === nextRestaurant.restaurantId);

  if (existingIndex >= 0) {
    return restaurants.map((restaurant, index) => (index === existingIndex ? nextRestaurant : restaurant));
  }

  if (restaurants.length >= 2) {
    return restaurants;
  }

  return [...restaurants, nextRestaurant];
}

function normalizeSelectedRestaurant(value: unknown): SelectedRestaurant | null {
  if (!value || typeof value !== 'object') return null;
  const restaurant = value as { restaurantId?: unknown; id?: unknown; restaurantName?: unknown; name?: unknown; addedAt?: unknown };
  const restaurantId = firstString(restaurant.restaurantId, restaurant.id);
  const restaurantName = firstString(restaurant.restaurantName, restaurant.name);
  if (!restaurantId || !restaurantName) return null;

  return {
    restaurantId,
    restaurantName,
    addedAt: typeof restaurant.addedAt === 'string' ? restaurant.addedAt : undefined,
  };
}

function countWeekItems(weekPlan: WeekPlan) {
  return daysOfWeek.reduce((total, day) => (
    total + mealTypes.reduce((mealTotal, mealType) => mealTotal + weekPlan[day.id][mealType.id].length, 0)
  ), 0);
}

function getUserId(user: { _id?: string; id?: string } | null) {
  return user?._id || user?.id || null;
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0) || null;
}

function stringOrNull(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function getMenuItemId(item: MenuItem) {
  return item.id || item._id || item.name || 'menu-item';
}

async function setStoredMealPlan(state: MealPlanState) {
  const value = JSON.stringify(state);

  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(STORAGE_KEY, value);
}

async function getStoredMealPlan(): Promise<Partial<MealPlanState> | null> {
  const value = Platform.OS === 'web'
    ? getWebStorage()?.getItem(STORAGE_KEY) || null
    : await SecureStore.getItemAsync(STORAGE_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as Partial<MealPlanState>;
  } catch {
    return null;
  }
}

function getWebStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}
