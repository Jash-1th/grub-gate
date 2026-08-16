import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useFlash } from '../../contexts/FlashContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import {
  getRestaurant,
  getRestaurantMenu,
  type MenuItem,
  type Restaurant,
} from '../../lib/restaurantApi';
import { theme } from '../../theme';
import { RestaurantCardSkeleton } from '../../components/ui/RestaurantCardSkeleton';
import { AnimatedPressable } from '../../components/AnimatedPressable';

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
  const { isSubscribed } = useAuth();
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
    if (!isSubscribed) return;

    showFlash('Your subscription is already active. Opening your meal calendar instead.', 'info');
    router.replace('/meal-calendar?source=subscription');
  }, [isSubscribed, showFlash]);

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
      setSelectedFilters(['All']);
    } else {
      if (selectedFilters.includes(filter)) {
        setSelectedFilters(prev => {
          const newFilters = prev.filter(f => f !== filter);
          return newFilters.length === 0 ? ['All'] : newFilters;
        });
      } else {
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
        <View style={styles.skeletonContainer}>
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
        </View>
      </View>
    );
  }

  if (isSubscribed) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.brand.grubRed} />
        <Text style={styles.loadingText}>Opening your active meal calendar...</Text>
      </View>
    );
  }

  if (errorMessage || !restaurant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Restaurant Not Found</Text>
        <Text style={styles.errorCopy}>{errorMessage || 'Unable to load restaurant details.'}</Text>
        <AnimatedPressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to Restaurants</Text>
        </AnimatedPressable>
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

      <BlurView
        intensity={55}
        tint="light"
        style={[styles.bottomBar, { paddingBottom: insets.bottom + theme.spacing[3] }]}
      >
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
      </BlurView>

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

          <View style={styles.limitModalBody}>
            <View style={styles.limitFeatureBox}>
              <View style={styles.limitFeatureIcon}>
                <Ionicons name="restaurant-outline" size={20} color={theme.colors.brand.grubRed} />
              </View>
              <View style={styles.limitFeatureCopy}>
                <Text style={styles.limitFeatureTitle}>Multi-Restaurant Feature</Text>
                <Text style={styles.limitFeatureText}>{message}</Text>
              </View>
            </View>

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

          <View style={styles.limitActions}>
            <AnimatedPressable onPress={onClose} style={styles.limitSecondaryButton}>
              <Text style={styles.limitSecondaryButtonText}>Got It</Text>
            </AnimatedPressable>
            <AnimatedPressable onPress={onGoToWeeklyMenu} style={styles.limitPrimaryButton}>
              <Text style={styles.limitPrimaryButtonText}>Go to Weekly Menu</Text>
            </AnimatedPressable>
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
  const itemAny = item as any;
  const rawImage = item.image || item.imageUrl || itemAny.img || itemAny.photo || itemAny.images?.[0];
  const imageUrl = getFullImageUrl(rawImage);
  const tags = getDietaryTags(item);
  const [hasImageError, setHasImageError] = useState(false);
  
  const isVegan = tags.some(tag => normalizeTag(tag) === 'vegan');
  const isVegetarian = tags.some(tag => normalizeTag(tag) === 'vegetarian');
  const imageSource = !hasImageError && imageUrl ? { uri: imageUrl } : fallbackFoodImage;

  return (
    <AnimatedPressable onPress={onPress} style={styles.foodCard}>
      <View style={styles.foodCardContent}>
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

          <Text style={styles.foodPrice}>{formatPrice(item.price)}</Text>

          <Text numberOfLines={2} style={styles.foodDescription}>
            {item.description || 'Delicious menu item'}
          </Text>
        </View>

        <View style={styles.foodCardRight}>
          <Image
            source={imageSource}
            defaultSource={fallbackFoodImage}
            onError={() => setHasImageError(true)}
            style={styles.foodImage}
          />
        </View>
      </View>
    </AnimatedPressable>
  );
}

function getFullImageUrl(url?: string) {
  if (!url) return null;
  if (url.startsWith('/images/') || url.startsWith('images/')) return null;
  
  const normalizedUrl = url.replace(/\\/g, '/');
  if (normalizedUrl.startsWith('http')) {
    return Platform.OS === 'android' ? normalizedUrl.replace('localhost', '127.0.0.1') : normalizedUrl;
  }
  
  let baseUrl = process.env.EXPO_PUBLIC_API_URL 
    ? process.env.EXPO_PUBLIC_API_URL.split('/api')[0] 
    : 'http://127.0.0.1:5000';
    
  if (Platform.OS === 'android') {
    baseUrl = baseUrl.replace('localhost', '127.0.0.1');
  }
    
  const cleanUrl = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
  return `${baseUrl}${cleanUrl}`;
}

function ItemDetailModal({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  if (!item) return null;
  
  const itemAny = item as any;
  const rawImage = item.image || item.imageUrl || itemAny.img || itemAny.photo || itemAny.images?.[0];
  const imageUrl = getFullImageUrl(rawImage);
  const tags = getDietaryTags(item);
  const nutritionInfo = (item.nutritionInfo || item.nutritionalInfo || {}) as NutritionInfo;
  
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
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} defaultSource={fallbackFoodImage} style={styles.heroImage} />
            ) : (
              <Image source={fallbackFoodImage} style={styles.heroImage} />
            )}
            <LinearGradient
              colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0.14)', 'transparent']}
              locations={[0, 0.34, 0.7]}
              style={styles.heroImageOverlay}
              pointerEvents="none"
            />
            <SafeAreaView edges={['top']} style={styles.closeButtonContainer}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                hitSlop={12}
              >
                <BlurView intensity={40} tint="light" style={styles.closeButtonBlur}>
                  <Ionicons name="close" size={22} color="#111111" />
                </BlurView>
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
                <View style={[styles.pill, styles.pillVegan]}>
                  <Text style={[styles.pillText, styles.pillTextVegan]}>Vegan</Text>
                </View>
              )}
              {isVegetarian && !isVegan && (
                <View style={[styles.pill, styles.pillVegetarian]}>
                  <Text style={[styles.pillText, styles.pillTextVegetarian]}>Vegetarian</Text>
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
    backgroundColor: '#F8F9FA',
  },
  page: {
    flex: 1,
  },
  content: {
    paddingTop: 18,
    paddingBottom: 144,
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
  skeletonContainer: {
    gap: theme.spacing[4],
    width: '100%',
    paddingHorizontal: theme.spacing[4],
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
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17, 24, 39, 0.06)',
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
    fontSize: 20,
    fontWeight: '800',
    marginLeft: theme.spacing[2],
  },
  headerSpacer: {
    width: 44,
  },
  filterStripContainer: {
    backgroundColor: '#F8F9FA',
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  filterStripContent: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(17, 24, 39, 0.08)',
  },
  filterPillActive: {
    backgroundColor: '#7F1D1D',
    borderColor: '#7F1D1D',
  },
  filterPillText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    gap: 14,
    paddingTop: 6,
    paddingBottom: 12,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  foodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  foodCardLeft: {
    flex: 1,
    marginRight: 18,
    justifyContent: 'center',
    minWidth: 0,
  },
  foodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
    flexShrink: 1,
    color: '#1A1A1A',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  foodPrice: {
    color: '#881337',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  foodDescription: {
    color: '#666666',
    fontSize: 13.5,
    lineHeight: 20,
  },
  foodCardRight: {
    width: 112,
    height: 112,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EEF2F7',
    flexShrink: 0,
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
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.75)',
    paddingTop: theme.spacing[2],
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomActionButton: {
    minHeight: 58,
    borderRadius: 99,
    marginHorizontal: 16,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: '#7F1D1D',
    shadowColor: '#7F1D1D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  bottomActionButtonSelected: {
    backgroundColor: theme.colors.green[600],
    shadowColor: theme.colors.green[600],
  },
  bottomActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
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
  modalShell: {
    flex: 1,
    backgroundColor: '#FCFCFD',
  },
  modalContent: {
    flex: 1,
  },
  heroImageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 268,
  },
  heroImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 132,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: theme.spacing[4],
    paddingTop: theme.spacing[2] + 2,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  closeButtonBlur: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[5],
    paddingBottom: 44,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    minHeight: 30,
  },
  vegIndicatorLarge: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemName: {
    flex: 1,
    color: '#111111',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  itemPrice: {
    color: '#881337',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 10,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[5],
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: theme.spacing[2],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  macroValue: {
    color: '#111111',
    fontSize: 19,
    fontWeight: '800',
  },
  macroLabel: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginTop: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginTop: theme.spacing[4],
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
  },
  pillText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  pillVegan: {
    backgroundColor: '#ECFDF3',
  },
  pillTextVegan: {
    color: '#166534',
  },
  pillVegetarian: {
    backgroundColor: '#F0FDF4',
  },
  pillTextVegetarian: {
    color: '#166534',
  },
  section: {
    marginTop: theme.spacing[5],
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  sectionText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
  },
  allergenSection: {
    marginTop: theme.spacing[5],
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 16,
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: 8,
  },
  allergenTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '700',
  },
  allergenText: {
    color: '#7F1D1D',
    fontSize: 14,
    lineHeight: 21,
  },
});
