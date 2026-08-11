import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFlash } from '../contexts/FlashContext';
import { usePlanning } from '../contexts/PlanningContext';
import { getRestaurantsByPostalCode } from '../lib/restaurantApi';
import { theme } from '../theme';

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

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            router.replace('/');
          }}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={25} color={theme.colors.gray[900]} />
        </Pressable>

        <View style={styles.copyColumn}>
          <Text style={styles.title}>Plan Your Perfect Meals with GrubGate</Text>
          <Text style={styles.description}>
            Create personalized meal schedules from Montreal's best restaurants. Fresh, delicious meals delivered to your door.
          </Text>
        </View>

        <View style={styles.searchPanel}>
          <PostalCodeSearchForm isSearching={isSearching} onSubmit={handleFindMeals} />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerBubble}>
            <Text style={styles.dividerText}>or</Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        <Pressable onPress={handleUseCurrentLocation} style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}>
          <Ionicons name="locate-outline" size={20} color={theme.colors.brand.grubRed} />
          <Text style={styles.locationText}>Use current location</Text>
        </Pressable>

        <View style={styles.foodGrid}>
          {masonryColumns.map((column, columnIndex) => (
            <View key={`column-${columnIndex}`} style={styles.foodColumn}>
              {column.map((tile, tileIndex) => (
                <View
                  key={tile.id}
                  style={[
                    styles.foodTile,
                    (columnIndex + tileIndex) % 2 === 0 ? styles.foodTileTall : styles.foodTileShort,
                  ]}
                >
                  <Image source={{ uri: tile.uri }} style={styles.foodImage} />
                  <View style={styles.foodOverlay} />
                  <View style={styles.foodBadge}>
                    <Text style={styles.foodBadgeText}>{tile.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
        <Ionicons name="location-outline" size={20} color={theme.colors.gray[500]} />
        <TextInput
          value={postalCode}
          onChangeText={(value) => {
            setPostalCode(value);
            if (addressError) {
              setAddressError('');
            }
          }}
          onSubmitEditing={handleSubmit}
          placeholder="Enter your postal code"
          placeholderTextColor={theme.colors.gray[500]}
          autoCapitalize="characters"
          autoCorrect={false}
          onFocus={() => setIsPostalFocused(true)}
          onBlur={() => setIsPostalFocused(false)}
          returnKeyType="search"
          style={styles.postalInput}
        />
      </View>

      <Pressable
        disabled={isSearching || !formattedPostalCode}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.findButton,
          (!formattedPostalCode || isSearching) && styles.buttonDisabled,
          pressed && styles.pressed,
        ]}
      >
        {isSearching ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.findButtonText}>Get nearest restaurants</Text>
        )}
      </Pressable>

      {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
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
    fontWeight: '700',
    textAlign: 'left',
  },
  description: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    textAlign: 'left',
  },
  searchPanel: {
    width: '100%',
    marginTop: theme.spacing[6],
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputShell: {
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: '#F3F4F6',
    paddingHorizontal: theme.spacing[4],
  },
  inputShellFocused: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  postalInput: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    outlineStyle: 'solid',
    outlineWidth: 0,
    outlineColor: 'transparent',
    boxShadow: 'none',
  },
  findButton: {
    minHeight: 54,
    marginTop: theme.spacing[4],
    borderRadius: 12,
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
  },
  dividerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray[300],
  },
  dividerBubble: {
    marginHorizontal: theme.spacing[3],
    borderRadius: theme.radius.full,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  dividerText: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  locationButton: {
    minHeight: 42,
    marginTop: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  locationText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
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
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[200],
    ...theme.shadow.md,
  },
  foodTileTall: {
    height: 220,
  },
  foodTileShort: {
    height: 176,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  foodBadge: {
    position: 'absolute',
    left: theme.spacing[3],
    bottom: theme.spacing[3],
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    alignSelf: 'flex-start',
  },
  foodBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
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
