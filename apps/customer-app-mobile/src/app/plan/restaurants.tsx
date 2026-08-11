import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useFlash } from '../../contexts/FlashContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { usePlanning } from '../../contexts/PlanningContext';
import { getRestaurantsByPostalCode, type Restaurant } from '../../lib/restaurantApi';
import { theme } from '../../theme';

const fallbackImage = require('../../assets/grub-gate-default-restaurant-img.jpg');

export default function PlanRestaurantsScreen() {
  const params = useLocalSearchParams<{ source?: string }>();
  const { postalCode, hasHydrated, setSource } = usePlanning();
  const { isAuthenticated, isSubscribed, isCheckingSubscription } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showFlash } = useFlash();
  const insets = useSafeAreaInsets();
  const {
    selectedRestaurantId: savedSelectedRestaurantId,
    selectedRestaurants,
    maxRestaurants,
    setSelectedRestaurant,
  } = useMealPlan();

  useEffect(() => {
    if (typeof params.source === 'string') {
      setSource(params.source);
    }
  }, [params.source, setSource]);

  useEffect(() => {
    if (savedSelectedRestaurantId) {
      setSelectedRestaurantId(savedSelectedRestaurantId);
    }
  }, [savedSelectedRestaurantId]);

  useEffect(() => {
    if (!isAuthenticated || isCheckingSubscription || !isSubscribed) return;

    showFlash('Your subscription is already active. Opening your meal calendar instead.', 'info');
    router.replace('/meal-calendar?source=subscription');
  }, [isAuthenticated, isCheckingSubscription, isSubscribed, showFlash]);

  const loadRestaurants = useCallback(async () => {
    if (!hasHydrated || !postalCode) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const result = await getRestaurantsByPostalCode(postalCode, { limit: 20 });

    if (result.success) {
      setRestaurants(result.data);
      if (result.data.length === 0) {
        setErrorMessage(`No restaurants found near ${postalCode.toUpperCase()}.`);
      }
    } else {
      setErrorMessage(result.error || 'Failed to load restaurants.');
      setRestaurants([]);
    }

    setIsLoading(false);
  }, [hasHydrated, postalCode]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const selectRestaurant = (restaurant: Restaurant) => {
    const id = getRestaurantId(restaurant);
    const alreadySelected = selectedRestaurants.some((item) => item.restaurantId === id);

    const limit = maxRestaurants ?? 2;
    if (!alreadySelected && typeof limit === 'number' && selectedRestaurants.length >= limit) {
      showFlash(`Maximum ${limit} restaurants can be selected for this meal plan.`, 'error');
      return;
    }

    setSelectedRestaurantId(id);
    setSelectedRestaurant(id, restaurant.name || 'Selected Restaurant', restaurant);
    showFlash(`${restaurant.name || 'Restaurant'} selected.`, 'success');
  };

  const openRestaurantDetails = (restaurant: Restaurant) => {
    const id = getRestaurantId(restaurant);
    router.push({
      pathname: '/restaurant/[id]',
      params: { id, source: 'plan' },
    });
  };

  const handleContinue = () => {
    if (isProcessing) return;

    if (!selectedRestaurantId) {
      showFlash('Please select a restaurant before continuing.', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.push('/weekly-menu');
    }, 180);
  };

  if (!hasHydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.brand.grubRed} />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  if (isAuthenticated && isCheckingSubscription) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.brand.grubRed} />
        <Text style={styles.loadingText}>Checking your subscription...</Text>
      </View>
    );
  }

  if (isAuthenticated && isSubscribed) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.brand.grubRed} />
        <Text style={styles.loadingText}>Opening your active meal calendar...</Text>
      </View>
    );
  }

  if (!postalCode) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Choose Your Location</Text>
        <Text style={styles.emptyCopy}>Start with your postal code so we can find restaurants near you.</Text>
        <Pressable onPress={() => router.replace('/plan')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Back to Location</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <RestaurantSelectionHeader postalCode={postalCode} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingRestaurants postalCode={postalCode} />
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={loadRestaurants} />
        ) : (
          <>
            <View style={styles.restaurantGrid}>
              {restaurants.map((restaurant) => {
                const id = getRestaurantId(restaurant);
                const selected = selectedRestaurantId === id || selectedRestaurants.some((item) => item.restaurantId === id);

                return (
                  <RestaurantCard
                    key={id}
                    restaurant={restaurant}
                    isSelected={selected}
                    onSelect={() => selectRestaurant(restaurant)}
                    onViewMenu={() => openRestaurantDetails(restaurant)}
                  />
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + theme.spacing[4] }]}>
        <View style={styles.bottomActions}>
          <Pressable onPress={() => router.replace('/plan')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Change Location</Text>
          </Pressable>
          <Pressable
            disabled={isProcessing}
            onPress={handleContinue}
            style={({ pressed }) => [styles.continueButton, isProcessing && styles.buttonDisabled, pressed && styles.pressed]}
          >
            <Text style={styles.continueButtonText}>{isProcessing ? 'Processing...' : 'Continue to Plans'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function RestaurantSelectionHeader({ postalCode }: { postalCode: string }) {
  return (
    <SafeAreaView edges={['top']} style={styles.selectionHeader}>
      <View style={styles.selectionHeaderRow}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            router.replace('/plan');
          }}
          hitSlop={12}
          style={({ pressed }) => [styles.selectionBackButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.gray[900]} />
        </Pressable>

        <Pressable
          onPress={() => router.replace('/plan')}
          style={({ pressed }) => [styles.selectionLocationPill, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Change location"
        >
          <Ionicons name="location-sharp" size={17} color={theme.colors.white} />
          <Text style={styles.selectionLocationText}>{postalCode.toUpperCase()}</Text>
        </Pressable>

        <View style={styles.selectionHeaderSpacer} />
      </View>

      <ProgressIndicator />
    </SafeAreaView>
  );
}

function ProgressIndicator() {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressStepDone}>
        <Text style={styles.progressStepDoneText}>✓</Text>
      </View>
      <Text style={styles.progressLabel}>Location</Text>
      <View style={styles.progressLine} />
      <View style={styles.progressStepActive}>
        <Text style={styles.progressStepActiveText}>2</Text>
      </View>
      <Text style={styles.progressLabel}>Restaurants</Text>
      <View style={styles.progressLine} />
      <View style={styles.progressStepPending}>
        <Text style={styles.progressStepPendingText}>3</Text>
      </View>
      <Text style={styles.progressLabelMuted}>Subscribe</Text>
    </View>
  );
}

function LoadingRestaurants({ postalCode }: { postalCode: string }) {
  return (
    <View style={styles.loadingSection}>
      <Text style={styles.loadingTitle}>Finding Restaurants</Text>
      <View style={styles.loadingDots}>
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
      </View>
      <Text style={styles.loadingNear}>Searching near <Text style={styles.copyStrong}>{postalCode.toUpperCase()}</Text></Text>
      <View style={styles.loadingProgress}>
        <View style={styles.loadingProgressFill} />
      </View>
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonBody}>
              <View style={styles.skeletonLineLarge} />
              <View style={styles.skeletonLineMedium} />
              <View style={styles.skeletonStars} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Did You Know?</Text>
        <Text style={styles.tipCopy}>GrubGate helps you compare nearby restaurants before you build your weekly meal plan.</Text>
      </View>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorCard}>
      <View style={styles.errorIcon}>
        <Text style={styles.errorIconText}>!</Text>
      </View>
      <Text style={styles.errorTitle}>Unable to Load</Text>
      <Text style={styles.errorCopy}>{message}</Text>
      <Pressable onPress={onRetry} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

function RestaurantCard({
  restaurant,
  isSelected,
  onSelect,
  onViewMenu,
}: {
  restaurant: Restaurant;
  isSelected: boolean;
  onSelect: () => void;
  onViewMenu: () => void;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isSelected) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 760, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 760, useNativeDriver: true }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [isSelected, pulse]);

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.5] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });
  const rating = typeof restaurant.rating === 'number' ? restaurant.rating : 4.5;
  const reviewCount = typeof restaurant.reviewCount === 'number' ? restaurant.reviewCount : 0;
  const image = restaurant.image || restaurant.imageUrl || restaurant.logo || restaurant.images?.[0];
  const preferences = getRestaurantPreferences(restaurant);

  return (
    <Animated.View style={[styles.cardWrap, isSelected && { transform: [{ scale: glowScale }] }]}>
      {isSelected ? <Animated.View pointerEvents="none" style={[styles.selectedGlow, { opacity: glowOpacity }]} /> : null}

      <View style={[styles.restaurantCard, isSelected && styles.restaurantCardSelected]}>
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: image }} defaultSource={fallbackImage} style={styles.restaurantImage} />
          ) : (
            <Image source={fallbackImage} style={styles.restaurantImage} />
          )}
          <View style={styles.imageShade} />

          {isSelected ? (
            <Animated.View style={[styles.selectedBadge, { opacity: glowOpacity }]}>
              <Text style={styles.selectedBadgeText}>✓ Selected</Text>
            </Animated.View>
          ) : (
            <View style={styles.badgeRow}>
              {restaurant.isPopular ? (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Popular</Text>
                </View>
              ) : null}
              {restaurant.isTopRated ? (
                <View style={styles.topRatedBadge}>
                  <Text style={styles.topRatedBadgeText}>Top Rated</Text>
                </View>
              ) : null}
            </View>
          )}

          <View style={styles.ratingBadge}>
            <Text style={styles.ratingStar}>*</Text>
            <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
            <Text style={styles.ratingBadgeReviews}>({reviewCount})</Text>
          </View>
        </View>

        <View style={styles.restaurantBody}>
          <Text numberOfLines={1} style={[styles.restaurantName, isSelected && styles.restaurantNameSelected]}>
            {restaurant.name || 'Restaurant'}
          </Text>
          <Text numberOfLines={1} style={styles.restaurantCuisine}>{formatCuisine(restaurant.cuisine)}</Text>

          <View style={styles.descriptionWrap}>
            <Text numberOfLines={2} style={styles.restaurantDescription}>
              {restaurant.description || formatCuisine(restaurant.cuisine) || 'Delicious food from a GrubGate partner restaurant.'}
            </Text>
          </View>

          <View style={styles.cardRatingRow}>
            <Text style={styles.starText}>{renderStars(rating)}</Text>
            <Text style={styles.cardRatingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.cardReviewText}>({reviewCount})</Text>
          </View>

          <View style={styles.preferenceWrap}>
            {preferences.slice(0, 3).map((preference) => (
              <View key={preference} style={styles.preferencePill}>
                <Text style={styles.preferencePillText}>{formatTag(preference)}</Text>
              </View>
            ))}
            {preferences.length > 3 ? (
              <View style={styles.preferencePill}>
                <Text style={styles.preferencePillText}>+{preferences.length - 3} more</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.cardActions}>
            <Pressable onPress={onSelect} style={({ pressed }) => [isSelected ? styles.selectedButton : styles.selectButton, pressed && styles.pressed]}>
              <Text style={isSelected ? styles.selectedButtonText : styles.selectButtonText}>
                {isSelected ? 'Selected' : 'Select'}
              </Text>
            </Pressable>

            <Pressable onPress={onViewMenu} style={({ pressed }) => [styles.viewMenuButton, pressed && styles.pressed]}>
              <Text style={styles.viewMenuButtonText}>View Menu</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function getRestaurantId(restaurant: Restaurant) {
  return restaurant.id || restaurant._id || restaurant.name || String(Math.random());
}

function getRestaurantPreferences(restaurant: Restaurant) {
  if (Array.isArray(restaurant.preferences)) return restaurant.preferences.filter(Boolean);
  if (Array.isArray(restaurant.cuisines)) return restaurant.cuisines.filter(Boolean);
  const cuisine = restaurant.cuisine;
  if (Array.isArray(cuisine)) return cuisine.filter(Boolean);
  return cuisine ? [cuisine] : [];
}

function formatCuisine(cuisine?: string[] | string) {
  if (Array.isArray(cuisine)) return cuisine.slice(0, 3).join(' - ') || 'Restaurant';
  return cuisine || 'Restaurant';
}

function formatTag(tag: string) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderStars(rating: number) {
  const fullStars = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, index) => (index < fullStars ? '*' : '*')).join(' ');
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.gray[50],
  },
  selectionHeader: {
    zIndex: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...theme.shadow.sm,
  },
  selectionHeaderRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    backgroundColor: '#FFFFFF',
  },
  selectionBackButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionLocationPill: {
    minHeight: 40,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[1.5],
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[2],
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  selectionLocationText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  selectionHeaderSpacer: {
    width: 44,
    height: 44,
  },
  progressRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  progressStepDone: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[600],
  },
  progressStepActive: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  progressStepPending: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[300],
  },
  progressStepDoneText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  progressStepActiveText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  progressStepPendingText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  progressLabel: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  progressLabelMuted: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  progressLine: {
    width: 18,
    height: 2,
    backgroundColor: theme.colors.gray[300],
  },
  content: {
    paddingBottom: 130,
  },
  copyStrong: {
    color: theme.colors.brand.grubRed,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantGrid: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[6],
  },
  cardWrap: {
    position: 'relative',
  },
  selectedGlow: {
    position: 'absolute',
    top: -4,
    right: -4,
    bottom: -4,
    left: -4,
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.green[600],
  },
  restaurantCard: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restaurantCardSelected: {},
  imageWrap: {
    height: 168,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[200],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  selectedBadge: {
    position: 'absolute',
    top: theme.spacing[3],
    left: theme.spacing[3],
    right: theme.spacing[3],
    alignItems: 'center',
  },
  selectedBadgeText: {
    overflow: 'hidden',
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.green[600],
    color: theme.colors.white,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  badgeRow: {
    position: 'absolute',
    top: theme.spacing[3],
    left: theme.spacing[3],
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  popularBadge: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  popularBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  topRatedBadge: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.yellow[400],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  topRatedBadgeText: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  ratingBadge: {
    position: 'absolute',
    top: theme.spacing[3],
    right: theme.spacing[3],
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    alignItems: 'center',
  },
  ratingStar: {
    color: theme.colors.yellow[400],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  ratingBadgeText: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  ratingBadgeReviews: {
    color: theme.colors.gray[500],
    fontSize: 10,
  },
  restaurantBody: {
    padding: theme.spacing[4],
  },
  restaurantName: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantNameSelected: {
    color: theme.colors.green[800],
  },
  restaurantCuisine: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  descriptionWrap: {
    minHeight: 42,
    marginTop: theme.spacing[2],
  },
  restaurantDescription: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 21,
  },
  cardRatingRow: {
    marginTop: theme.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  starText: {
    color: theme.colors.yellow[400],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  cardRatingText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  cardReviewText: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
  },
  preferenceWrap: {
    minHeight: 28,
    marginTop: theme.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[1],
  },
  preferencePill: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  preferencePillText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  cardActions: {
    marginTop: theme.spacing[4],
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  selectButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  viewMenuButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.brand.grubRed,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[600],
  },
  selectedButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  viewMenuButtonText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  paginationInfo: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[8],
    alignItems: 'center',
  },
  paginationText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  loadingSection: {
    alignItems: 'center',
  },
  loadingTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  loadingDots: {
    marginTop: theme.spacing[3],
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand.grubRed,
  },
  loadingNear: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
  },
  loadingProgress: {
    width: 260,
    height: 8,
    marginTop: theme.spacing[4],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray[200],
    overflow: 'hidden',
  },
  loadingProgressFill: {
    width: '72%',
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.grubRed,
  },
  skeletonGrid: {
    width: '100%',
    marginTop: theme.spacing[8],
    gap: theme.spacing[5],
  },
  skeletonCard: {
    overflow: 'hidden',
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
    ...theme.shadow.md,
  },
  skeletonImage: {
    height: 168,
    backgroundColor: theme.colors.gray[200],
  },
  skeletonBody: {
    padding: theme.spacing[4],
  },
  skeletonLineLarge: {
    height: 22,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.gray[200],
  },
  skeletonLineMedium: {
    width: '72%',
    height: 16,
    marginTop: theme.spacing[3],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.gray[200],
  },
  skeletonStars: {
    width: '52%',
    height: 16,
    marginTop: theme.spacing[4],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.gray[200],
  },
  skeletonButton: {
    height: 42,
    marginTop: theme.spacing[4],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.gray[200],
  },
  tipCard: {
    marginTop: theme.spacing[8],
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: theme.spacing[5],
    ...theme.shadow.md,
  },
  tipTitle: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  tipCopy: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 21,
    textAlign: 'center',
  },
  errorCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[8],
    alignItems: 'center',
    ...theme.shadow.md,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
  },
  errorIconText: {
    color: theme.colors.blue[600],
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  errorTitle: {
    marginTop: theme.spacing[4],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  errorCopy: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  emptyCopy: {
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
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  secondaryButtonText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  continueButton: {
    flex: 1.2,
    minHeight: 48,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.gray[400],
  },
  loadingText: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
  },
  pressed: {
    opacity: 0.76,
  },
});
