import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { useFlash } from '../contexts/FlashContext';
import { usePlanning } from '../contexts/PlanningContext';
import { getRestaurantsByPostalCode } from '../lib/restaurantApi';
import { theme } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

const foodTiles = [
  {
    id: 'noodles',
    uri: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80',
    label: 'Asian Noodles',
  },
  {
    id: 'burger',
    uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    label: 'American Cuisine',
  },
  {
    id: 'sushi',
    uri: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
    label: 'Sushi Night',
  },
  {
    id: 'salad',
    uri: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
    label: 'Fresh & Light',
  },
];

export default function PlanScreen() {
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated, isSubscribed, isCheckingSubscription } = useAuth();
  const { showFlash } = useFlash();
  const { setPostalCode: setPlanningPostalCode, setSource } = usePlanning();
  const hasRedirectedSubscribedUser = useRef(false);

  // Animation refs
  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const dividerAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  
  // Custom Radar Animation Refs
  const radarScale = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.6)).current;

  const masonryColumns = useMemo(
    () => [
      foodTiles.filter((_, index) => index % 2 === 0),
      foodTiles.filter((_, index) => index % 2 === 1),
    ],
    [],
  );

  useEffect(() => {
    if (!isAuthenticated || isCheckingSubscription || !isSubscribed || hasRedirectedSubscribedUser.current) return;

    hasRedirectedSubscribedUser.current = true;
    showFlash('Your subscription is already active. Opening your meal calendar instead.', 'info');
    router.replace('/meal-calendar?source=subscription');
  }, [isAuthenticated, isCheckingSubscription, isSubscribed, showFlash]);

  useEffect(() => {
    if (isAuthenticated && isSubscribed) return;
    hasRedirectedSubscribedUser.current = false;
  }, [isAuthenticated, isSubscribed]);

  useEffect(() => {
    // Premium Spring Staggered Entrance
    Animated.stagger(120, [
      Animated.spring(titleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.spring(dividerAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.spring(gridAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    // Premium Radar Ping Animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(radarScale, {
          toValue: 2.2,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(radarOpacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [titleAnim, cardAnim, dividerAnim, gridAnim, radarScale, radarOpacity]);

  // ALL HOOKS MUST GO ABOVE EARLY RETURNS
  const handleFindMeals = useCallback(async (formattedPostalCode: string) => {
    if (!isAuthenticated) {
      showFlash('Please sign in to start your meal plan.', 'info');
      router.push('/login');
      return null;
    }

    if (isCheckingSubscription) {
      showFlash('Checking your subscription status. Please wait a moment.', 'info');
      return null;
    }

    setIsSearching(true);

    try {
      const result = await getRestaurantsByPostalCode(formattedPostalCode, { limit: 4 });

      if (!result.success) {
        return result.error || 'Unable to search for restaurants. Please try again.';
      }

      if (result.data.length === 0) {
        showFlash(`No restaurants available in ${formattedPostalCode} yet. Try a different postal code.`, 'info');
        return null;
      }

      const count = result.totalItems || result.data.length;
      setPlanningPostalCode(formattedPostalCode);
      setSource('plan');
      showFlash(`Found ${count} restaurants near ${formattedPostalCode}!`, 'success');
      router.push({
        pathname: '/plan/restaurants',
        params: { source: 'plan' },
      });
      return null;
    } catch {
      return 'Unable to connect to our servers. Please check your connection and try again.';
    } finally {
      setIsSearching(false);
    }
  }, [isAuthenticated, isCheckingSubscription, setPlanningPostalCode, setSource, showFlash]);

  const handleUseCurrentLocation = () => {
    if (!isAuthenticated) {
      showFlash('Please sign in to use your current location.', 'info');
      router.push('/login');
      return;
    }
    showFlash('Native location detection will be added in the location phase.', 'info');
  };

  // EARLY RETURNS MUST GO BELOW ALL HOOKS
  if (isAuthenticated && isCheckingSubscription) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.redirectState}>
          <ActivityIndicator color={theme.colors.brand.grubRed} />
          <Text style={styles.redirectText}>Checking your subscription...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isAuthenticated && isSubscribed) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.redirectState}>
          <ActivityIndicator color={theme.colors.brand.grubRed} />
          <Text style={styles.redirectText}>Opening your active meal calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        <AnimatedPressable
          onPress={() => { router.canGoBack() ? router.back() : router.replace('/'); }}
          hitSlop={12}
          style={[styles.backButton, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={25} color={theme.colors.gray[900]} />
        </AnimatedPressable>

        <Animated.View style={[styles.copyColumn, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <Text style={styles.title}>Plan Your Perfect Meals with GrubGate</Text>
          <Text style={styles.description}>
            Create personalized meal schedules from Montreal's best restaurants. Fresh, delicious meals delivered to your door.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.searchPanel, { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }] }]}>
          <PostalCodeSearchForm isSearching={isSearching} onSubmit={handleFindMeals} />
        </Animated.View>

        <Animated.View style={[styles.dividerRow, { opacity: dividerAnim, transform: [{ translateY: dividerAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }]}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerBubble}>
            <Text style={styles.dividerText}>or</Text>
          </View>
          <View style={styles.dividerLine} />
        </Animated.View>

        <AnimatedPressable onPress={handleUseCurrentLocation} style={[styles.locationButton, { opacity: dividerAnim, transform: [{ translateY: dividerAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }]}>
          <View style={styles.locationButtonInner}>
            <View style={styles.radarContainer}>
              <Animated.View style={[styles.radarRing, { transform: [{ scale: radarScale }], opacity: radarOpacity }]} />
              <Ionicons name="locate-outline" size={20} color={theme.colors.brand.grubRed} />
            </View>
            <Text style={styles.locationText}>Use current location</Text>
          </View>
        </AnimatedPressable>

        <Animated.View style={[styles.foodGrid, { opacity: gridAnim, transform: [{ translateY: gridAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          {masonryColumns.map((column, columnIndex) => (
            <View key={`column-${columnIndex}`} style={styles.foodColumn}>
              {column.map((tile, tileIndex) => (
                <FoodTile key={tile.id} tile={tile} isTall={(columnIndex + tileIndex) % 2 === 0} />
              ))}
            </View>
          ))}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

function FoodTile({ tile, isTall }: { tile: typeof foodTiles[0]; isTall: boolean }) {
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Cinematic EaseInOut breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.06,
          duration: 5500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 5500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breatheAnim]);

  return (
    <View style={[styles.foodTile, isTall ? styles.foodTileTall : styles.foodTileShort]}>
      <Animated.Image source={{ uri: tile.uri }} style={[styles.foodImage, { transform: [{ scale: breatheAnim }] }]} />
      <View style={styles.foodOverlay} />
      {/* Premium Glassmorphism Tag */}
      <BlurView intensity={70} tint="dark" style={styles.foodBadge}>
        <Text style={styles.foodBadgeText}>{tile.label}</Text>
      </BlurView>
    </View>
  );
}

function PostalCodeSearchForm({
  isSearching,
  onSubmit,
}: {
  isSearching: boolean;
  onSubmit: (formattedPostalCode: string) => Promise<string | null>;
}) {
  const [postalCode, setPostalCode] = useState('');
  const [isPostalFocused, setIsPostalFocused] = useState(false);
  const [addressError, setAddressError] = useState('');
  const formattedPostalCode = useMemo(() => postalCode.trim().toUpperCase(), [postalCode]);

  const handleSubmit = useCallback(async () => {
    if (!formattedPostalCode) {
      setAddressError('Please enter your postal code.');
      return;
    }
    setAddressError('');
    const nextError = await onSubmit(formattedPostalCode);
    if (nextError) {
      setAddressError(nextError);
    }
  }, [formattedPostalCode, onSubmit]);

  return (
    <>
      <View style={[styles.inputShell, isPostalFocused && styles.inputShellFocused]}>
        <Ionicons name="location-outline" size={20} color={isPostalFocused ? theme.colors.brand.grubRed : theme.colors.gray[500]} />
        <TextInput
          value={postalCode}
          onChangeText={(value) => {
            setPostalCode(value);
            if (addressError) setAddressError('');
          }}
          onSubmitEditing={handleSubmit}
          placeholder="Enter your postal code"
          placeholderTextColor={theme.colors.gray[400]}
          autoCapitalize="characters"
          autoCorrect={false}
          onFocus={() => setIsPostalFocused(true)}
          onBlur={() => setIsPostalFocused(false)}
          returnKeyType="search"
          style={styles.postalInput}
        />
      </View>

      <AnimatedPressable
        disabled={isSearching || !formattedPostalCode}
        onPress={handleSubmit}
        style={[
          styles.findButton,
          (!formattedPostalCode || isSearching) && styles.buttonDisabled,
        ]}
      >
        {isSearching ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.findButtonText}>Get nearest restaurants</Text>
        )}
      </AnimatedPressable>

      {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Off-white for deep contrast
  },
  content: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: 120,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: theme.spacing[1],
    marginLeft: -theme.spacing[1],
  },
  copyColumn: {
    paddingTop: theme.spacing[4],
  },
  title: {
    color: theme.colors.gray[900],
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'left',
  },
  description: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[500],
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'left',
  },
  searchPanel: {
    width: '100%',
    marginTop: theme.spacing[6],
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[5],
    // Deep diffused elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 20,
  },
  inputShell: {
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: '#F3F4F6',
    paddingHorizontal: theme.spacing[4],
    borderWidth: 2,
    borderColor: 'transparent', // Pre-allocate border to prevent jumping
  },
  inputShellFocused: {
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: '#FFFFFF',
  },
  postalInput: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
  findButton: {
    minHeight: 54,
    marginTop: theme.spacing[4],
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  findButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  errorText: {
    marginTop: theme.spacing[3],
    color: theme.colors.red[700],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    fontWeight: '600',
  },
  dividerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[8],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray[300],
  },
  dividerBubble: {
    marginHorizontal: theme.spacing[3],
    borderRadius: theme.radius.full,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: theme.spacing[3],
  },
  dividerText: {
    color: theme.colors.gray[400],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  locationButton: {
    marginTop: theme.spacing[6],
  },
  locationButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  radarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    marginRight: 8,
  },
  radarRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.brand.grubRed,
  },
  locationText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  foodGrid: {
    marginTop: theme.spacing[8],
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  foodColumn: {
    flex: 1,
    gap: theme.spacing[4],
  },
  foodTile: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[200],
    ...theme.shadow.md,
  },
  foodTileTall: {
    height: 240,
  },
  foodTileShort: {
    height: 180,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)', // Slightly darker to make tags pop
  },
  foodBadge: {
    position: 'absolute',
    left: theme.spacing[3],
    bottom: theme.spacing[3],
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  foodBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  redirectState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
  },
  redirectText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
  },
});