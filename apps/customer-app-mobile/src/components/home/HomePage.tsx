import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../contexts/AuthContext';
import { useFlash } from '../../contexts/FlashContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { theme } from '../../theme';
import { RestaurantCardSkeleton } from '../ui/RestaurantCardSkeleton';
import { AnimatedPressable } from '../AnimatedPressable';

const heroImage = require('../../assets/HeroHome.jpg');
const mealImage = require('../../assets/grub-gate-default-img.jpg');
const restaurantImage = require('../../assets/grub-gate-default-restaurant-img.jpg');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

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
  const { isAuthenticated, isSubscribed } = useAuth();
  const { showFlash } = useFlash();
  const { getTotalItems, selectedRestaurants, hasHydrated } = useMealPlan();
  
  const entrance = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  
  // Staggered entrance values for the 4 Quick Action cards
  const quickActionAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  
  // Hardware-accelerated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollInfo, setScrollInfo] = useState({ contentHeight: 0, layoutHeight: 0 });
  
  const restaurantRailRef = useRef<ScrollView | null>(null);
  const restaurantRailIndex = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 1. Hero Card Entrance
    Animated.timing(entrance, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();

    // 2. Cascading Staggered Entrance for Quick Actions
    Animated.stagger(100, quickActionAnims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      })
    )).start();

    // 3. Floating Animation for the Hero Card
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );

    floating.start();
    return () => floating.stop();
  }, [entrance, float, quickActionAnims]);

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

  // PREMIUM PARALLAX: Moves the background image slowly as you scroll
  const parallaxTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 60],
    extrapolate: 'clamp',
  });

  // PREMIUM SCROLL SHADOWS
  const maxScrollOffset = Math.max(0, scrollInfo.contentHeight - scrollInfo.layoutHeight);
  
  // Bottom Shadow (Fades out when reaching the bottom)
  const bottomShadowOpacity = maxScrollOffset > 0 
    ? scrollY.interpolate({
        inputRange: [0, Math.max(0, maxScrollOffset - 60), maxScrollOffset],
        outputRange: [1, 1, 0], 
        extrapolate: 'clamp',
      }) 
    : 0;

  // Top Shadow (Fades IN and increases as you scroll down)
  const topShadowOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const quickActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      {
        title: isSubscribed ? "Select This Week's Meals" : hasSelectedRestaurants ? 'Continue Plan' : 'Start Plan',
        caption: isSubscribed ? 'Update your weekly meals' : hasSelectedRestaurants ? 'Finish setup' : 'Build your week',
        tone: 'brand',
        action: 'start-plan',
      },
    ];

    if (!isSubscribed && hasHydrated && hasSelectedRestaurants) {
      actions.push({ title: 'Weekly Menu', caption: 'Edit meals', tone: 'blue', action: 'weekly-menu' });
    }

    if (isSubscribed || totalItems > 0) {
      actions.push({
        title: 'Calendar',
        caption: isSubscribed ? 'Subscribed meals' : 'Preview days',
        tone: 'green',
        action: 'calendar',
      });
    }

    actions.push({ title: 'Orders', caption: 'Track meals', tone: 'yellow', action: 'orders' });
    return actions;
  }, [hasHydrated, hasSelectedRestaurants, isSubscribed, totalItems]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    showFlash('Please sign in to continue.', 'info');
    router.push('/login');
    return false;
  };

  const handleQuickAction = (action: QuickAction['action']) => {
    if (!requireAuth()) return;
    if (action === 'orders') { router.push('/your-orders'); return; }
    if (action === 'weekly-menu') {
      if (isSubscribed) { router.push('/meal-calendar?source=subscription'); return; }
      if (!hasSelectedRestaurants) {
        showFlash('Select a restaurant before editing your weekly menu.', 'info');
        router.push('/plan/restaurants?source=plan');
        return;
      }
      router.push('/weekly-menu');
      return;
    }
    if (action === 'calendar') {
      if (isSubscribed) { router.push('/meal-calendar?source=subscription'); return; }
      if (totalItems > 0) { router.push('/meal-calendar?includeWeek2=0'); return; }
      showFlash('Add at least one meal before previewing your calendar.', 'info');
      router.push(hasSelectedRestaurants ? '/weekly-menu' : '/plan');
      return;
    }
    if (isSubscribed || hasSelectedRestaurants) { router.push('/weekly-menu'); return; }
    router.push('/plan');
  };

  return (
    <View style={styles.page}>
      
      {/* Dynamic Top Shadow Effect */}
      <AnimatedLinearGradient
        colors={['rgba(0, 0, 0, 0.15)', 'transparent']}
        style={[styles.topScrollShadow, { opacity: topShadowOpacity }]}
        pointerEvents="none"
      />

      <Animated.ScrollView
        ref={scrollRef as any}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onLayout={(e) => setScrollInfo(prev => ({ ...prev, layoutHeight: e.nativeEvent.layout.height }))}
        onContentSizeChange={(_, height) => setScrollInfo(prev => ({ ...prev, contentHeight: height }))}
      >
        <Animated.View style={[styles.heroCardWrap, { transform: [{ translateY: floatY }, { scale: heroScale }] }]}>
          <AnimatedPressable onPress={() => handleQuickAction('start-plan')} style={styles.heroPressable}>
            <View style={styles.heroCard}>
              
              {/* Parallax Hero Image */}
              <Animated.Image 
                source={heroImage} 
                style={[styles.heroBackgroundImage, { transform: [{ translateY: parallaxTranslateY }] }]} 
                resizeMode="cover" 
              />
              <View style={styles.heroShade} />
              
              <View style={styles.heroContent}>
                {/* Premium Frosted Glass Pill */}
                <BlurView intensity={40} tint="dark" style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.livePillText}>Live weekly planning</Text>
                </BlurView>
                
                <Text style={styles.heroTitle}>Meals from real kitchens, arranged around your week.</Text>
                <Text style={styles.heroText}>Pick restaurants once, tap slots, and keep your schedule delicious without daily ordering.</Text>
                
                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>{isSubscribed ? "Select This Week's Meals" : 'Get Started'}</Text>
                  <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
                </View>
              </View>
            </View>
          </AnimatedPressable>
        </Animated.View>

        <View style={styles.quickActionGrid}>
          {quickActions.map((action, index) => {
            const anim = quickActionAnims[index];
            return (
              <Animated.View 
                key={action.title} 
                style={[styles.quickActionWrapper, {
                  opacity: anim,
                  transform: [
                    { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                    { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                  ]
                }]}
              >
                <AnimatedPressable onPress={() => handleQuickAction(action.action)} style={styles.quickActionCard}>
                  <View style={styles.quickIcon}>
                    <Ionicons name={quickActionIcons[action.action]} size={22} color={theme.colors.brand.grubRed} />
                  </View>
                  <Text style={styles.quickTitle}>{action.title}</Text>
                  <Text style={styles.quickCaption}>{action.caption}</Text>
                </AnimatedPressable>
              </Animated.View>
            );
          })}
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
          onScrollBeginDrag={() => { restaurantRailIndex.current = 0; }}
        >
          {!hasHydrated ? (
            <>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </>
          ) : (
            popularRestaurants.map((restaurant) => (
              <AnimatedPressable key={restaurant.name} style={styles.mealCard}>
                <View style={styles.mealImageWrap}>
                  <Image source={restaurant.image} style={styles.mealImage} resizeMode="cover" />
                  {/* Premium Frosted Glass Tag */}
                  <BlurView intensity={60} tint="light" style={styles.restaurantTag}>
                    <Text style={styles.restaurantTagText}>Popular</Text>
                  </BlurView>
                </View>
                <View style={styles.mealBody}>
                  <View style={styles.restaurantTitleRow}>
                    <Text style={styles.mealName}>{restaurant.name}</Text>
                    <View style={styles.ratingPill}>
                      <Text style={styles.ratingNumberText}>{restaurant.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.mealMeta}>{restaurant.meta}</Text>
                  <View style={styles.mealFooter}>
                    <Text style={styles.restaurantInfo}>Subscription meals</Text>
                  </View>
                </View>
              </AnimatedPressable>
            ))
          )}
        </ScrollView>
      </Animated.ScrollView>
      
      {/* Dynamic Bottom Shadow Effect */}
      <AnimatedLinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.4)']}
        style={[styles.bottomScrollShadow, { opacity: bottomShadowOpacity }]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
  },
  content: {
    paddingBottom: 140, 
  },
  topScrollShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 10, // Ensures it sits above the scrolling content
  },
  bottomScrollShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
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
  heroBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '130%', // Taller than the container to allow room for the Parallax shift
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
    overflow: 'hidden', // Required for BlurView to respect border radius
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
  quickActionWrapper: {
    flexGrow: 1,
    flexBasis: '46%',
  },
  quickActionCard: {
    flex: 1,
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
    overflow: 'hidden', // Required for BlurView
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
  restaurantInfo: {
    flex: 1,
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});