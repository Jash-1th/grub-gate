import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFlash } from '../contexts/FlashContext';
import {
  daysOfWeek,
  mealTypes,
  type DayId,
  type MealType,
  useMealPlan,
} from '../contexts/MealPlanContext';
import {
  getRestaurant,
  getRestaurantMenu,
  type MenuItem,
  type Restaurant,
} from '../lib/restaurantApi';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

const fallbackFoodImage = require('../assets/grub-gate-default-img.jpg');

// Helper function to get the right icon for each meal type
const getMealIcon = (mealType: MealType) => {
  if (mealType.toLowerCase().includes('breakfast') || mealType.toLowerCase().includes('lunch')) {
    return '🌅';
  }
  return '🌙';
};

// Helper to strictly force 3-letter day abbreviations so tabs never overflow
const getShortDay = (dayLabel: string) => {
  return dayLabel.substring(0, 3);
};

export default function WeeklyMenuScreen() {
  const insets = useSafeAreaInsets();
  const {
    selectedRestaurantId,
    selectedRestaurantName,
    selectedRestaurantData,
    selectedRestaurants,
    hasHydrated,
    setSelectedRestaurant,
    addItemToPlan,
    removeItemFromPlan,
    clearWeek,
    clearItemsByRestaurant,
    removeSelectedRestaurant,
    getItemCountForRestaurant,
    getMealItems,
    getTotalItems,
    getTotalCost,
  } = useMealPlan();
  const { showFlash } = useFlash();
  const { user } = useAuth();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(selectedRestaurantData);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeDay, setActiveDay] = useState<DayId>('monday');
  const [activeMealType, setActiveMealType] = useState<MealType>('lunch');
  const [isWeek2Enabled, setIsWeek2Enabled] = useState(false);
  const [showRestaurantReplacementModal, setShowRestaurantReplacementModal] = useState(false);
  const [showMealPickerSheet, setShowMealPickerSheet] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const restaurantId = selectedRestaurantId || '';
  const totalItems = getTotalItems();
  const totalCost = getTotalCost();

  const getWeekDateRange = (weekIndex: number) => {
    const start = getNextSunday();
    start.setDate(start.getDate() + weekIndex * 7);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const formatShort = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${formatShort(start)} - ${formatShort(end)}`;
  };

  useEffect(() => {
    let mounted = true;

    async function loadWeeklyMenuData() {
      if (!hasHydrated || !restaurantId) return;

      setIsLoading(true);
      setErrorMessage('');

      const [restaurantResult, menuResult] = await Promise.all([
        selectedRestaurantData && getRestaurantId(selectedRestaurantData) === restaurantId
          ? Promise.resolve({ success: true, data: selectedRestaurantData })
          : getRestaurant(restaurantId),
        getRestaurantMenu(restaurantId, { userType: 'normal' }),
      ]);

      if (!mounted) return;

      if (restaurantResult.success && restaurantResult.data) {
        const loadedRestaurant = restaurantResult.data;
        setRestaurant(loadedRestaurant);
        setSelectedRestaurant(
          getRestaurantId(loadedRestaurant) || restaurantId,
          loadedRestaurant.name || selectedRestaurantName || 'Selected Restaurant',
          loadedRestaurant,
        );
      } else {
        setErrorMessage('Unable to load the selected restaurant.');
      }

      if (menuResult.success) {
        setMenuItems(menuResult.data.menuItems);
      } else {
        showFlash(menuResult.error || 'Unable to load menu items.', 'error');
      }

      setIsLoading(false);
    }

    loadWeeklyMenuData();

    return () => {
      mounted = false;
    };
  }, [hasHydrated, restaurantId, selectedRestaurantData, selectedRestaurantName, setSelectedRestaurant, showFlash]);

  const groupedMenuItems = useMemo(() => {
    return menuItems.filter((item) => item.isAvailable !== false && item.status !== 'out-of-stock');
  }, [menuItems]);

  const handleAddItem = (item: MenuItem) => {
    addItemToPlan(item, activeDay, activeMealType);
    showFlash(`${item.name || 'Menu item'} added to ${formatDay(activeDay)} ${activeMealType}.`, 'success');
  };

  const handleSlotPress = (day: DayId, mealType: MealType) => {
    setActiveDay(day);
    setActiveMealType(mealType);
    setShowMealPickerSheet(true);
  };

  const handleRemoveMeal = (planId: string, day: DayId, mealType: MealType) => {
    removeItemFromPlan(planId, day, mealType);
    showFlash('Meal removed successfully', 'info');
  };

  const handleConfirmRestaurantReplacement = (restaurantsToRemove: typeof selectedRestaurants) => {
    restaurantsToRemove.forEach((restaurantToRemove) => {
      clearItemsByRestaurant(restaurantToRemove.restaurantId);
      removeSelectedRestaurant(restaurantToRemove.restaurantId);
    });

    const restaurantNames = restaurantsToRemove.map((item) => item.restaurantName).join(', ');
    showFlash(
      restaurantsToRemove.length === 1
        ? `${restaurantNames} removed from your meal plan.`
        : `${restaurantsToRemove.length} restaurants removed from your meal plan.`,
      'success',
    );
  };

  if (!hasHydrated) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={theme.colors.brand.grubRed} />
        <Text style={styles.loadingText}>Loading weekly menu...</Text>
      </SafeAreaView>
    );
  }

  if (!restaurantId) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.emptyTitle}>Select a Restaurant First</Text>
        <Text style={styles.emptyCopy}>Choose a restaurant before building your weekly menu.</Text>
        <Pressable onPress={() => router.replace('/plan')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Find Restaurants</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      {/* FORCE HIDE EXPO ROUTER DEFAULT HEADER */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. Minimalist Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.gray[900]} />
        </Pressable>
        <View style={styles.planSummary}>
          <Text style={styles.planSummaryText}>
            Total: {totalItems} meal{totalItems !== 1 ? 's' : ''} • {formatPrice(totalCost)}
          </Text>
        </View>
        <Pressable onPress={() => setShowOptionsMenu(!showOptionsMenu)} style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.gray[900]} />
        </Pressable>
      </View>

      {/* Options Menu Dropdown */}
      {showOptionsMenu && (
        <View style={styles.optionsMenu}>
          {totalItems > 0 && (
            <Pressable
              onPress={() => {
                clearWeek();
                setShowOptionsMenu(false);
              }}
              style={styles.optionItem}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.red[600]} />
              <Text style={styles.optionTextRed}>Clear Week</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (totalItems === 0) return;
              router.push('/meal-calendar?includeWeek2=0');
              setShowOptionsMenu(false);
            }}
            style={styles.optionItem}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.gray[700]} />
            <Text style={styles.optionText}>View Calendar</Text>
          </Pressable>
        </View>
      )}

      {/* Main Scroll Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. Compressed Week Toggler Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.weekCard}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.gray[600]} />
            <View style={styles.weekCardTextContainer}>
              <Text style={styles.weekCardWeekText}>Week 1</Text>
              <Text style={styles.weekCardMealText}>{totalItems} meal{totalItems !== 1 ? 's' : ''}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.planWeek2Button}
            onPress={() => setIsWeek2Enabled(!isWeek2Enabled)}
          >
            <Text style={styles.planWeek2ButtonText}>Plan Week 2 as well</Text>
          </TouchableOpacity>

          <View style={styles.weekDateRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.gray[500]} />
            <Text style={styles.weekDateText}>Week 1: {getWeekDateRange(0)}</Text>
          </View>
        </View>

        {/* 3. Restaurant & Compressed Action Buttons */}
        <View style={styles.restaurantSection}>
          <View style={styles.restaurantHeaderRow}>
            <View style={styles.forkIconContainer}>
              <Ionicons name="restaurant-outline" size={14} color="white" />
            </View>
            <Text style={styles.restaurantHeaderText}>Planning meals from</Text>
          </View>

          <View style={styles.restaurantPillsRow}>
            {(selectedRestaurants.length > 0 ? selectedRestaurants : [{ restaurantName: selectedRestaurantName || 'Selected Restaurant' }]).map((rest, index, arr) => (
              <View key={rest.restaurantId || index} style={styles.restaurantPillContainer}>
                <View style={styles.restaurantPill}>
                  <Text style={styles.restaurantPillText}>{rest.restaurantName}</Text>
                </View>
                {index < arr.length - 1 && <Text style={styles.restaurantSeparator}>&</Text>}
              </View>
            ))}
          </View>

          <Text style={styles.restaurantHelperText}>Click any slot to add meals • Restaurant</Text>

          {/* Compressed side-by-side buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.grubPassButton}>
              <Ionicons name="lock-closed-outline" size={16} color="white" />
              <Text style={styles.grubPassButtonText}>Grub Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeRestaurantButton}>
              <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.gray[800]} />
              <Text style={styles.changeRestaurantButtonText}>Change Restaurant</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Strictly Sized Day Slider */}
        <View style={styles.daySliderWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySliderContainer}
          >
            {daysOfWeek.map((day) => {
              const isActive = activeDay === day.id;
              const dayDate = getDayDateNumber(day.id);
              // Check if any meals are planned for this specific day
              const hasMeals = mealTypes.some((mealType) => getMealItems(day.id, mealType.id).length > 0);

              return (
                <TouchableOpacity
                  key={day.id}
                  onPress={() => setActiveDay(day.id)}
                  style={[
                    styles.dayTab,
                    isActive && styles.dayTabActive
                  ]}
                >
                  <Text style={[
                    styles.dayTabDayText,
                    isActive && styles.dayTabDayTextActive
                  ]}>
                    {getShortDay(day.label)}
                  </Text>
                  <Text style={[
                    styles.dayTabDateText,
                    isActive && styles.dayTabDateTextActive
                  ]}>
                    {dayDate}
                  </Text>
                  {/* Subtle indicator dot if day has meals */}
                  {hasMeals && !isActive && <View style={styles.dayTabIndicatorDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. Selected Day Meal Slots */}
        <View style={styles.mealSlotsContainer}>
          {mealTypes.map((mealType) => {
            const items = getMealItems(activeDay, mealType.id);
            const itemCount = items.length;

            return (
              <View key={mealType.id} style={styles.mealSlotContainer}>
                {/* Meal Slot Header */}
                <View style={styles.mealSlotHeader}>
                  <View style={styles.mealTypeRow}>
                    <Text style={styles.mealTypeIcon}>{getMealIcon(mealType.id)}</Text>
                    <Text style={styles.mealTypeHeaderText}>{mealType.label}</Text>
                  </View>
                  <View style={[
                    styles.mealCountBadge,
                    itemCount > 0 ? styles.mealCountBadgeActive : styles.mealCountBadgeInactive
                  ]}>
                    <Text style={[
                      styles.mealCountBadgeText,
                      itemCount > 0 ? styles.mealCountBadgeTextActive : styles.mealCountBadgeTextInactive
                    ]}>
                      {itemCount} meal{itemCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                {/* Meal Slot Cards */}
                {itemCount > 0 ? (
                  // Filled/Planned State
                  items.map((item, index) => (
                    <View key={item.planId || index} style={styles.filledMealCard}>
                      <View style={styles.filledMealTopRow}>
                        <Text style={styles.restaurantNameText}>{item.restaurantName || restaurant?.name || 'Restaurant'}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveMeal(item.planId, activeDay, mealType.id)}
                          style={styles.removeMealButton}
                        >
                          <View style={styles.removeMealButtonInner}>
                            <Ionicons name="close" size={16} color="white" />
                          </View>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.filledMealMiddleRow}>
                        <Text style={styles.mealNameText}>{item.name}</Text>
                        <Text style={styles.mealPriceText}>{formatPrice(item.price || 0)}</Text>
                      </View>

                      <View style={styles.filledMealBottomRow}>
                        <View style={styles.plannedBadge}>
                          <Text style={styles.plannedBadgeText}>Planned</Text>
                        </View>
                        <Text style={styles.helperText}>Want to add more? Click me</Text>
                      </View>

                      <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => handleSlotPress(activeDay, mealType.id)}
                      />
                    </View>
                  ))
                ) : (
                  // Empty State
                  <Pressable
                    onPress={() => handleSlotPress(activeDay, mealType.id)}
                    style={({ pressed }) => [styles.emptyMealCard, pressed && styles.pressed]}
                  >
                    <Ionicons name="add" size={32} color="#94A3B8" />
                    <Text style={styles.emptyMealText}>Add {mealType.label.toLowerCase()}</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* 6. Properly Docked Absolute Footer */}
      <View style={[styles.dockedFooter, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => {
            if (totalItems > 0) {
              router.push('/meal-calendar?includeWeek2=0');
            } else {
              showFlash('Generating a meal plan...', 'info');
            }
          }}
        >
          <Ionicons
            name={totalItems > 0 ? 'checkmark-circle-outline' : 'sparkles-outline'}
            size={22}
            color="white"
          />
          <Text style={styles.reviewButtonText}>
            {totalItems > 0 ? 'Review Plan' : 'Generate Plan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals & Bottom Sheets */}
      {showMealPickerSheet && (
        <MealPickerSheet
          activeDay={activeDay}
          activeMealType={activeMealType}
          activeRestaurantId={restaurantId}
          restaurantName={restaurant?.name || selectedRestaurantName || 'Selected Restaurant'}
          selectedRestaurants={selectedRestaurants}
          menuItems={groupedMenuItems}
          isLoading={isLoading}
          onClose={() => setShowMealPickerSheet(false)}
          onDayChange={setActiveDay}
          onRestaurantChange={(nextRestaurantId) => {
            const nextRestaurant = selectedRestaurants.find((item) => item.restaurantId === nextRestaurantId);
            if (!nextRestaurant) return;
            setSelectedRestaurant(
              nextRestaurant.restaurantId,
              nextRestaurant.restaurantName,
              nextRestaurant.restaurantData || null,
            );
          }}
          onAddItem={handleAddItem}
        />
      )}

      <RestaurantReplacementModal
        isVisible={showRestaurantReplacementModal}
        selectedRestaurants={selectedRestaurants}
        getItemCountForRestaurant={getItemCountForRestaurant}
        onClose={() => setShowRestaurantReplacementModal(false)}
        onConfirmRemove={handleConfirmRestaurantReplacement}
      />
    </SafeAreaView>
  );
}

// --- KEEPING THE SAME BOTTOM SHEET & HELPER COMPONENTS ---

const sheetDayOrder: DayId[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function MealPickerSheet({
  activeDay,
  activeMealType,
  activeRestaurantId,
  restaurantName,
  selectedRestaurants,
  menuItems,
  isLoading,
  onClose,
  onDayChange,
  onRestaurantChange,
  onAddItem,
}: {
  activeDay: DayId;
  activeMealType: MealType;
  activeRestaurantId: string;
  restaurantName: string;
  selectedRestaurants: Array<{ restaurantId: string; restaurantName: string; restaurantData?: Restaurant | null }>;
  menuItems: MenuItem[];
  isLoading: boolean;
  onClose: () => void;
  onDayChange: (day: DayId) => void;
  onRestaurantChange: (restaurantId: string) => void;
  onAddItem: (item: MenuItem) => void;
}) {
  const [showPreferenceOptions, setShowPreferenceOptions] = useState(false);
  const restaurantTabs = selectedRestaurants.length > 0
    ? selectedRestaurants
    : [{ restaurantId: activeRestaurantId, restaurantName }];
  const activeRestaurantIndex = restaurantTabs.findIndex(
    (item) => item.restaurantId === activeRestaurantId,
  );
  const { getMealItems, removeItemFromPlan } = useMealPlan();
  const mealItems = getMealItems(activeDay, activeMealType);

  const handleRestaurantStep = (direction: number) => {
    if (restaurantTabs.length <= 1) return;
    const nextIndex = (activeRestaurantIndex + direction + restaurantTabs.length) % restaurantTabs.length;
    onRestaurantChange(restaurantTabs[nextIndex].restaurantId);
  };

  const getQuantity = (item: MenuItem) => {
    const itemId = getMenuItemId(item);
    return mealItems.filter((plannedItem) => getMenuItemId(plannedItem) === itemId).length;
  };

  const handleIncrement = (item: MenuItem) => {
    onAddItem(item);
  };

  const handleDecrement = (item: MenuItem) => {
    const itemId = getMenuItemId(item);
    const matchingItems = mealItems.filter((plannedItem) => getMenuItemId(plannedItem) === itemId);
    if (matchingItems.length > 0) {
      const lastItem = matchingItems[matchingItems.length - 1];
      removeItemFromPlan(lastItem.planId, activeDay, activeMealType);
    }
  };

  return (
    <View style={styles.mealPickerOverlay}>
      <Pressable onPress={onClose} style={styles.mealPickerBackdrop} />
      <View style={styles.mealPickerSheet}>
        <View style={styles.mealPickerHandle} />

        <View style={styles.mealPickerHeader}>
          <View style={styles.mealPickerTitleBlock}>
            <Text style={styles.mealPickerTitle}>Add to {formatDay(activeDay)} {formatMealType(activeMealType)}</Text>
            <Text style={styles.mealPickerSubtitle}>{restaurantName}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.mealPickerClose}>
            <Ionicons name="close" size={24} color={theme.colors.gray[600]} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayChipScrollView}
          contentContainerStyle={styles.dayChipScroller}
        >
          {sheetDayOrder.map((day) => {
            const isActive = activeDay === day;
            return (
              <Pressable
                key={day}
                onPress={() => onDayChange(day)}
                style={({ pressed }) => [styles.dayChip, isActive && styles.dayChipActive, pressed && styles.pressed]}
              >
                <Text style={[styles.dayChipLabel, isActive && styles.dayChipLabelActive]}>{getShortDay(formatDay(day))}</Text>
                <Text style={[styles.dayChipDate, isActive && styles.dayChipDateActive]}>{getDayDateLabel(day)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sheetDivider} />

        {restaurantTabs.length > 1 && (
          <>
            <Text style={styles.restaurantTabsLabel}>Restaurants</Text>
            <View style={styles.restaurantTabRow}>
              <Pressable
                onPress={() => handleRestaurantStep(-1)}
                style={({ pressed }) => [styles.restaurantArrowButton, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-back" size={20} color={theme.colors.gray[700]} />
              </Pressable>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.restaurantTabScroller}
              >
                {restaurantTabs.map((rest, index) => {
                  const isActive = rest.restaurantId === activeRestaurantId || (activeRestaurantId === '' && index === 0);

                  return (
                    <Pressable
                      key={rest.restaurantId || `${rest.restaurantName}-${index}`}
                      onPress={() => onRestaurantChange(rest.restaurantId)}
                      style={({ pressed }) => [isActive ? styles.restaurantTabActive : styles.restaurantTab, pressed && styles.pressed]}
                    >
                      <Text numberOfLines={1} style={isActive ? styles.restaurantTabActiveText : styles.restaurantTabText}>
                        {rest.restaurantName}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable
                onPress={() => handleRestaurantStep(1)}
                style={({ pressed }) => [styles.restaurantArrowButton, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[700]} />
              </Pressable>
            </View>
          </>
        )}

        <ScrollView style={styles.mealPickerBody} showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => setShowPreferenceOptions((current) => !current)}
            style={({ pressed }) => [styles.foodPreferenceCard, pressed && styles.pressed]}
          >
            <View style={styles.foodPreferenceIcon}>
              <Ionicons name="filter-outline" size={20} color={theme.colors.gray[700]} />
            </View>
            <View style={styles.foodPreferenceTextBlock}>
              <Text style={styles.foodPreferenceTitle}>Food Preferences</Text>
              <Text style={styles.foodPreferenceCopy}>Tap to filter menu items</Text>
            </View>
            <Ionicons
              name={showPreferenceOptions ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.gray[500]}
            />
          </Pressable>

          {showPreferenceOptions ? (
            <View style={styles.foodPreferenceOptions}>
              {['Vegan', 'Vegetarian', 'Gluten Free', 'Halal'].map((preference) => (
                <Pressable key={preference} style={({ pressed }) => [styles.foodPreferenceChip, pressed && styles.pressed]}>
                  <Text style={styles.foodPreferenceChipText}>{preference}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.sheetMenuHeader}>
            <View style={styles.sheetMenuTitleBlock}>
              <Text style={styles.sheetMenuTitle}>Menu Items</Text>
              <Text style={styles.sheetMenuSubtitle}>({menuItems.length} items available)</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.brand.grubRed} />
              <Text style={styles.loadingMenuText}>Loading menu...</Text>
            </View>
          ) : (
            menuItems.map((item) => (
              <WeeklyMenuItemCard 
                key={getMenuItemId(item)} 
                item={item} 
                quantity={getQuantity(item)}
                onIncrement={() => handleIncrement(item)}
                onDecrement={() => handleDecrement(item)} 
              />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function RestaurantReplacementModal({
  isVisible,
  selectedRestaurants,
  getItemCountForRestaurant,
  onClose,
  onConfirmRemove,
}: {
  isVisible: boolean;
  selectedRestaurants: Array<{ restaurantId: string; restaurantName: string; restaurantData?: Restaurant | null }>;
  getItemCountForRestaurant: (restaurantId: string) => number;
  onClose: () => void;
  onConfirmRemove: (restaurantsToRemove: typeof selectedRestaurants) => void;
}) {
  const [modalStep, setModalStep] = useState<'remove' | 'add'>('remove');
  const [selectedToRemove, setSelectedToRemove] = useState<typeof selectedRestaurants>([]);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveRestaurants = async () => {
    setIsRemoving(true);
    setTimeout(() => {
      onConfirmRemove(selectedToRemove);
      setSelectedToRemove([]);
      setModalStep('add');
      setIsRemoving(false);
    }, 500);
  };

  const remainingRestaurants = selectedRestaurants.filter(
    (item) => !selectedToRemove.some((remove) => remove.restaurantId === item.restaurantId),
  );

  const toggleRestaurantSelection = (rest: (typeof selectedRestaurants)[0]) => {
    if (selectedToRemove.some((item) => item.restaurantId === rest.restaurantId)) {
      setSelectedToRemove(selectedToRemove.filter((item) => item.restaurantId !== rest.restaurantId));
    } else {
      setSelectedToRemove([...selectedToRemove, rest]);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.replacementModalOverlay}>
        <View style={styles.replacementModalSheet}>
          <View style={styles.replacementModalHandle} />

          <View style={styles.replacementModalHeader}>
            <Text style={styles.replacementModalTitle}>
              {modalStep === 'remove' ? 'Remove Restaurants' : 'Restaurant Removed'}
            </Text>
            <Pressable onPress={onClose} style={styles.replacementModalClose}>
              <Ionicons name="close" size={24} color={theme.colors.gray[600]} />
            </Pressable>
          </View>

          <View style={styles.replacementModalBody}>
            {modalStep === 'remove' ? (
              <>
                <Text style={styles.replacementInstruction}>
                  Select restaurants to remove from your meal plan
                </Text>

                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={styles.legendBox} />
                    <Text style={styles.legendText}>Not selected</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendBoxSelected} />
                    <Text style={styles.legendText}>Selected for removal</Text>
                  </View>
                </View>

                <View style={styles.restaurantList}>
                  {selectedRestaurants.map((rest) => {
                    const isSelected = selectedToRemove.some((item) => item.restaurantId === rest.restaurantId);
                    const itemCount = getItemCountForRestaurant(rest.restaurantId);
                    const cuisine = rest.restaurantData?.cuisine || '';

                    return (
                      <Pressable
                        key={rest.restaurantId}
                        onPress={() => toggleRestaurantSelection(rest)}
                        style={({ pressed }) => [
                          styles.removalRestaurantCard,
                          isSelected && styles.removalRestaurantCardSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.removalRestaurantRow}>
                          <View style={[styles.removalCheckbox, isSelected && styles.removalCheckboxSelected]}>
                            {isSelected && <Ionicons name="checkmark" size={16} color={theme.colors.white} />}
                          </View>
                          <View style={styles.removalRestaurantTextBlock}>
                            <Text style={styles.removalRestaurantName}>{rest.restaurantName}</Text>
                            {cuisine ? (
                              <Text numberOfLines={1} style={styles.removalRestaurantCuisine}>{cuisine}</Text>
                            ) : null}
                            <View style={[styles.mealCountBadge, isSelected && itemCount > 0 && styles.mealCountBadgeSelected]}>
                              <Text style={[styles.mealCountBadgeText, isSelected && itemCount > 0 && styles.mealCountBadgeSelectedText]}>
                                {itemCount} meal{itemCount === 1 ? '' : 's'}
                              </Text>
                            </View>
                            {isSelected && itemCount > 0 ? (
                              <Text style={styles.willDeleteText}>Will be deleted</Text>
                            ) : null}
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.addStepTitle}>Restaurant removed successfully!</Text>
                <Text style={styles.addStepCopy}>Click below to browse and add a new restaurant:</Text>

                <Pressable
                  onPress={() => {
                    onClose();
                    router.push('/plan/restaurants?source=plan');
                  }}
                  style={({ pressed }) => [styles.browseRestaurantsButton, pressed && styles.pressed]}
                >
                  <View style={styles.browseIcon}>
                    <Ionicons name="add" size={24} color="white" />
                  </View>
                  <View style={styles.browseTextBlock}>
                    <Text style={styles.browseTitle}>Browse Restaurants</Text>
                    <Text style={styles.browseCopy}>Click to explore restaurants near you</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </Pressable>

                {remainingRestaurants.length > 0 ? (
                  <View style={styles.remainingSection}>
                    <Text style={styles.currentRestaurantsLabel}>
                      {remainingRestaurants.length === 1 ? 'Your Remaining Restaurant' : 'Your Remaining Restaurants'}
                    </Text>
                    {remainingRestaurants.map((rest) => (
                      <View key={rest.restaurantId} style={styles.remainingRestaurantCard}>
                        <View style={styles.remainingCheck}>
                          <Ionicons name="checkmark" size={16} color={theme.colors.green[600]} />
                        </View>
                        <View style={styles.remainingTextBlock}>
                          <Text style={styles.remainingRestaurantName}>{rest.restaurantName}</Text>
                          <Text style={styles.remainingStatus}>Active in plan</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.replacementActions}>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.replacementCancelButton, pressed && styles.pressed]}>
              <Text style={styles.replacementCancelText}>{modalStep === 'remove' ? 'Cancel' : 'Done'}</Text>
            </Pressable>

            {modalStep === 'remove' && (
              <Pressable
                disabled={selectedToRemove.length === 0 || isRemoving}
                onPress={handleRemoveRestaurants}
                style={({ pressed }) => [
                  styles.replacementRemoveButton,
                  selectedToRemove.length === 0 || isRemoving ? styles.replacementRemoveButtonDisabled : styles.replacementRemoveButtonActive,
                  pressed && selectedToRemove.length > 0 && !isRemoving && styles.pressed,
                ]}
              >
                {isRemoving ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.replacementRemoveText,
                      selectedToRemove.length === 0 && styles.replacementRemoveTextDisabled,
                    ]}
                  >
                    {selectedToRemove.length > 0 ? `Remove ${selectedToRemove.length}` : 'Select to Remove'}
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WeeklyMenuItemCard({ item, quantity, onIncrement, onDecrement }: { item: MenuItem; quantity: number; onIncrement: () => void; onDecrement: () => void }) {
  const image = item.image || item.imageUrl;
  const tags = getDietaryTags(item);

  return (
    <View style={styles.menuCard}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} defaultSource={fallbackFoodImage} style={styles.menuImage} />
        ) : (
          <Image source={fallbackFoodImage} style={styles.menuImage} />
        )}
        <View style={styles.floatingStepperContainer}>
          {quantity === 0 ? (
            <Pressable onPress={onIncrement} style={({ pressed }) => [styles.addButtonPill, pressed && styles.pressed]}>
              <Text style={styles.addButtonText}>+ ADD</Text>
            </Pressable>
          ) : (
            <View style={styles.stepperPill}>
              <Pressable onPress={onDecrement} style={({ pressed }) => [styles.stepperButton, styles.stepperButtonLeft, pressed && styles.pressed]}>
                <Ionicons name="remove" size={18} color="white" />
              </Pressable>
              <Text style={styles.stepperQuantity}>{quantity}</Text>
              <Pressable onPress={onIncrement} style={({ pressed }) => [styles.stepperButton, styles.stepperButtonRight, pressed && styles.pressed]}>
                <Ionicons name="add" size={18} color="white" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <View style={styles.menuBody}>
        <View style={styles.menuTitleRow}>
          <View style={styles.menuTextBlock}>
            <Text numberOfLines={2} style={styles.menuItemName}>{item.name || 'Menu Item'}</Text>
            <Text style={styles.menuItemMeta}>{item.category || 'Menu Item'}{item.cuisine ? ` - ${item.cuisine}` : ''}</Text>
          </View>
          <Text style={styles.menuItemPrice}>{formatPrice(item.price || 0)}</Text>
        </View>

        {item.description ? (
          <Text numberOfLines={2} style={styles.menuItemDescription}>{item.description}</Text>
        ) : null}

        {tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagPillText}>{formatTag(tag)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function getRestaurantId(restaurant: Restaurant) {
  return restaurant.id || restaurant._id || restaurant.name || '';
}

function getMenuItemId(item: MenuItem) {
  return item.id || item._id || item.name || String(Math.random());
}

function getDietaryTags(item: MenuItem) {
  const tags = item.dietaryPreferences || item.preferences || item.dietaryTags || item.dietary || [];
  return Array.isArray(tags) ? tags.filter(Boolean) : [];
}

function formatTag(tag: string) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDay(day: DayId) {
  return daysOfWeek.find((item) => item.id === day)?.label || day;
}

function formatMealType(mealType: MealType) {
  return mealTypes.find((item) => item.id === mealType)?.label || mealType;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function getDayDateLabel(day: DayId) {
  const start = getNextSunday();
  const dayIndex = sheetDayOrder.indexOf(day);
  start.setDate(start.getDate() + Math.max(dayIndex, 0));
  return formatShortDate(start);
}

function getDayDateNumber(day: DayId) {
  const start = getNextSunday();
  const dayIndex = sheetDayOrder.indexOf(day);
  start.setDate(start.getDate() + Math.max(dayIndex, 0));
  return start.getDate().toString();
}

function getNextSunday() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysUntilSunday = (7 - start.getDay()) % 7 || 7;
  start.setDate(start.getDate() + daysUntilSunday);
  return start;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    // Extra padding at the bottom so the scrollable content isn't hidden by the footer
    paddingBottom: 150, 
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: theme.spacing[3],
    color: theme.colors.text.muted,
    fontSize: theme.typography.fontSize.sm,
  },
  emptyTitle: {
    color: theme.colors.text.heading,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  emptyCopy: {
    marginTop: theme.spacing[2],
    color: theme.colors.text.muted,
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.base,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 48,
    marginTop: theme.spacing[6],
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[8],
    ...theme.shadow.sm,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  // 1. Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  planSummary: {
    flex: 1,
    alignItems: 'center',
  },
  planSummaryText: {
    color: theme.colors.text.body,
    fontSize: 14,
    fontWeight: '600',
  },
  optionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsMenu: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    ...theme.shadow.md,
    padding: 8,
    position: 'absolute',
    top: 65,
    right: 0,
    zIndex: 100,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  optionText: {
    color: theme.colors.text.body,
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextRed: {
    color: theme.colors.red[600],
    fontSize: 14,
    fontWeight: '500',
  },

  // Section Containers
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
  },

  // 2. Week Toggler Section
  weekCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    ...theme.shadow.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  weekCardTextContainer: {
    gap: 2,
  },
  weekCardWeekText: {
    color: theme.colors.brand.grubRed,
    fontSize: 16,
    fontWeight: '700',
  },
  weekCardMealText: {
    color: theme.colors.text.muted,
    fontSize: 12,
  },
  planWeek2Button: {
    width: '100%',
    height: 40,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.brand.grubRed,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  planWeek2ButtonText: {
    color: theme.colors.brand.grubRed,
    fontSize: 14,
    fontWeight: '600',
  },
  weekDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  weekDateText: {
    color: theme.colors.text.muted,
    fontSize: 12,
  },

  // 3. Restaurant & Action Buttons
  restaurantSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  restaurantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  forkIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.brand.grubRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantHeaderText: {
    color: theme.colors.text.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  restaurantPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  restaurantPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restaurantPill: {
    backgroundColor: theme.colors.brand.grubRed,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restaurantPillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantSeparator: {
    color: theme.colors.text.muted,
    fontSize: 12,
  },
  restaurantHelperText: {
    color: theme.colors.text.muted,
    fontSize: 11,
    marginBottom: 12,
  },
  // Side-by-side action buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  grubPassButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  grubPassButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  changeRestaurantButton: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  changeRestaurantButtonText: {
    color: theme.colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // 4. Refined Day Slider
  daySliderWrapper: {
    marginBottom: 24,
  },
  daySliderContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  dayTab: {
    width: 52,
    height: 70,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  dayTabActive: {
    backgroundColor: theme.colors.brand.grubRed,
    borderColor: theme.colors.brand.grubRed,
    ...theme.shadow.sm,
  },
  dayTabDayText: {
    color: theme.colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayTabDayTextActive: {
    color: 'white',
  },
  dayTabDateText: {
    color: theme.colors.text.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  dayTabDateTextActive: {
    color: 'white',
  },
  dayTabIndicatorDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.green[500],
  },

  // 5. Meal Slots
  mealSlotsContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  mealSlotContainer: {
    gap: 12,
  },
  mealSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTypeIcon: {
    fontSize: 20,
  },
  mealTypeHeaderText: {
    color: theme.colors.text.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  mealCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealCountBadgeActive: {
    backgroundColor: theme.colors.green[100],
  },
  mealCountBadgeInactive: {
    backgroundColor: theme.colors.gray[100],
  },
  mealCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mealCountBadgeTextActive: {
    color: theme.colors.green[800],
  },
  mealCountBadgeTextInactive: {
    color: theme.colors.text.muted,
  },
  emptyMealCard: {
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyMealText: {
    color: theme.colors.text.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  filledMealCard: {
    borderWidth: 1.5,
    borderColor: theme.colors.green[500],
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    padding: 16,
    gap: 12,
    ...theme.shadow.sm,
  },
  filledMealTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restaurantNameText: {
    color: theme.colors.brand.grubRed,
    fontSize: 13,
    fontWeight: '600',
  },
  removeMealButton: {
    padding: 2,
  },
  removeMealButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.red[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledMealMiddleRow: {
    gap: 2,
  },
  mealNameText: {
    color: theme.colors.text.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  mealPriceText: {
    color: theme.colors.text.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  filledMealBottomRow: {
    gap: 6,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  plannedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.green[600],
  },
  plannedBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  helperText: {
    color: theme.colors.green[700],
    fontSize: 11,
  },
  pressed: {
    opacity: 0.8,
  },

  // 6. Docked Footer
  dockedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    zIndex: 50,
  },
  reviewButton: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.brand.grubRed,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // Meal Picker Sheet
  mealPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
    justifyContent: 'flex-end',
  },
  mealPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mealPickerSheet: {
    zIndex: 1,
    height: '78%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    ...theme.shadow.lg,
  },
  mealPickerHandle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gray[300],
    marginTop: 8,
    marginBottom: 8,
  },
  mealPickerHeader: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  mealPickerTitleBlock: {
    flex: 1,
  },
  mealPickerTitle: {
    color: theme.colors.gray[900],
    fontSize: 16,
    fontWeight: '700',
  },
  mealPickerSubtitle: {
    marginTop: 2,
    color: theme.colors.gray[500],
    fontSize: 12,
  },
  mealPickerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[100],
  },
  dayChipScrollView: {
    flexGrow: 0,
    flexShrink: 0,
    height: 74,
    maxHeight: 74,
  },
  dayChipScroller: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  dayChip: {
    minWidth: 64,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
  },
  dayChipActive: {
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: theme.colors.brand.grubRed,
  },
  dayChipLabel: {
    color: theme.colors.gray[800],
    fontSize: 11,
    fontWeight: '700',
  },
  dayChipLabelActive: {
    color: theme.colors.white,
  },
  dayChipDate: {
    marginTop: 2,
    color: theme.colors.gray[500],
    fontSize: 10,
    lineHeight: 12,
  },
  dayChipDateActive: {
    color: theme.colors.white,
  },
  sheetDivider: {
    flexShrink: 0,
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.border.default,
  },
  restaurantTabsLabel: {
    flexShrink: 0,
    marginTop: 16,
    marginLeft: 16,
    color: theme.colors.gray[700],
    fontSize: 13,
    fontWeight: '500',
  },
  restaurantTabRow: {
    flexShrink: 0,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  restaurantArrowButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  restaurantTabScroller: {
    flex: 1,
    gap: 8,
  },
  restaurantTabActive: {
    minWidth: 120,
    minHeight: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: 16,
    ...theme.shadow.sm,
  },
  restaurantTab: {
    minWidth: 120,
    minHeight: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
  },
  restaurantTabActiveText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  restaurantTabText: {
    color: theme.colors.gray[700],
    fontSize: 12,
    fontWeight: '600',
  },
  mealPickerBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  foodPreferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[50],
    marginBottom: 12,
  },
  foodPreferenceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodPreferenceTextBlock: {
    flex: 1,
  },
  foodPreferenceTitle: {
    color: theme.colors.gray[900],
    fontSize: 14,
    fontWeight: '700',
  },
  foodPreferenceCopy: {
    color: theme.colors.gray[500],
    fontSize: 11,
    marginTop: 2,
  },
  foodPreferenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  foodPreferenceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
  },
  foodPreferenceChipText: {
    color: theme.colors.gray[800],
    fontSize: 12,
    fontWeight: '500',
  },
  sheetMenuHeader: {
    marginBottom: 12,
  },
  sheetMenuTitleBlock: {
  },
  sheetMenuTitle: {
    color: theme.colors.gray[900],
    fontSize: 16,
    fontWeight: '700',
  },
  sheetMenuSubtitle: {
    color: theme.colors.gray[600],
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingMenuText: {
    marginTop: 8,
    color: theme.colors.gray[600],
    fontSize: 12,
  },
  menuCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    ...theme.shadow.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  imageContainer: {
    position: 'relative',
  },
  menuImage: {
    width: '100%',
    height: 140,
  },
  floatingStepperContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  addButtonPill: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    ...theme.shadow.sm,
  },
  addButtonText: {
    color: theme.colors.green[600],
    fontSize: 14,
    fontWeight: '700',
  },
  stepperPill: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    ...theme.shadow.sm,
    padding: 4,
    gap: 12,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonLeft: {
    backgroundColor: theme.colors.brand.grubRed,
  },
  stepperButtonRight: {
    backgroundColor: theme.colors.green[600],
  },
  stepperQuantity: {
    color: theme.colors.gray[900],
    fontSize: 16,
    fontWeight: '700',
  },
  menuBody: {
    padding: 12,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuItemName: {
    color: theme.colors.gray[900],
    fontSize: 15,
    fontWeight: '700',
  },
  menuItemMeta: {
    marginTop: 2,
    color: theme.colors.gray[500],
    fontSize: 11,
    fontWeight: '500',
  },
  menuItemPrice: {
    color: theme.colors.brand.grubRed,
    fontSize: 16,
    fontWeight: '700',
  },
  menuItemDescription: {
    marginTop: 8,
    color: theme.colors.gray[600],
    fontSize: 12,
    lineHeight: 18,
  },
  tagRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    borderRadius: 12,
    backgroundColor: theme.colors.green[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagPillText: {
    color: theme.colors.green[800],
    fontSize: 10,
    fontWeight: '500',
  },
  addButton: {
    minHeight: 40,
    marginTop: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  replacementModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 70,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  replacementModalSheet: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    ...theme.shadow.lg,
  },
  replacementModalHandle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gray[300],
    marginTop: 8,
    marginBottom: 8,
  },
  replacementModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  replacementModalTitle: {
    color: theme.colors.gray[900],
    fontSize: 18,
    fontWeight: '700',
  },
  replacementModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[100],
  },
  replacementModalBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  replacementInstruction: {
    color: theme.colors.gray[700],
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
  },
  legendBoxSelected: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.brand.grubRed,
  },
  legendText: {
    color: theme.colors.gray[600],
    fontSize: 12,
  },
  restaurantList: {
    gap: 12,
  },
  removalRestaurantCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.white,
    padding: 12,
  },
  removalRestaurantCardSelected: {
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: theme.colors.red[50],
  },
  removalRestaurantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  removalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  removalCheckboxSelected: {
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: theme.colors.brand.grubRed,
  },
  removalRestaurantTextBlock: {
    flex: 1,
  },
  removalRestaurantName: {
    color: theme.colors.gray[900],
    fontSize: 14,
    fontWeight: '700',
  },
  removalRestaurantCuisine: {
    color: theme.colors.gray[600],
    fontSize: 12,
    marginTop: 2,
  },
  mealCountBadgeSelected: {
    backgroundColor: theme.colors.white,
  },
  mealCountBadgeSelectedText: {
    color: theme.colors.brand.grubRed,
  },
  willDeleteText: {
    marginTop: 4,
    color: theme.colors.red[700],
    fontSize: 11,
    fontWeight: '600',
  },
  addStepTitle: {
    color: theme.colors.gray[900],
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  addStepCopy: {
    marginTop: 8,
    color: theme.colors.gray[600],
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  browseRestaurantsButton: {
    marginTop: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.brand.grubRed,
    padding: 16,
    ...theme.shadow.sm,
  },
  browseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseTextBlock: {
    flex: 1,
  },
  browseTitle: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  browseCopy: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  remainingSection: {
    marginTop: 20,
  },
  currentRestaurantsLabel: {
    color: theme.colors.gray[700],
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  remainingRestaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[50],
    marginBottom: 8,
  },
  remainingCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.green[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingTextBlock: {
    flex: 1,
  },
  remainingRestaurantName: {
    color: theme.colors.gray[900],
    fontSize: 14,
    fontWeight: '700',
  },
  remainingStatus: {
    color: theme.colors.gray[600],
    fontSize: 12,
    marginTop: 2,
  },
  replacementActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  replacementCancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  replacementCancelText: {
    color: theme.colors.gray[700],
    fontSize: 14,
    fontWeight: '700',
  },
  replacementRemoveButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replacementRemoveButtonActive: {
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.sm,
  },
  replacementRemoveButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
  },
  replacementRemoveText: {
    fontSize: 14,
    fontWeight: '700',
  },
  replacementRemoveTextDisabled: {
    color: theme.colors.gray[400],
  },
});