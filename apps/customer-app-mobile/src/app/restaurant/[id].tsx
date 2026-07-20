import { router, useLocalSearchParams } from 'expo-router';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFlash } from '../../contexts/FlashContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import {
  getRestaurant,
  getRestaurantMenu,
  type MenuItem,
  type Restaurant,
} from '../../lib/restaurantApi';
import { theme } from '../../theme';

const fallbackFoodImage = require('../../assets/grub-gate-default-img.jpg');

const filterOptions = [
  'All',
  'Vegan',
  'Vegetarian',
  'Non-Veg',
  'Halal',
  'Gluten-Free',
  'Dairy-Free',
];

type NutritionInfo = {
  calories?: number | string;
  protein?: number | string;
  carbs?: number | string;
  fat?: number | string;
};

export default function RestaurantDetailScreen() {
  const params = useLocalSearchParams<{ id?: string; source?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showRestaurantLimitModal, setShowRestaurantLimitModal] = useState(false);
  const [restaurantLimitMessage, setRestaurantLimitMessage] = useState('');
  const { showFlash } = useFlash();
  const {
    addSelectedRestaurant,
    canAddRestaurant,
    getSelectedRestaurantCount,
    isRestaurantSelected,
    maxRestaurants,
    selectedRestaurants,
    setSelectedRestaurant,
  } = useMealPlan();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let mounted = true;

    async function loadRestaurant() {
      if (!id) {
        setErrorMessage('Restaurant not found.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      const [restaurantResult, menuResult] = await Promise.all([
        getRestaurant(id),
        getRestaurantMenu(id, { userType: 'normal' }),
      ]);

      if (!mounted) return;

      if (restaurantResult.success && restaurantResult.data) {
        setRestaurant(restaurantResult.data);
      } else {
        setErrorMessage(restaurantResult.error || 'Restaurant not found. Please check your connection and try again.');
      }

      if (menuResult.success) {
        setMenuItems(menuResult.data.menuItems);
      } else {
        showFlash(menuResult.error || 'Unable to load menu items.', 'error');
      }

      setIsLoading(false);
    }

    loadRestaurant();

    return () => {
      mounted = false;
    };
  }, [id, showFlash]);

  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      // If All is clicked, select only All
      setSelectedFilters(['All']);
    } else {
      // Check if filter is already selected
      if (selectedFilters.includes(filter)) {
        // If selected, unselect it
        setSelectedFilters(prev => {
          const newFilters = prev.filter(f => f !== filter);
          // If no filters left, select All
          return newFilters.length === 0 ? ['All'] : newFilters;
        });
      } else {
        // If not selected, add it and remove All if present
        setSelectedFilters(prev => {
          const withoutAll = prev.filter(f => f !== 'All');
          return [...withoutAll, filter];
        });
      }
    }
  };

  const visibleItems = useMemo(() => {
    if (selectedFilters.includes('All')) return menuItems;

    return menuItems.filter((item) => {
      const tags = getDietaryTags(item).map((tag) => normalizeTag(tag));
      
      // Check if item matches any of the selected filters
      return selectedFilters.some(filter => {
        const filterTag = normalizeTag(filter);
        
        if (filterTag === 'non-veg') {
          return !tags.includes('vegan') && !tags.includes('vegetarian');
        }
        
        return tags.includes(filterTag);
      });
    });
  }, [menuItems, selectedFilters]);

  const handleSelectRestaurant = () => {
    if (!restaurant) return;

    const restaurantId = getRestaurantId(restaurant) || id;
    const restaurantName = restaurant.name || 'Restaurant';

    if (isRestaurantSelected(restaurantId)) {
      showFlash(`${restaurantName} is already in your meal plan.`, 'info');
      router.push('/weekly-menu');
      return;
    }

    if (!canAddRestaurant()) {
      const selectedNames = selectedRestaurants
        .map((item) => item.restaurantName)
        .filter(Boolean)
        .join(', ');
      const limit = maxRestaurants ?? 2;
      setRestaurantLimitMessage(
        `You've reached the maximum of ${limit} restaurants. You currently have: ${selectedNames || `${getSelectedRestaurantCount()} restaurants selected`}`
      );
      setShowRestaurantLimitModal(true);
      return;
    }

    const success = addSelectedRestaurant(restaurantId, restaurantName, restaurant);
    if (!success) {
      showFlash('Failed to add restaurant to selection.', 'error');
      return;
    }

    // FIXED: Correctly closed the backtick here to stop the syntax errors!
    showFlash(`${restaurantName} selected.`, 'success');
    router.push('/weekly-menu');
  };

  const handleCloseRestaurantLimitModal = () => {
    setShowRestaurantLimitModal(false);
    setRestaurantLimitMessage('');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.brand.grubRed} />
        <Text style={styles.loadingText}>Loading restaurant...</Text>
      </View>
    );
  }

  if (errorMessage || !restaurant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Restaurant Not Found</Text>
        <Text style={styles.errorCopy}>{errorMessage || 'Unable to load restaurant details.'}</Text>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Back to Restaurants</Text>
        </Pressable>
      </View>
    );
  }

  const currentRestaurantId = getRestaurantId(restaurant) || id;
  const isCurrentRestaurantSelected = isRestaurantSelected(currentRestaurantId);

  return (
    <View style={styles.shell}>
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => {
              if (params.source === 'plan') {
                router.back();
              } else {
                // Fallback to restaurants list if no valid source
                router.push('/plan/restaurants');
              }
            }}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.headerTitle}>{restaurant.name || 'Menu'}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <View style={styles.filterStripContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterStripContent}
        >
          {filterOptions.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => toggleFilter(filter)}
              style={({ pressed }) => [
                styles.filterPill,
                selectedFilters.includes(filter) && styles.filterPillActive,
                pressed && styles.pressed,
              ]}
            >
              <Text 
                style={[
                  styles.filterPillText,
                  selectedFilters.includes(filter) && styles.filterPillTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {visibleItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No menu items available for this selection.</Text>
          </View>
        ) : (
          <View style={styles.menuList}>
            {visibleItems.map((item) => (
            <FoodItemCard 
              key={getMenuItemId(item)} 
              item={item} 
              onPress={() => setSelectedItem(item)} 
            />
          ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + theme.spacing[3] }]}>
        <Pressable
          onPress={handleSelectRestaurant}
          style={({ pressed }) => [
            styles.bottomActionButton,
            isCurrentRestaurantSelected && styles.bottomActionButtonSelected,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.bottomActionButtonText}>
            {isCurrentRestaurantSelected ? 'This Restaurant Is Already Selected' : 'Select This Restaurant'}
          </Text>
          {!isCurrentRestaurantSelected ? <Ionicons name="chevron-forward" size={20} color="#fff" /> : null}
        </Pressable>
      </View>

      <RestaurantLimitModal
        isVisible={showRestaurantLimitModal}
        message={restaurantLimitMessage}
        onClose={handleCloseRestaurantLimitModal}
        onGoToWeeklyMenu={() => {
          handleCloseRestaurantLimitModal();
          router.push('/weekly-menu');
        }}
      />

      <ItemDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </View>
  );
}

function RestaurantLimitModal({
  isVisible,
  message,
  onClose,
  onGoToWeeklyMenu,
}: {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  onGoToWeeklyMenu: () => void;
}) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.limitModal}>
          {/* Header Section (Clean, No Hard Colored Bar) */}
          <View style={styles.limitModalHeader}>
            <View style={styles.limitHeaderRow}>
              <View style={styles.limitInfoIcon}>
                <Ionicons name="information-circle" size={24} color={theme.colors.brand.grubRed} />
              </View>
              <View style={styles.limitHeaderText}>
                <Text style={styles.limitTitle}>Restaurant Limit Reached</Text>
                <Text style={styles.limitSubtitle}>Multi-restaurant meal planning</Text>
              </View>
            </View>
          </View>

          {/* Body */}
          <View style={styles.limitModalBody}>
            {/* Feature Info Box (Soft) */}
            <View style={styles.limitFeatureBox}>
              <View style={styles.limitFeatureIcon}>
                <Ionicons name="restaurant-outline" size={20} color={theme.colors.brand.grubRed} />
              </View>
              <View style={styles.limitFeatureCopy}>
                <Text style={styles.limitFeatureTitle}>Multi-Restaurant Feature</Text>
                <Text style={styles.limitFeatureText}>{message}</Text>
              </View>
            </View>

            {/* Help Text */}
            <View style={styles.limitHelpText}>
              <Text style={styles.limitHelpTitle}>To add this restaurant:</Text>
              <View style={styles.limitHelpBulletRow}>
                <Ionicons name="arrow-forward" size={14} color="#6B7280" />
                <Text style={styles.limitHelpBullet}>Go to your Weekly Menu and remove a restaurant</Text>
              </View>
              <View style={styles.limitHelpBulletRow}>
                <Ionicons name="arrow-forward" size={14} color="#6B7280" />
                <Text style={styles.limitHelpBullet}>Or complete your current meal plan first</Text>
              </View>
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.limitActions}>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.limitSecondaryButton, pressed && styles.pressed]}>
              <Text style={styles.limitSecondaryButtonText}>Got It</Text>
            </Pressable>
            <Pressable onPress={onGoToWeeklyMenu} style={({ pressed }) => [styles.limitPrimaryButton, pressed && styles.pressed]}>
              <Text style={styles.limitPrimaryButtonText}>Go to Weekly Menu</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FoodItemCard({ 
  item,
  onPress,
}: { 
  item: MenuItem;
  onPress: () => void;
}) {
  const image = item.image || item.imageUrl;
  const tags = getDietaryTags(item);
  const rating = typeof item.rating === 'number' ? item.rating : 0;
  const reviewCount = typeof item.reviewCount === 'number' ? item.reviewCount : 0;
  
  const isVegan = tags.some(tag => normalizeTag(tag) === 'vegan');
  const isVegetarian = tags.some(tag => normalizeTag(tag) === 'vegetarian');

  return (
    <Pressable onPress={onPress} style={styles.foodCard}>
      <View style={styles.foodCardLeft}>
        <View style={styles.foodTitleRow}>
          <View style={[
            styles.vegIndicator,
            isVegan || isVegetarian ? styles.vegIndicatorVeg : styles.vegIndicatorNonVeg
          ]}>
            <View style={[
              styles.vegIndicatorDot,
              isVegan || isVegetarian ? styles.vegIndicatorDotVeg : styles.vegIndicatorDotNonVeg
            ]} />
          </View>
          <Text numberOfLines={2} style={styles.foodTitle}>
            {item.name || 'Menu Item'}
          </Text>
        </View>

        {rating > 0 ? (
          <Text style={styles.ratingText}>
            {"⭐ "}
            {formatRating(rating)}
            {reviewCount > 0 ? ` (${reviewCount})` : ""}
          </Text>
        ) : null}

        <Text style={styles.foodPrice}>{formatPrice(item.price)}</Text>

        <Text numberOfLines={2} style={styles.foodDescription}>
          {item.description || 'Delicious menu item'}
        </Text>
      </View>

      <View style={styles.foodCardRight}>
        <View style={styles.foodImageContainer}>
          {image ? (
            <Image source={{ uri: image }} defaultSource={fallbackFoodImage} style={styles.foodImage} />
          ) : (
            <Image source={fallbackFoodImage} style={styles.foodImage} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

function ItemDetailModal({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  if (!item) return null;
  
  const image = item.image || item.imageUrl;
  const tags = getDietaryTags(item);
  const nutritionInfo = (item.nutritionInfo || item.nutritionalInfo || {}) as NutritionInfo;
  
  // Safely casting to any to prevent strict TS errors if properties are missing from MenuItem type
  const itemAny = item as any;
  const hasAllergens = Array.isArray(itemAny.allergens) && itemAny.allergens.length > 0;
  const hasIngredients = Array.isArray(itemAny.ingredients) && itemAny.ingredients.length > 0;
  const isVegan = tags.some(tag => normalizeTag(tag) === 'vegan');
  const isVegetarian = tags.some(tag => normalizeTag(tag) === 'vegetarian');
  const spiceLevel = typeof itemAny.spiceLevel === 'number' ? itemAny.spiceLevel : 0;
  const prepTime = itemAny.prepTime || '15-20 mins';

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalShell}>
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroImageContainer}>
            {image ? (
              <Image source={{ uri: image }} defaultSource={fallbackFoodImage} style={styles.heroImage} />
            ) : (
              <Image source={fallbackFoodImage} style={styles.heroImage} />
            )}
            <SafeAreaView edges={['top']} style={styles.closeButtonContainer}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                hitSlop={12}
              >
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </Pressable>
            </SafeAreaView>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.titleRow}>
              <View style={[
                styles.vegIndicatorLarge,
                isVegan || isVegetarian ? styles.vegIndicatorVeg : styles.vegIndicatorNonVeg
              ]}>
                <View style={[
                  styles.vegIndicatorDot,
                  isVegan || isVegetarian ? styles.vegIndicatorDotVeg : styles.vegIndicatorDotNonVeg
                ]} />
              </View>
              <Text style={styles.itemName}>{item.name || 'Menu Item'}</Text>
            </View>
            <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>

            <View style={styles.macrosRow}>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>
                  {nutritionInfo.calories || 450}
                </Text>
                <Text style={styles.macroLabel}>kcal</Text>
              </View>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>
                  {formatMacroValue(nutritionInfo.protein) || '25g'}
                </Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>
                  {formatMacroValue(nutritionInfo.fat) || '15g'}
                </Text>
                <Text style={styles.macroLabel}>Fats</Text>
              </View>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>
                  {formatMacroValue(nutritionInfo.carbs) || '40g'}
                </Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
            </View>

            <View style={styles.pillsRow}>
              {isVegan && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Vegan</Text>
                </View>
              )}
              {isVegetarian && !isVegan && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>Vegetarian</Text>
                </View>
              )}
              {spiceLevel > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                  {`Spicy ${'!'.repeat(Math.min(spiceLevel, 3))}`}
                </Text>
                </View>
              )}
              <View style={styles.pill}>
                <Text style={styles.pillText}>{prepTime}</Text>
              </View>
            </View>

            {hasIngredients && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <Text style={styles.sectionText}>
                  {itemAny.ingredients.filter(Boolean).join(', ')}
                </Text>
              </View>
            )}

            {hasAllergens && (
              <View style={styles.allergenSection}>
                <View style={styles.allergenRow}>
                  <Ionicons name="information-circle" size={20} color="#DC2626" />
                  <Text style={styles.allergenTitle}>Contains Allergens</Text>
                </View>
                <Text style={styles.allergenText}>
                  {itemAny.allergens.filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function getMenuItemId(item: MenuItem) {
  return item._id || item.id || item.name || String(Math.random());
}

function getRestaurantId(restaurant: Restaurant) {
  // Added any cast just in case the type doesn't explicitly expose _id
  const r = restaurant as any;
  return r.id || r._id || r.name || '';
}

function getDietaryTags(item: MenuItem) {
  const itemAny = item as any;
  const tags = itemAny.dietaryPreferences || itemAny.preferences || itemAny.dietaryTags || itemAny.dietary || [];
  return Array.isArray(tags) ? tags.filter(Boolean) : [];
}

function normalizeTag(tag: string) {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

function formatTag(tag: string) {
  return tag
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatRating(rating: number) {
  if (!rating) return '0';
  return rating.toFixed(1).replace('.0', '');
}

function formatPrice(price?: number) {
  if (typeof price !== 'number') return '$0';
  return `$${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}`;
}

function formatMacroValue(value?: string | number) {
  if (value === undefined || value === null || value === '') return undefined;
  const stringValue = String(value).trim();
  return /\d\s*g$/i.test(stringValue) ? stringValue : `${stringValue}g`;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  page: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
    paddingBottom: 120,
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
  errorTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  errorCopy: {
    marginTop: theme.spacing[3],
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
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: theme.spacing[2],
  },
  headerSpacer: {
    width: 44,
  },
  filterStripContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterStripContent: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  filterPill: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.full,
    backgroundColor: '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: theme.colors.brand.grubRed,
  },
  filterPillText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    marginTop: theme.spacing[8],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
  },
  menuList: {
    gap: 8,
    paddingVertical: 8,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  foodCardLeft: {
    flex: 1,
    marginRight: theme.spacing[4],
  },
  foodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[1],
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[2],
  },
  vegIndicatorVeg: {
    borderColor: '#22C55E',
  },
  vegIndicatorNonVeg: {
    borderColor: '#EF4444',
  },
  vegIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  vegIndicatorDotVeg: {
    backgroundColor: '#22C55E',
  },
  vegIndicatorDotNonVeg: {
    backgroundColor: '#EF4444',
  },
  foodTitle: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  ratingText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: theme.spacing[1],
  },
  foodPrice: {
    color: theme.colors.brand.grubRed,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: theme.spacing[2],
  },
  foodDescription: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  foodCardRight: {
    width: 100,
    alignItems: 'center',
  },
  foodImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: theme.spacing[3],
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomActionButton: {
    minHeight: 50,
    borderRadius: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.brand.grubRed,
    shadowColor: theme.colors.brand.grubRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomActionButtonSelected: {
    backgroundColor: theme.colors.green[600],
    shadowColor: theme.colors.green[600],
  },
  bottomActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  limitModal: {
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  limitModalHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  limitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  limitHeaderText: {
    flex: 1,
  },
  limitInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
  limitTitle: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
  },
  limitSubtitle: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 14,
  },
  limitModalBody: {
    padding: 24,
  },
  limitFeatureBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    padding: 16,
  },
  limitFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  limitFeatureCopy: {
    flex: 1,
  },
  limitFeatureTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
  },
  limitFeatureText: {
    marginTop: 4,
    color: '#7F1D1D',
    fontSize: 13,
    lineHeight: 18,
  },
  limitHelpText: {
    marginTop: 20,
  },
  limitHelpTitle: {
    marginBottom: 12,
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  limitHelpBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  limitHelpBullet: {
    flex: 1,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  limitActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  limitSecondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
  },
  limitSecondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  limitPrimaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: 12,
    shadowColor: theme.colors.brand.grubRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  limitPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
  // Item Detail Modal Styles
  modalShell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
  },
  heroImageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  vegIndicatorLarge: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 22,
    fontWeight: '700',
  },
  itemPrice: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
    marginTop: theme.spacing[2],
  },
  macrosRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
    alignItems: 'center',
  },
  macroValue: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
  },
  macroLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginTop: theme.spacing[1],
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginTop: theme.spacing[4],
  },
  pill: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    backgroundColor: '#F3F4F6',
    borderRadius: theme.radius.full,
  },
  pillText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: theme.spacing[4],
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing[2],
  },
  sectionText: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
  },
  allergenSection: {
    marginTop: theme.spacing[4],
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: theme.spacing[3],
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[1],
  },
  allergenTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
  },
  allergenText: {
    color: '#7F1D1D',
    fontSize: 14,
  },
});
