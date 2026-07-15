import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useFlash } from '../../contexts/FlashContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { getSubscriptionStatus } from '../../lib/mealCalendarApi';
import { theme } from '../../theme';

const heroImage = require('../../assets/HeroHome.jpg');
const mealImage = require('../../assets/grub-gate-default-img.jpg');
const restaurantImage = require('../../assets/grub-gate-default-restaurant-img.jpg');

type QuickAction = {
  title: string;
  caption: string;
  tone: 'brand' | 'blue' | 'green' | 'yellow';
  action: 'start-plan' | 'weekly-menu' | 'calendar' | 'orders';
};

const quickActionIcons: Record<QuickAction['action'], keyof typeof Ionicons.glyphMap> = {
  'start-plan': 'restaurant-outline',
  'weekly-menu': 'calendar-outline',
  calendar: 'time-outline',
  orders: 'receipt-outline',
};

const popularRestaurants = [
  { name: 'Sakura Sushi', meta: 'Japanese • Fresh rolls', rating: '4.8', image: restaurantImage },
  { name: 'Bamboo Garden', meta: 'Plant-forward bowls', rating: '4.7', image: mealImage },
  { name: 'Al-Sultan Mandi', meta: 'Comfort plates', rating: '4.6', image: heroImage },
] as const;

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const { showFlash } = useFlash();
  const { getTotalItems, selectedRestaurants, hasHydrated } = useMealPlan();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const restaurantRailRef = useRef<ScrollView | null>(null);
  const restaurantRailIndex = useRef(0);

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();

    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );

    floating.start();
    return () => floating.stop();
  }, [entrance, float]);

  useEffect(() => {
    const cardStep = 254;
    const timer = setInterval(() => {
      restaurantRailIndex.current = (restaurantRailIndex.current + 1) % popularRestaurants.length;
      restaurantRailRef.current?.scrollTo({
        x: restaurantRailIndex.current * cardStep,
        animated: true,
      });
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const totalItems = getTotalItems();
  const hasSelectedRestaurants = selectedRestaurants.length > 0;
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const heroScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

  useEffect(() => {
    let mounted = true;

    async function checkSubscription() {
      if (!isAuthenticated) {
        setHasActiveSubscription(false);
        return;
      }

      setIsCheckingSubscription(true);
      const result = await getSubscriptionStatus();

      if (!mounted) return;

      if (result.success && result.data) {
        setHasActiveSubscription(Boolean(result.data.hasActiveSubscription));
      }

      setIsCheckingSubscription(false);
    }

    checkSubscription();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const quickActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      {
        title: hasActiveSubscription ? 'Current Plan' : hasSelectedRestaurants ? 'Continue Plan' : 'Start Plan',
        caption: hasActiveSubscription ? 'View subscription' : hasSelectedRestaurants ? 'Finish setup' : 'Build your week',
        tone: 'brand',
        action: 'start-plan',
      },
    ];

    if (hasHydrated && hasSelectedRestaurants) {
      actions.push({ title: 'Weekly Menu', caption: 'Edit meals', tone: 'blue', action: 'weekly-menu' });
    }

    if (hasActiveSubscription || totalItems > 0) {
      actions.push({
        title: 'Calendar',
        caption: hasActiveSubscription ? 'Subscribed meals' : 'Preview days',
        tone: 'green',
        action: 'calendar',
      });
    }

    actions.push({ title: 'Orders', caption: 'Track meals', tone: 'yellow', action: 'orders' });
    return actions;
  }, [hasActiveSubscription, hasHydrated, hasSelectedRestaurants, totalItems]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    showFlash('Please sign in to continue.', 'info');
    router.push('/login');
    return false;
  };

  const handleQuickAction = (action: QuickAction['action']) => {
    if (!requireAuth()) return;

    if (action === 'orders') {
      router.push('/your-orders');
      return;
    }

    if (action === 'weekly-menu') {
      if (!hasSelectedRestaurants) {
        showFlash('Select a restaurant before editing your weekly menu.', 'info');
        router.push('/plan/restaurants?source=plan');
        return;
      }

      router.push('/weekly-menu');
      return;
    }

    if (action === 'calendar') {
      if (hasActiveSubscription) {
        router.push('/meal-calendar?source=subscription');
        return;
      }

      if (totalItems > 0) {
        router.push('/meal-calendar?includeWeek2=0');
        return;
      }

      showFlash('Add at least one meal before previewing your calendar.', 'info');
      router.push(hasSelectedRestaurants ? '/weekly-menu' : '/plan');
      return;
    }

    if (hasActiveSubscription) {
      router.push('/meal-calendar?source=subscription');
      return;
    }

    if (hasSelectedRestaurants) {
      router.push('/weekly-menu');
      return;
    }

    router.push('/plan');
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.heroCardWrap, { transform: [{ translateY: floatY }, { scale: heroScale }] }]}>
        <Pressable
          onPress={() => handleQuickAction('start-plan')}
          style={({ pressed }) => [styles.heroPressable, pressed && styles.pressedScale]}
        >
          <ImageBackground source={heroImage} resizeMode="cover" style={styles.heroCard}>
            <View style={styles.heroShade} />
            <View style={styles.heroContent}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>Live weekly planning</Text>
              </View>
              <Text style={styles.heroTitle}>Meals from real kitchens, arranged around your week.</Text>
              <Text style={styles.heroText}>Pick restaurants once, tap slots, and keep your schedule delicious without daily ordering.</Text>
              <Pressable
                onPress={() => handleQuickAction('start-plan')}
                style={({ pressed }) => [styles.heroButton, pressed && styles.pressedScale]}
              >
                <Text style={styles.heroButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
              </Pressable>
            </View>
          </ImageBackground>
        </Pressable>
      </Animated.View>

      <View style={styles.quickActionGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.title}
            onPress={() => handleQuickAction(action.action)}
            style={({ pressed }) => [
              styles.quickActionCard,
              pressed && styles.pressedScale,
            ]}
          >
            <View style={styles.quickIcon}>
              <Ionicons name={quickActionIcons[action.action]} size={22} color={theme.colors.brand.grubRed} />
            </View>
            <Text style={styles.quickTitle}>{action.title}</Text>
            <Text style={styles.quickCaption}>{action.caption}</Text>
            {action.action === 'start-plan' && isCheckingSubscription ? (
              <Text style={styles.syncHint}>Checking...</Text>
            ) : null}
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Popular restaurants</Text>
      </View>
      <ScrollView
        ref={restaurantRailRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealRail}
        decelerationRate="fast"
        snapToInterval={254}
        onScrollBeginDrag={() => {
          restaurantRailIndex.current = 0;
        }}
      >
        {popularRestaurants.map((restaurant) => (
          <View key={restaurant.name} style={styles.mealCard}>
            <View style={styles.mealImageWrap}>
              <Image source={restaurant.image} style={styles.mealImage} resizeMode="cover" />
              <View style={styles.restaurantTag}>
                <Text style={styles.restaurantTagText}>Popular</Text>
              </View>
            </View>
            <View style={styles.mealBody}>
              <View style={styles.restaurantTitleRow}>
                <Text style={styles.mealName}>{restaurant.name}</Text>
                <View style={styles.ratingPill}>
                  <Text style={styles.ratingNumberText}>{restaurant.rating}</Text>
                  <Text style={styles.ratingPillText}>★ {restaurant.rating}</Text>
                </View>
              </View>
              <Text style={styles.mealMeta}>{restaurant.meta}</Text>
              <View style={styles.mealFooter}>
                <Text style={styles.restaurantInfo}>Subscription meals</Text>
                <Text style={styles.mealPrice}>★ {restaurant.rating}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  content: {
    paddingBottom: theme.layout.bottomNavHeight + theme.spacing[6],
  },
  heroCardWrap: {
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[4],
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
    ...theme.shadow.lg,
  },
  heroPressable: {
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
  },
  heroCard: {
    minHeight: 292,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.gray[900],
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.46)',
  },
  heroContent: {
    padding: theme.spacing[5],
  },
  livePill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.green[600],
  },
  livePillText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  heroTitle: {
    marginTop: theme.spacing[5],
    color: theme.colors.white,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  heroText: {
    marginTop: theme.spacing[3],
    color: '#e5e7eb',
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.snug,
  },
  heroButton: {
    marginTop: theme.spacing[5],
    minHeight: 50,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  heroButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  quickActionGrid: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[6],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[4],
  },
  quickActionCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 126,
    borderRadius: theme.radius['2xl'],
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: '#FFFFFF',
    ...theme.shadow.md,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
    backgroundColor: '#FFF1F2',
  },
  quickTitle: {
    color: '#1A1A1A',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  quickCaption: {
    marginTop: theme.spacing[1],
    color: '#666666',
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 17,
  },
  syncHint: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[500],
    fontSize: 11,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sectionTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  sectionHeaderRow: {
    marginTop: theme.spacing[8],
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealRail: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[2],
    gap: theme.spacing[3],
  },
  mealCard: {
    width: 238,
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadow.sm,
  },
  mealImageWrap: {
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: 142,
  },
  restaurantTag: {
    position: 'absolute',
    left: theme.spacing[3],
    top: theme.spacing[3],
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  restaurantTagText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  mealBody: {
    padding: theme.spacing[4],
  },
  restaurantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
  },
  mealName: {
    flex: 1,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  ratingPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    backgroundColor: '#fff7ed',
  },
  ratingNumberText: {
    color: '#c2410c',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  ratingPillText: {
    display: 'none',
  },
  mealMeta: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 17,
  },
  mealFooter: {
    marginTop: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealPrice: {
    display: 'none',
  },
  restaurantInfo: {
    flex: 1,
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  addBubble: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[600],
  },
  addBubbleText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  pressed: {
    opacity: 0.82,
  },
  pressedScale: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
