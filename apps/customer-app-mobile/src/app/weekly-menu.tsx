import { router } from 'expo-router';
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
} from 'react-native';
import { useFlash } from '../contexts/FlashContext';
import {
  daysOfWeek,
  mealTypes,
  type DayId,
  type MealType,
  type PlannedMealItem,
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

export default function WeeklyMenuScreen() {
  const {
    selectedRestaurantId,
    selectedRestaurantName,
    selectedRestaurantData,
    selectedRestaurants,
    maxRestaurants,
    hasHydrated,
    setSelectedRestaurant,
    addItemToPlan,
    removeItemFromPlan,
    clearSlot,
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
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isWeek2Enabled, setIsWeek2Enabled] = useState(false);
  const [showRestaurantReplacementModal, setShowRestaurantReplacementModal] = useState(false);
  const [showMealPickerSheet, setShowMealPickerSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const restaurantId = selectedRestaurantId || '';

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

  const restaurantDisplayName = restaurant?.name || selectedRestaurantName || 'Selected Restaurant';
  const totalItems = getTotalItems();
  const totalCost = getTotalCost();
  const averageCost = totalItems > 0 ? totalCost / totalItems : 0;
  const week1Items = totalItems;
  const week2Items = 0;
  const isGrubPassUser = Boolean(user?.isGrubPass);
  const restaurantLimitReached = !isGrubPassUser &&
    typeof maxRestaurants === 'number' &&
    selectedRestaurants.length >= maxRestaurants;
  const selectedRestaurantNames = selectedRestaurants.length > 0
    ? selectedRestaurants.map((item) => item.restaurantName).filter(Boolean)
    : [restaurantDisplayName];

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

  const handleAddRestaurant = () => {
    router.push('/plan/restaurants?source=plan');
  };

  const handleChangeRestaurant = () => {
    if (selectedRestaurants.length === 0) {
      router.push('/plan/restaurants?source=plan');
      return;
    }

    setShowRestaurantReplacementModal(true);
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

  const handleEnableWeek2 = () => {
    setIsWeek2Enabled(true);
    setSelectedWeek(1);
    showFlash('Week 2 enabled. You can now plan meals for Week 2 as well.', 'info');
  };

  if (!hasHydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.brand.grubRed} />
        <Text style={styles.loadingText}>Loading weekly menu...</Text>
      </View>
    );
  }

  if (!restaurantId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Select a Restaurant First</Text>
        <Text style={styles.emptyCopy}>Choose a restaurant before building your weekly menu.</Text>
        <Pressable onPress={() => router.replace('/plan')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Find Restaurants</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBand}>
          <Text style={styles.title}>Your Weekly Menu</Text>
          <Text style={styles.copy}>Plan your perfect week with delicious meals</Text>

          <View style={styles.heroStatsRow}>
            <HeroStatTile label="Total Meals" value={String(totalItems)} footer="Both Weeks" />
            <HeroStatTile label="Est. Cost" value={formatPrice(totalCost)} footer="Both Weeks" highlight />
          </View>
        </View>

        <View style={styles.weekSelectorSection}>
          <View style={styles.weekSelectorCard}>
            <Text style={styles.weekIcon}>□</Text>
            <Text style={styles.weekTitle}>Week {selectedWeek + 1}</Text>
            <Text style={styles.weekMealCount}>
              {selectedWeek === 0 ? totalItems : 0} meal{(selectedWeek === 0 ? totalItems : 0) === 1 ? '' : 's'}
            </Text>
          </View>

          {!isWeek2Enabled ? (
            <Pressable onPress={handleEnableWeek2} style={({ pressed }) => [styles.planWeekButton, pressed && styles.pressed]}>
              <Text style={styles.planWeekButtonText}>Plan Week 2 as well</Text>
            </Pressable>
          ) : (
            <View style={styles.twoWeekTabs}>
              <Pressable onPress={() => setSelectedWeek(0)} style={({ pressed }) => [selectedWeek === 0 ? styles.weekTabActive : styles.weekTab, pressed && styles.pressed]}>
                <Text style={selectedWeek === 0 ? styles.weekTabActiveText : styles.weekTabText}>Week 1</Text>
              </Pressable>
              <Pressable onPress={() => setSelectedWeek(1)} style={({ pressed }) => [selectedWeek === 1 ? styles.weekTabActive : styles.weekTab, pressed && styles.pressed]}>
                <Text style={selectedWeek === 1 ? styles.weekTabActiveText : styles.weekTabText}>Week 2</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.weekDateRow}>
            <Text style={styles.weekDateIcon}>□</Text>
            <Text style={styles.weekDateText}>Week {selectedWeek + 1}: {getWeekDateRange(selectedWeek)}</Text>
          </View>
        </View>

        <View style={styles.restaurantPanel}>
          <View style={styles.restaurantHeader}>
            <View style={styles.restaurantAvatar}>
              <Text style={styles.restaurantAvatarText}>M</Text>
            </View>
            <View style={styles.restaurantTextBlock}>
              <Text style={styles.restaurantMetaTitle}>Planning meals from</Text>
              <View style={styles.restaurantChipRow}>
                {selectedRestaurantNames.map((name, index) => (
                  <View key={`${name}-${index}`} style={styles.restaurantNameChip}>
                    <Text numberOfLines={1} style={styles.restaurantNameChipText}>{name}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.restaurantMeta}>Click any empty slot to add meals • Restaurant</Text>
            </View>
          </View>

          {restaurantLimitReached ? (
            <Pressable
              onPress={() => showFlash('Upgrade to Grub Pass to add more restaurants.', 'info')}
              style={({ pressed }) => [styles.grubPassButton, pressed && styles.pressed]}
            >
              <Text style={styles.grubPassButtonText}>♙  More restaurants • Grub Pass</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleAddRestaurant} style={({ pressed }) => [styles.addRestaurantButton, pressed && styles.pressed]}>
              <Text style={styles.addRestaurantButtonText}>+  Add Restaurant</Text>
            </Pressable>
          )}

          <Pressable onPress={handleChangeRestaurant} style={({ pressed }) => [styles.changeRestaurantButton, pressed && styles.pressed]}>
            <Text style={styles.changeRestaurantButtonText}>↔  Change Restaurant</Text>
          </Pressable>
        </View>

        {errorMessage ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {totalItems > 0 ? (
          <Pressable onPress={clearWeek} style={({ pressed }) => [styles.clearWeekButton, pressed && styles.pressed]}>
            <Text style={styles.clearWeekButtonText}>♧  Clear All from Week {selectedWeek + 1}</Text>
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Week {selectedWeek + 1} Menu</Text>
          <Text style={styles.sectionDate}>{getWeekDateRange(selectedWeek)}</Text>
        </View>

        <View style={styles.weekGrid}>
          {daysOfWeek.map((day) => (
            <View key={day.id} style={styles.dayBlock}>
              <Text style={styles.dayLabel}>{day.label}</Text>
              <View style={styles.slotRow}>
                {mealTypes.map((mealType) => {
                  const items = getMealItems(day.id, mealType.id);
                  const active = activeDay === day.id && activeMealType === mealType.id;

                  return (
                    <MealSlot
                      key={`${day.id}-${mealType.id}`}
                      day={day.id}
                      mealType={mealType.id}
                      label={mealType.label}
                      items={items}
                      active={active}
                      onPress={() => handleSlotPress(day.id, mealType.id)}
                      onRemove={(planId) => removeItemFromPlan(planId, day.id, mealType.id)}
                      onClear={() => clearSlot(day.id, mealType.id)}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <BiWeeklySummaryCard
          totalMeals={totalItems}
          estimatedCost={totalCost}
          averageCost={averageCost}
          week1Meals={week1Items}
          week2Meals={week2Items}
        />

        <QuickActionsCard
          hasMeals={totalItems > 0}
          onViewCalendar={() => {
            if (totalItems === 0) return;
            router.push('/meal-calendar?includeWeek2=0');
          }}
        />
      </ScrollView>

      {showMealPickerSheet ? (
        <MealPickerSheet
          activeDay={activeDay}
          activeMealType={activeMealType}
          activeRestaurantId={restaurantId}
          restaurantName={restaurantDisplayName}
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
      ) : null}

      <RestaurantReplacementModal
        isVisible={showRestaurantReplacementModal}
        selectedRestaurants={selectedRestaurants}
        getItemCountForRestaurant={getItemCountForRestaurant}
        onClose={() => setShowRestaurantReplacementModal(false)}
        onConfirmRemove={handleConfirmRestaurantReplacement}
      />
    </View>
  );
}

function HeroStatTile({ label, value, footer, highlight = false }: { label: string; value: string; footer: string; highlight?: boolean }) {
  return (
    <View style={styles.heroStatTile}>
      <Text style={styles.heroStatLabel}>{label}</Text>
      <Text style={[styles.heroStatValue, highlight && styles.heroStatValueHighlight]}>{value}</Text>
      <Text style={styles.heroStatFooter}>{footer}</Text>
    </View>
  );
}

function BiWeeklySummaryCard({
  totalMeals,
  estimatedCost,
  averageCost,
  week1Meals,
  week2Meals,
}: {
  totalMeals: number;
  estimatedCost: number;
  averageCost: number;
  week1Meals: number;
  week2Meals: number;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Bi-Weekly Summary</Text>
        <View style={styles.summaryIconBubble}>
          <Text style={styles.summaryIconText}>▥</Text>
        </View>
      </View>

      <View style={styles.summaryMetricNeutral}>
        <View>
          <Text style={styles.summaryMetricLabel}>Total Meals</Text>
          <Text style={styles.summaryMetricHint}>Both weeks combined</Text>
        </View>
        <Text style={styles.summaryMetricValue}>{totalMeals}</Text>
      </View>

      <View style={styles.summaryMetricGreen}>
        <View>
          <Text style={styles.summaryMetricLabel}>Estimated Cost</Text>
          <Text style={styles.summaryMetricHintGreen}>Both weeks combined</Text>
        </View>
        <Text style={styles.summaryMetricValueGreen}>{formatPrice(estimatedCost)}</Text>
      </View>

      <View style={styles.summaryMetricBlue}>
        <View>
          <Text style={styles.summaryMetricLabel}>Avg per Meal</Text>
          <Text style={styles.summaryMetricHintBlue}>Cost efficiency</Text>
        </View>
        <Text style={styles.summaryMetricValueBlue}>{formatPrice(averageCost)}</Text>
      </View>

      <View style={styles.summaryWeekRow}>
        <View style={styles.summaryWeekOne}>
          <Text style={styles.summaryWeekOneValue}>{week1Meals}</Text>
          <Text style={styles.summaryWeekOneLabel}>Week 1 Meals</Text>
        </View>
        <View style={styles.summaryWeekTwo}>
          <Text style={styles.summaryWeekTwoValue}>{week2Meals}</Text>
          <Text style={styles.summaryWeekTwoLabel}>Week 2 Meals</Text>
        </View>
      </View>
    </View>
  );
}

function QuickActionsCard({ hasMeals, onViewCalendar }: { hasMeals: boolean; onViewCalendar: () => void }) {
  return (
    <View style={styles.quickActionsCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Quick Actions</Text>
        <View style={styles.quickIconBubble}>
          <Text style={styles.quickIconText}>ϟ</Text>
        </View>
      </View>

      <Pressable
        disabled={!hasMeals}
        onPress={onViewCalendar}
        style={({ pressed }) => [
          styles.calendarAction,
          hasMeals && styles.calendarActionEnabled,
          pressed && hasMeals && styles.pressed,
        ]}
      >
        <View style={styles.calendarIcon}>
          <Text style={styles.calendarIconText}>H</Text>
        </View>
        <View style={styles.calendarActionTextBlock}>
          <Text style={[styles.calendarActionTitle, hasMeals && styles.calendarActionTitleEnabled]}>
            {hasMeals ? 'View meal calendar' : 'Plan meals to view calendar'}
          </Text>
          <Text style={styles.calendarActionCopy}>
            {hasMeals ? 'Review your planned meals by date' : 'Add meals to your weekly plan first'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

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
  selectedRestaurants: Array<{ restaurantId: string; restaurantName: string }>;
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
    : [{ restaurantId: 'selected', restaurantName }];
  const activeRestaurantIndex = Math.max(
    0,
    restaurantTabs.findIndex((restaurant) => restaurant.restaurantId === activeRestaurantId),
  );

  const handleRestaurantStep = (direction: -1 | 1) => {
    if (restaurantTabs.length <= 1) return;
    const nextIndex = (activeRestaurantIndex + direction + restaurantTabs.length) % restaurantTabs.length;
    onRestaurantChange(restaurantTabs[nextIndex].restaurantId);
  };

  return (
    <View style={styles.mealPickerOverlay}>
      <Pressable onPress={onClose} style={styles.mealPickerBackdrop} />
      <View style={styles.mealPickerSheet}>
        <View style={styles.mealPickerHandle} />

        <View style={styles.mealPickerHeader}>
          <View style={styles.mealPickerTitleBlock}>
            <Text style={styles.mealPickerTitle}>{formatDay(activeDay)} {formatMealType(activeMealType).toLowerCase()}</Text>
            <Text style={styles.mealPickerSubtitle}>{restaurantName}</Text>
          </View>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.mealPickerClose, pressed && styles.pressed]}>
            <Text style={styles.mealPickerCloseText}>x</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayChipScrollView}
          contentContainerStyle={styles.dayChipScroller}
        >
          {sheetDayOrder.map((day) => {
            const active = day === activeDay;
            const dayInfo = daysOfWeek.find((item) => item.id === day);

            return (
              <Pressable
                key={day}
                onPress={() => onDayChange(day)}
                style={({ pressed }) => [styles.dayChip, active && styles.dayChipActive, pressed && styles.pressed]}
              >
                <Text style={[styles.dayChipLabel, active && styles.dayChipLabelActive]}>{dayInfo?.label || day}</Text>
                <Text style={[styles.dayChipDate, active && styles.dayChipDateActive]}>{getDayDateLabel(day)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sheetDivider} />

        <Text style={styles.restaurantTabsLabel}>Restaurants</Text>
        <View style={styles.restaurantTabRow}>
          <Pressable
            onPress={() => handleRestaurantStep(-1)}
            disabled={restaurantTabs.length <= 1}
            style={({ pressed }) => [
              styles.restaurantArrowButton,
              restaurantTabs.length <= 1 && styles.restaurantArrowButtonDisabled,
              pressed && restaurantTabs.length > 1 && styles.pressed,
            ]}
          >
            <Text style={styles.restaurantArrowButtonText}>{'<'}</Text>
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantTabScroller}>
            {restaurantTabs.map((restaurant, index) => {
              const active = restaurant.restaurantId === activeRestaurantId || (activeRestaurantId === '' && index === 0);

              return (
                <Pressable
                  key={restaurant.restaurantId || `${restaurant.restaurantName}-${index}`}
                  onPress={() => onRestaurantChange(restaurant.restaurantId)}
                  style={({ pressed }) => [active ? styles.restaurantTabActive : styles.restaurantTab, pressed && styles.pressed]}
                >
                  <Text numberOfLines={1} style={active ? styles.restaurantTabActiveText : styles.restaurantTabText}>
                    {restaurant.restaurantName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => handleRestaurantStep(1)}
            disabled={restaurantTabs.length <= 1}
            style={({ pressed }) => [
              styles.restaurantArrowButton,
              restaurantTabs.length <= 1 && styles.restaurantArrowButtonDisabled,
              pressed && restaurantTabs.length > 1 && styles.pressed,
            ]}
          >
            <Text style={styles.restaurantArrowButtonText}>{'>'}</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.mealPickerBody} contentContainerStyle={styles.mealPickerBodyContent} showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => setShowPreferenceOptions((current) => !current)}
            style={({ pressed }) => [styles.foodPreferenceCard, pressed && styles.pressed]}
          >
            <View style={styles.foodPreferenceIcon}>
              <Text style={styles.foodPreferenceIconText}>o</Text>
            </View>
            <View style={styles.foodPreferenceTextBlock}>
              <Text style={styles.foodPreferenceTitle}>Food Preferences</Text>
              <Text style={styles.foodPreferenceCopy}>Tap to select your dietary preferences and filter menu items</Text>
            </View>
            <Text style={styles.foodPreferenceChevron}>{showPreferenceOptions ? '^' : '>'}</Text>
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
            <View style={styles.sheetMenuIcon}>
              <Text style={styles.sheetMenuIconText}>M</Text>
            </View>
            <View style={styles.sheetMenuTitleBlock}>
              <Text style={styles.sheetMenuTitle}>Menu Items</Text>
              <Text style={styles.sheetMenuSubtitle}>({menuItems.length} items available)</Text>
            </View>
            <View style={styles.clickToAddPill}>
              <Text style={styles.clickToAddText}>Click + to add</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.sheetLoading}>
              <ActivityIndicator color={theme.colors.brand.grubRed} />
              <Text style={styles.loadingText}>Loading menu items...</Text>
            </View>
          ) : menuItems.length === 0 ? (
            <View style={styles.emptyMenuPanel}>
              <Text style={styles.emptyMenuText}>No menu items available for this restaurant.</Text>
            </View>
          ) : (
            <View style={styles.sheetMenuList}>
              {menuItems.map((item) => (
                <MealPickerMenuCard key={getMenuItemId(item)} item={item} onAdd={() => onAddItem(item)} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function MealPickerMenuCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const image = item.image || item.imageUrl;

  return (
    <View style={styles.sheetMenuCard}>
      {image ? (
        <Image source={{ uri: image }} defaultSource={fallbackFoodImage} style={styles.sheetMenuImage} />
      ) : (
        <Image source={fallbackFoodImage} style={styles.sheetMenuImage} />
      )}

      <Pressable onPress={onAdd} style={({ pressed }) => [styles.sheetAddButton, pressed && styles.pressed]}>
        <Text style={styles.sheetAddButtonText}>+</Text>
      </Pressable>

      <View style={styles.sheetPriceBadge}>
        <Text style={styles.sheetPriceText}>{formatPrice(item.price || 0)}</Text>
      </View>

      <View style={styles.sheetRatingPill}>
        <Text style={styles.sheetRatingText}>*****</Text>
      </View>

      <View style={styles.sheetMenuCardBody}>
        <Text numberOfLines={1} style={styles.sheetMenuItemName}>{item.name || 'Menu Item'}</Text>
        {item.category ? (
          <View style={styles.sheetCategoryPill}>
            <Text style={styles.sheetCategoryText}>{item.category}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

type ReplacementRestaurant = {
  restaurantId: string;
  restaurantName: string;
  restaurantData?: Restaurant | null;
  addedAt?: string | Date;
};

function RestaurantReplacementModal({
  isVisible,
  selectedRestaurants,
  getItemCountForRestaurant,
  onClose,
  onConfirmRemove,
}: {
  isVisible: boolean;
  selectedRestaurants: ReplacementRestaurant[];
  getItemCountForRestaurant: (restaurantId: string) => number;
  onClose: () => void;
  onConfirmRemove: (restaurantsToRemove: ReplacementRestaurant[]) => void;
}) {
  const [modalStep, setModalStep] = useState<'remove' | 'add'>('remove');
  const [selectedToRemove, setSelectedToRemove] = useState<ReplacementRestaurant[]>([]);
  const [removedRestaurants, setRemovedRestaurants] = useState<ReplacementRestaurant[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    setModalStep('remove');
    setSelectedToRemove([]);
    setRemovedRestaurants([]);
    setIsRemoving(false);
  }, [isVisible]);

  if (!isVisible || selectedRestaurants.length === 0) return null;

  const toggleRestaurantSelection = (restaurant: ReplacementRestaurant) => {
    setSelectedToRemove((current) => {
      const selected = current.some((item) => item.restaurantId === restaurant.restaurantId);
      if (selected) {
        return current.filter((item) => item.restaurantId !== restaurant.restaurantId);
      }

      return [...current, restaurant];
    });
  };

  const handleRemoveRestaurants = () => {
    if (selectedToRemove.length === 0 || isRemoving) return;

    setIsRemoving(true);
    const restaurantsToRemove = [...selectedToRemove];
    setRemovedRestaurants(restaurantsToRemove);
    onConfirmRemove(restaurantsToRemove);

    setTimeout(() => {
      setSelectedToRemove([]);
      setModalStep('add');
      setIsRemoving(false);
    }, 450);
  };

  const remainingRestaurants = selectedRestaurants.filter((restaurant) => (
    !removedRestaurants.some((removed) => removed.restaurantId === restaurant.restaurantId)
  ));

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.replacementBackdrop}>
        <View style={styles.replacementModal}>
          <View style={styles.replacementHeader}>
            <View style={styles.replacementHeaderIcon}>
              <Text style={styles.replacementHeaderIconText}>↔</Text>
            </View>
            <Text style={styles.replacementTitle}>
              {modalStep === 'remove' ? 'Remove Restaurant' : 'Add New Restaurant'}
            </Text>
            <Text style={styles.replacementSubtitle}>
              {modalStep === 'remove'
                ? 'Step 1: Select restaurants to remove from your meal plan'
                : 'Step 2: Choose a new restaurant for your meal plan'}
            </Text>
          </View>

          <View style={styles.replacementBody}>
            {modalStep === 'remove' ? (
              <>
                <Text style={styles.maxReachedText}>You have reached the maximum of 2 restaurants.</Text>
                <Text style={styles.instructionText}>
                  ☑ Check the restaurants below that you want to remove:
                </Text>

                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={styles.legendBox} />
                    <Text style={styles.legendText}>Not selected</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendBoxSelected}>
                      <Text style={styles.legendCheck}>✓</Text>
                    </View>
                    <Text style={styles.legendSelectedText}>Selected for removal</Text>
                  </View>
                </View>

                <Text style={styles.currentRestaurantsLabel}>Current Restaurants:</Text>
                <View style={styles.restaurantRemovalList}>
                  {selectedRestaurants.map((restaurant) => {
                    const itemCount = getItemCountForRestaurant(restaurant.restaurantId);
                    const selected = selectedToRemove.some((item) => item.restaurantId === restaurant.restaurantId);
                    const restaurantData = restaurant.restaurantData;
                    const cuisine = Array.isArray(restaurantData?.cuisine)
                      ? restaurantData?.cuisine.join(', ')
                      : restaurantData?.cuisine;

                    return (
                      <Pressable
                        key={restaurant.restaurantId}
                        onPress={() => toggleRestaurantSelection(restaurant)}
                        style={({ pressed }) => [
                          styles.removalRestaurantCard,
                          selected && styles.removalRestaurantCardSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={[styles.removalCheckbox, selected && styles.removalCheckboxSelected]}>
                          {selected ? <Text style={styles.removalCheckboxText}>✓</Text> : null}
                        </View>

                        <View style={styles.removalRestaurantInfo}>
                          <View style={styles.removalRestaurantTitleRow}>
                            <Text
                              numberOfLines={1}
                              style={[styles.removalRestaurantName, selected && styles.removalRestaurantNameSelected]}
                            >
                              {restaurant.restaurantName}
                            </Text>
                            {selected ? (
                              <View style={styles.toRemoveBadge}>
                                <Text style={styles.toRemoveBadgeText}>To remove</Text>
                              </View>
                            ) : null}
                          </View>
                          {cuisine ? (
                            <Text numberOfLines={1} style={styles.removalRestaurantCuisine}>{cuisine}</Text>
                          ) : null}
                          <View style={[styles.mealCountBadge, selected && itemCount > 0 && styles.mealCountBadgeSelected]}>
                            <Text style={[styles.mealCountBadgeText, selected && itemCount > 0 && styles.mealCountBadgeSelectedText]}>
                              {itemCount} meal{itemCount === 1 ? '' : 's'}
                            </Text>
                          </View>
                          {selected && itemCount > 0 ? (
                            <Text style={styles.willDeleteText}>Will be deleted</Text>
                          ) : null}
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
                    <Text style={styles.browseIconText}>+</Text>
                  </View>
                  <View style={styles.browseTextBlock}>
                    <Text style={styles.browseTitle}>Browse Restaurants</Text>
                    <Text style={styles.browseCopy}>Click to explore restaurants near you</Text>
                  </View>
                  <Text style={styles.browseArrow}>{'>'}</Text>
                </Pressable>

                {remainingRestaurants.length > 0 ? (
                  <View style={styles.remainingSection}>
                    <Text style={styles.currentRestaurantsLabel}>
                      {remainingRestaurants.length === 1 ? 'Your Remaining Restaurant' : 'Your Remaining Restaurants'}
                    </Text>
                    {remainingRestaurants.map((restaurant) => (
                      <View key={restaurant.restaurantId} style={styles.remainingRestaurantCard}>
                        <View style={styles.remainingCheck}>
                          <Text style={styles.remainingCheckText}>✓</Text>
                        </View>
                        <View style={styles.remainingTextBlock}>
                          <Text style={styles.remainingRestaurantName}>{restaurant.restaurantName}</Text>
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
              <Text style={styles.replacementCancelText}>Cancel</Text>
            </Pressable>

            {modalStep === 'remove' ? (
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
            ) : (
              <Pressable onPress={onClose} style={({ pressed }) => [styles.replacementDoneButton, pressed && styles.pressed]}>
                <Text style={styles.replacementDoneText}>Done</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MealSlot({
  label,
  items,
  active,
  onPress,
  onRemove,
  onClear,
}: {
  day: DayId;
  mealType: MealType;
  label: string;
  items: PlannedMealItem[];
  active: boolean;
  onPress: () => void;
  onRemove: (planId: string) => void;
  onClear: () => void;
}) {
  const firstItem = items[0];
  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mealSlot, active && styles.mealSlotActive, pressed && styles.pressed]}>
      <View style={styles.mealSlotTop}>
        <Text style={[styles.mealSlotLabel, active && styles.mealSlotLabelActive]}>{label}</Text>
        {items.length > 0 ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onClear();
            }}
            style={({ pressed }) => [styles.slotClearButton, pressed && styles.pressed]}
          >
            <Text style={styles.slotClearButtonText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      {firstItem ? (
        <View>
          <Text numberOfLines={1} style={styles.slotItemName}>{firstItem.name || 'Menu Item'}</Text>
          <Text style={styles.slotMeta}>{items.length} item{items.length === 1 ? '' : 's'} - {formatPrice(total)}</Text>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onRemove(firstItem.planId);
            }}
            style={({ pressed }) => [styles.removeItemButton, pressed && styles.pressed]}
          >
            <Text style={styles.removeItemButtonText}>Remove 1</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.emptySlotContent}>
          <Text style={styles.addSymbol}>+</Text>
          <Text style={styles.emptySlotText}>Add Meal</Text>
        </View>
      )}
    </Pressable>
  );
}

function WeeklyMenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const image = item.image || item.imageUrl;
  const tags = getDietaryTags(item);

  return (
    <View style={styles.menuCard}>
      {image ? (
        <Image source={{ uri: image }} defaultSource={fallbackFoodImage} style={styles.menuImage} />
      ) : (
        <Image source={fallbackFoodImage} style={styles.menuImage} />
      )}
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

        <Pressable onPress={onAdd} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <Text style={styles.addButtonText}>Add to Active Slot</Text>
        </Pressable>
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

function getWeekDateRange(weekIndex: number) {
  const start = getNextSunday();
  start.setDate(start.getDate() + weekIndex * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

function getDayDateLabel(day: DayId) {
  const start = getNextSunday();
  const dayIndex = sheetDayOrder.indexOf(day);
  start.setDate(start.getDate() + Math.max(dayIndex, 0));
  return formatShortDate(start);
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
    backgroundColor: theme.colors.gray[50],
  },
  content: {
    paddingBottom: 128,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.gray[50],
  },
  loadingText: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
  },
  emptyTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  emptyCopy: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 48,
    marginTop: theme.spacing[6],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[8],
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  heroBand: {
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[3],
    paddingTop: theme.spacing[7],
    paddingBottom: theme.spacing[6],
    alignItems: 'center',
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: 31,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  copy: {
    marginTop: theme.spacing[2],
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  heroStatsRow: {
    width: '100%',
    marginTop: theme.spacing[6],
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  heroStatTile: {
    flex: 1,
    minHeight: 92,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[3],
  },
  heroStatLabel: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  heroStatValue: {
    marginTop: theme.spacing[2],
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  heroStatValueHighlight: {
    color: '#fef08a',
  },
  heroStatFooter: {
    marginTop: theme.spacing[2],
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  weekSelectorSection: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[2],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[5],
    alignItems: 'center',
  },
  weekSelectorCard: {
    width: '100%',
    minHeight: 86,
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.md,
  },
  weekIcon: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  weekTitle: {
    marginTop: theme.spacing[1],
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  weekMealCount: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
  },
  planWeekButton: {
    width: '100%',
    minHeight: 40,
    marginTop: theme.spacing[3],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  planWeekButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  twoWeekTabs: {
    width: '100%',
    marginTop: theme.spacing[3],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.gray[100],
    flexDirection: 'row',
    padding: theme.spacing[1],
    gap: theme.spacing[1],
  },
  weekTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekTabActive: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    ...theme.shadow.sm,
  },
  weekTabText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  weekTabActiveText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  weekDateRow: {
    marginTop: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  weekDateIcon: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  weekDateText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  restaurantPanel: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[5],
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[4],
  },
  restaurantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  restaurantAvatarText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantTextBlock: {
    flex: 1,
  },
  restaurantMetaTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantChipRow: {
    marginTop: theme.spacing[2],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  restaurantNameChip: {
    maxWidth: 180,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  restaurantNameChipText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantMeta: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 18,
  },
  addRestaurantButton: {
    minHeight: 40,
    marginTop: theme.spacing[4],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  addRestaurantButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  grubPassButton: {
    minHeight: 40,
    marginTop: theme.spacing[4],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b35f6',
    ...theme.shadow.md,
  },
  grubPassButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  changeRestaurantButton: {
    minHeight: 40,
    marginTop: theme.spacing[3],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  changeRestaurantButtonText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  errorPanel: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[4],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.red[100],
    padding: theme.spacing[3],
  },
  errorText: {
    color: theme.colors.red[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sectionHeader: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[5],
    marginBottom: theme.spacing[3],
    alignItems: 'center',
  },
  sectionTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  sectionDate: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  clearWeekButton: {
    minHeight: 40,
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[5],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#fca5a5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
  },
  clearWeekButtonText: {
    color: theme.colors.red[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  weekGrid: {
    paddingHorizontal: theme.spacing[3],
    gap: theme.spacing[3],
  },
  summaryCard: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[5],
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    ...theme.shadow.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[5],
  },
  summaryTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
  },
  summaryIconText: {
    color: theme.colors.blue[600],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryMetricNeutral: {
    minHeight: 74,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  summaryMetricGreen: {
    minHeight: 74,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  summaryMetricBlue: {
    minHeight: 74,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  summaryMetricLabel: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  summaryMetricHint: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
  },
  summaryMetricHintGreen: {
    marginTop: theme.spacing[2],
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.sm,
  },
  summaryMetricHintBlue: {
    marginTop: theme.spacing[2],
    color: theme.colors.blue[700],
    fontSize: theme.typography.fontSize.sm,
  },
  summaryMetricValue: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryMetricValueGreen: {
    color: theme.colors.green[600],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryMetricValueBlue: {
    color: theme.colors.blue[600],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryWeekRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    paddingTop: theme.spacing[4],
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  summaryWeekOne: {
    flex: 1,
    minHeight: 64,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fefce8',
  },
  summaryWeekTwo: {
    flex: 1,
    minHeight: 64,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf5ff',
  },
  summaryWeekOneValue: {
    color: '#a16207',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryWeekOneLabel: {
    marginTop: theme.spacing[1],
    color: '#ca8a04',
    fontSize: theme.typography.fontSize.xs,
  },
  summaryWeekTwoValue: {
    color: '#9333ea',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryWeekTwoLabel: {
    marginTop: theme.spacing[1],
    color: '#9333ea',
    fontSize: theme.typography.fontSize.xs,
  },
  quickActionsCard: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[8],
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    ...theme.shadow.md,
  },
  quickIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[100],
  },
  quickIconText: {
    color: theme.colors.green[600],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  calendarAction: {
    minHeight: 78,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray[300],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing[4],
  },
  calendarActionEnabled: {
    borderColor: theme.colors.green[100],
    backgroundColor: '#f0fdf4',
  },
  calendarIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[100],
  },
  calendarIconText: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  calendarActionTextBlock: {
    flex: 1,
  },
  calendarActionTitle: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  calendarActionTitleEnabled: {
    color: theme.colors.green[800],
  },
  calendarActionCopy: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
  },
  dayBlock: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[3],
    ...theme.shadow.sm,
  },
  dayLabel: {
    marginBottom: theme.spacing[2],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  slotRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  mealSlot: {
    flex: 1,
    minHeight: 116,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing[3],
  },
  mealSlotActive: {
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: theme.colors.red[50],
  },
  mealSlotTop: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
  },
  mealSlotLabel: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  mealSlotLabelActive: {
    color: theme.colors.brand.grubRed,
  },
  slotClearButton: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  slotClearButtonText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  slotItemName: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  slotMeta: {
    marginTop: theme.spacing[1],
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  removeItemButton: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing[2],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.red[100],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  removeItemButtonText: {
    color: theme.colors.red[700],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptySlotContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSymbol: {
    color: theme.colors.gray[400],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  emptySlotText: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  menuSectionHeader: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
  },
  menuSectionSubtitle: {
    marginTop: 2,
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
  },
  activeSlotPill: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.green[100],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
  },
  activeSlotPillText: {
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  loadingPanel: {
    marginHorizontal: theme.spacing[3],
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMenuPanel: {
    marginHorizontal: theme.spacing[3],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  emptyMenuText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  menuList: {
    paddingHorizontal: theme.spacing[3],
    gap: theme.spacing[3],
  },
  menuCard: {
    overflow: 'hidden',
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    ...theme.shadow.md,
  },
  menuImage: {
    width: '100%',
    height: 128,
    backgroundColor: theme.colors.gray[100],
  },
  menuBody: {
    padding: theme.spacing[3],
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
  },
  menuTextBlock: {
    flex: 1,
  },
  menuItemName: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 22,
  },
  menuItemMeta: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  menuItemPrice: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  menuItemDescription: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  tagRow: {
    marginTop: theme.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  tagPill: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.green[100],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  tagPillText: {
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  addButton: {
    minHeight: 44,
    marginTop: theme.spacing[3],
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[600],
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  mealPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'flex-end',
  },
  mealPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: 'rgba(0,0,0,0.26)',
  },
  mealPickerSheet: {
    zIndex: 1,
    height: '78%',
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    ...theme.shadow.lg,
  },
  mealPickerHandle: {
    alignSelf: 'center',
    width: 72,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray[300],
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  mealPickerHeader: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[3],
    paddingBottom: theme.spacing[2],
  },
  mealPickerTitleBlock: {
    flex: 1,
  },
  mealPickerTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  mealPickerSubtitle: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
  },
  mealPickerClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealPickerCloseText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.medium,
  },
  dayChipScrollView: {
    flexGrow: 0,
    flexShrink: 0,
    height: 74,
    maxHeight: 74,
  },
  dayChipScroller: {
    paddingHorizontal: theme.spacing[3],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    gap: theme.spacing[3],
  },
  dayChip: {
    minWidth: 72,
    height: 58,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[3],
  },
  dayChipActive: {
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: theme.colors.brand.grubRed,
  },
  dayChipLabel: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  dayChipLabelActive: {
    color: theme.colors.white,
  },
  dayChipDate: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: 10,
    lineHeight: 12,
  },
  dayChipDateActive: {
    color: theme.colors.white,
  },
  sheetDivider: {
    flexShrink: 0,
    width: 250,
    height: 3,
    marginTop: theme.spacing[1],
    backgroundColor: theme.colors.gray[300],
  },
  restaurantTabsLabel: {
    flexShrink: 0,
    marginTop: theme.spacing[5],
    marginLeft: theme.spacing[3],
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  restaurantTabRow: {
    flexShrink: 0,
    marginTop: theme.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  restaurantArrowButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  restaurantArrowButtonDisabled: {
    opacity: 0.45,
  },
  restaurantArrowButtonText: {
    color: theme.colors.gray[400],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantTabScroller: {
    gap: theme.spacing[2],
  },
  restaurantTabActive: {
    minWidth: 140,
    minHeight: 32,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: theme.spacing[4],
  },
  restaurantTab: {
    minWidth: 140,
    minHeight: 32,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
  },
  restaurantTabActiveText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantTabText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  mealPickerBody: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    marginTop: theme.spacing[3],
    backgroundColor: theme.colors.gray[50],
  },
  mealPickerBodyContent: {
    padding: theme.spacing[3],
    paddingBottom: theme.spacing[12],
  },
  foodPreferenceCard: {
    minHeight: 84,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[4],
    ...theme.shadow.md,
  },
  foodPreferenceIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.red[100],
  },
  foodPreferenceIconText: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.brand.grubRed,
    color: theme.colors.brand.grubRed,
    fontSize: 0,
  },
  foodPreferenceTextBlock: {
    flex: 1,
  },
  foodPreferenceTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  foodPreferenceCopy: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 18,
  },
  foodPreferenceChevron: {
    color: theme.colors.gray[400],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  foodPreferenceOptions: {
    marginTop: theme.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  foodPreferenceChip: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.green[100],
    backgroundColor: '#f0fdf4',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
  },
  foodPreferenceChipText: {
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sheetMenuHeader: {
    marginTop: theme.spacing[5],
    marginBottom: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  sheetMenuIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[100],
  },
  sheetMenuIconText: {
    color: theme.colors.green[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sheetMenuTitleBlock: {
    flex: 1,
  },
  sheetMenuTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.medium,
  },
  sheetMenuSubtitle: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
  },
  clickToAddPill: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.green[100],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  clickToAddText: {
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sheetLoading: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetMenuList: {
    gap: theme.spacing[4],
  },
  sheetMenuCard: {
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
    ...theme.shadow.md,
  },
  sheetMenuImage: {
    width: '100%',
    height: 132,
    backgroundColor: theme.colors.gray[100],
  },
  sheetAddButton: {
    position: 'absolute',
    top: theme.spacing[3],
    right: theme.spacing[3],
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[600],
    ...theme.shadow.md,
  },
  sheetAddButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sheetPriceBadge: {
    position: 'absolute',
    left: theme.spacing[3],
    top: 96,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    ...theme.shadow.sm,
  },
  sheetPriceText: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sheetRatingPill: {
    position: 'absolute',
    right: theme.spacing[3],
    top: 108,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  sheetRatingText: {
    color: theme.colors.gray[300],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sheetMenuCardBody: {
    padding: theme.spacing[3],
  },
  sheetMenuItemName: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sheetCategoryPill: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing[2],
    borderRadius: theme.radius.full,
    backgroundColor: '#dbeafe',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  sheetCategoryText: {
    color: theme.colors.blue[700],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  replacementBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: theme.spacing[1],
  },
  replacementModal: {
    maxHeight: '92%',
    overflow: 'hidden',
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    ...theme.shadow.lg,
  },
  replacementHeader: {
    alignItems: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[5],
  },
  replacementHeaderIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  replacementHeaderIconText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  replacementTitle: {
    marginTop: theme.spacing[3],
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  replacementSubtitle: {
    marginTop: theme.spacing[2],
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
  replacementBody: {
    paddingHorizontal: theme.spacing[3],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  maxReachedText: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  instructionText: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
  legendRow: {
    marginTop: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing[5],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: theme.colors.gray[400],
    backgroundColor: theme.colors.white,
  },
  legendBoxSelected: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: theme.colors.brand.grubRed,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  legendCheck: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
  },
  legendText: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
  },
  legendSelectedText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  currentRestaurantsLabel: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  restaurantRemovalList: {
    gap: theme.spacing[3],
  },
  removalRestaurantCard: {
    minHeight: 80,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing[3],
  },
  removalRestaurantCardSelected: {
    borderColor: theme.colors.red[500],
    backgroundColor: theme.colors.red[50],
  },
  removalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: theme.colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  removalCheckboxSelected: {
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: theme.colors.brand.grubRed,
  },
  removalCheckboxText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  removalRestaurantInfo: {
    flex: 1,
  },
  removalRestaurantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  removalRestaurantName: {
    flex: 1,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  removalRestaurantNameSelected: {
    color: theme.colors.red[700],
  },
  toRemoveBadge: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[0.5],
  },
  toRemoveBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
  },
  removalRestaurantCuisine: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
  },
  mealCountBadge: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing[3],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  mealCountBadgeSelected: {
    backgroundColor: theme.colors.brand.grubRed,
  },
  mealCountBadgeText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  mealCountBadgeSelectedText: {
    color: theme.colors.white,
  },
  willDeleteText: {
    marginTop: theme.spacing[1],
    color: theme.colors.red[700],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  addStepTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  addStepCopy: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  browseRestaurantsButton: {
    marginTop: theme.spacing[5],
    minHeight: 86,
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.green[600],
    padding: theme.spacing[4],
    ...theme.shadow.md,
  },
  browseIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  browseIconText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  browseTextBlock: {
    flex: 1,
  },
  browseTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  browseCopy: {
    marginTop: theme.spacing[1],
    color: theme.colors.green[100],
    fontSize: theme.typography.fontSize.xs,
  },
  browseArrow: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  remainingSection: {
    marginTop: theme.spacing[5],
  },
  remainingRestaurantCard: {
    marginTop: theme.spacing[3],
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.green[100],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: theme.colors.green[100],
    padding: theme.spacing[3],
  },
  remainingCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  remainingCheckText: {
    color: theme.colors.green[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  remainingTextBlock: {
    flex: 1,
  },
  remainingRestaurantName: {
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  remainingStatus: {
    marginTop: theme.spacing[1],
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  replacementActions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    paddingBottom: theme.spacing[3],
  },
  replacementCancelButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  replacementCancelText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  replacementRemoveButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replacementRemoveButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
  },
  replacementRemoveButtonActive: {
    backgroundColor: theme.colors.brand.grubRed,
  },
  replacementRemoveText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  replacementRemoveTextDisabled: {
    color: theme.colors.gray[400],
  },
  replacementDoneButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[600],
  },
  replacementDoneText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pressed: {
    opacity: 0.76,
  },
});
