import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router, Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFlash } from '../contexts/FlashContext';
import {
  mealTypes,
  type DayId,
  type MealType,
  type PlannedMealItem,
  useMealPlan,
} from '../contexts/MealPlanContext';
import {
  getMealCalendar,
  getSubscriptionStatus,
  hasSubscriptionCoverageForNextTwoWeeks,
  type SubscriptionCalendarData,
  type SubscriptionCalendarMeal,
  type SubscriptionStatus,
} from '../lib/mealCalendarApi';
import { MealDetailsSheet } from '../components/meal-calendar/MealDetailsSheet';
import { theme } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

const calendarDayOrder: DayId[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

type MealDetailsSelection = {
  date: Date;
  mealType: MealType;
  items: PlannedMealItem[];
};

export default function MealCalendarScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ includeWeek2?: string | string[]; source?: string | string[] }>();
  const { getMealItems, getTotalItems, getTotalCost, hasHydrated } = useMealPlan();
  const { isAuthenticated, isCheckingSubscription, isHydrating, isSubscribed } = useAuth();
  const { showFlash } = useFlash();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionCalendar, setSubscriptionCalendar] = useState<SubscriptionCalendarData | null>(null);
  const [isLoadingSubscriptionCalendar, setIsLoadingSubscriptionCalendar] = useState(true);
  const [subscriptionCalendarError, setSubscriptionCalendarError] = useState<string | null>(null);
  const [isSubmittingUpdates, setIsSubmittingUpdates] = useState(false);

  const weekStart = useMemo(() => getNextSunday(), []);
  const includeWeek2Param = Array.isArray(params.includeWeek2) ? params.includeWeek2[0] : params.includeWeek2;
  const sourceParam = Array.isArray(params.source) ? params.source[0] : params.source;
  const week1TotalMeals = getTotalItems(0);
  const week2TotalMeals = getTotalItems(1);
  const shouldIncludeWeek2 = includeWeek2Param === '1' || week2TotalMeals > 0;
  const checkoutTotalMeals = week1TotalMeals + (shouldIncludeWeek2 ? week2TotalMeals : 0);
  const checkoutTotalCost = getTotalCost(0) + (shouldIncludeWeek2 ? getTotalCost(1) : 0);
  const [selectedMealDetails, setSelectedMealDetails] = useState<MealDetailsSelection | null>(null);
  const shouldShowSubscribedOverview =
    sourceParam === 'subscription' && Boolean(subscriptionCalendar?.meals?.length || subscriptionCalendar?.calendar);
  const isScreenBootstrapping =
    !hasHydrated || isHydrating || (sourceParam === 'subscription' && isAuthenticated && isCheckingSubscription);

  useEffect(() => {
    let mounted = true;

    async function loadSubscriptionCalendar() {
      if (isScreenBootstrapping) {
        return;
      }

      if (!isAuthenticated) {
        if (!mounted) return;
        setSubscriptionStatus(null);
        setSubscriptionCalendar(null);
        setSubscriptionCalendarError(null);
        setIsLoadingSubscriptionCalendar(false);
        return;
      }

      setIsLoadingSubscriptionCalendar(true);
      setSubscriptionCalendar(null);
      setSubscriptionCalendarError(null);

      const statusResult = await getSubscriptionStatus();

      if (!mounted) return;

      if (statusResult.success && statusResult?.data) {
        setSubscriptionStatus(statusResult.data);
        const hasBlockingCoverage = hasSubscriptionCoverageForNextTwoWeeks(statusResult.data);

        if (hasBlockingCoverage) {
          const calendarResult = await getMealCalendar();
          if (!mounted) return;

          if (calendarResult.success && (calendarResult?.data?.meals?.length || calendarResult?.data?.calendar)) {
            setSubscriptionCalendar(calendarResult.data);
          } else {
            setSubscriptionCalendarError(calendarResult.error || 'We could not load your active subscription yet.');
          }
        }
      } else {
        setSubscriptionStatus(null);
        setSubscriptionCalendarError(statusResult.error || 'Unable to check subscription status right now.');
      }

      setIsLoadingSubscriptionCalendar(false);
    }

    loadSubscriptionCalendar();

    return () => {
      mounted = false;
    };
  }, [hasHydrated, isAuthenticated, isScreenBootstrapping, isSubscribed, sourceParam]);

  const handleSubscribe = () => {
    if (checkoutTotalMeals === 0) {
      showFlash('Please select at least one meal before choosing a subscription plan.', 'info');
      router.push('/weekly-menu');
      return;
    }

    router.push('/subscription');
  };

  const updateSubscriptionMeals = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  const handleConfirmMealUpdates = async () => {
    setIsSubmittingUpdates(true);

    try {
      await updateSubscriptionMeals();
      showFlash('Your meals for this week have been updated!', 'success');
      router.replace('/');
    } finally {
      setIsSubmittingUpdates(false);
    }
  };

  const handleEditSlot = (weekIndex: number, day: DayId, mealType: MealType) => {
    showFlash(`Edit ${formatDayName(day)} ${formatMealType(mealType)} in the menu.`, 'info');
    router.push({
      pathname: '/weekly-menu',
      params: {
        day,
        mealType,
        week: String(weekIndex),
      },
    });
  };

  const handleOpenMealDetails = (weekIndex: number, day: DayId, mealType: MealType) => {
    const items = getMealItems(day, mealType, weekIndex);
    if (items.length === 0) return;

    const dayIndex = calendarDayOrder.indexOf(day);
    if (dayIndex < 0) return;

    setSelectedMealDetails({
      date: getDateForIndex(weekStart, dayIndex + weekIndex * 7),
      mealType,
      items,
    });
  };

  if (isScreenBootstrapping || isLoadingSubscriptionCalendar) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.brand.grubRed} size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </>
    );
  }

  if (shouldShowSubscribedOverview && subscriptionCalendar) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SubscribedMealCalendar calendarData={subscriptionCalendar} />
      </>
    );
  }

  if (sourceParam === 'subscription' && isSubscribed && !isLoadingSubscriptionCalendar && subscriptionCalendarError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.emptyCalendarTitle}>We couldn't load your active subscription yet.</Text>
          <Text style={styles.emptyCalendarCopy}>
            {subscriptionCalendarError || 'Please try again in a moment or return home and reopen your meal calendar.'}
          </Text>
          <AnimatedPressable
            onPress={() => router.replace('/')}
            style={[styles.previewSubscribeButton, styles.retryButton]}
          >
            <Text style={styles.previewSubscribeButtonText}>Back to Home</Text>
          </AnimatedPressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.page}>
        <View style={styles.previewHeader}>
          <AnimatedPressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.push('/weekly-menu');
            }}
            hitSlop={12}
            style={styles.previewHeaderButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.gray[900]} />
          </AnimatedPressable>

          <Text style={styles.previewHeaderTitle}>Plan Preview</Text>
          <View style={styles.previewHeaderButton} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.previewScrollContent,
            { paddingBottom: insets.bottom + PREVIEW_FOOTER_HEIGHT + theme.spacing[4] },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryPrimary}>
              {checkoutTotalMeals} Meal{checkoutTotalMeals === 1 ? '' : 's'}
            </Text>
            <Text style={styles.orderSummaryPrimaryPrice}>{formatPrice(checkoutTotalCost)}</Text>
          </View>

          <WeekMenuSection
            title="Week 1 Menu"
            weekIndex={0}
            weekStart={weekStart}
            weekOffsetDays={0}
            getMealItems={getMealItems}
            onEdit={handleEditSlot}
            onViewDetails={handleOpenMealDetails}
          />

          {shouldIncludeWeek2 ? (
            <WeekMenuSection
              title="Week 2 Menu"
              weekIndex={1}
              weekStart={weekStart}
              weekOffsetDays={7}
              getMealItems={getMealItems}
              onEdit={handleEditSlot}
              onViewDetails={handleOpenMealDetails}
            />
          ) : null}
        </ScrollView>

        <BlurView
          intensity={55}
          tint="light"
          style={[styles.previewFooter, { paddingBottom: insets.bottom + theme.spacing[3] }]}
        >
          <AnimatedPressable
            onPress={isSubscribed ? handleConfirmMealUpdates : handleSubscribe}
            disabled={!isSubscribed && checkoutTotalMeals === 0}
            style={[
              styles.previewSubscribeButton,
              !isSubscribed && checkoutTotalMeals === 0 && styles.previewSubscribeButtonDisabled,
            ]}
          >
            <View style={styles.previewSubscribeContent}>
              <Ionicons
                name={isSubscribed ? 'checkmark-circle-outline' : 'card-outline'}
                size={20}
                color={theme.colors.white}
              />
              <Text style={styles.previewSubscribeButtonText}>
                {isSubscribed
                  ? (isSubmittingUpdates ? 'Confirming Meal Updates...' : 'Confirm Meal Updates')
                  : `Subscribe to Plan • ${formatPrice(checkoutTotalCost)}`}
              </Text>
            </View>
          </AnimatedPressable>
        </BlurView>

        <MealDetailsSheet
          visible={Boolean(selectedMealDetails)}
          mealType={selectedMealDetails?.mealType ?? 'lunch'}
          date={selectedMealDetails?.date ?? null}
          items={selectedMealDetails?.items ?? []}
          onClose={() => setSelectedMealDetails(null)}
        />
      </SafeAreaView>
    </>
  );
}

const PREVIEW_FOOTER_HEIGHT = 76;

function WeekMenuSection({
  title,
  weekIndex,
  weekStart,
  weekOffsetDays,
  getMealItems,
  onEdit,
  onViewDetails,
}: {
  title: string;
  weekIndex: number;
  weekStart: Date;
  weekOffsetDays: number;
  getMealItems: (day: DayId, mealType: MealType, weekIndex?: number) => PlannedMealItem[];
  onEdit: (weekIndex: number, day: DayId, mealType: MealType) => void;
  onViewDetails: (weekIndex: number, day: DayId, mealType: MealType) => void;
}) {
  return (
    <View style={styles.weekSection}>
      <Text style={styles.weekSectionTitle}>{title}</Text>
      <View style={styles.previewDayList}>
        {calendarDayOrder.map((day, index) => {
          const date = getDateForIndex(weekStart, index + weekOffsetDays);
          return (
            <PreviewDayCard
              key={`${weekIndex}-${day}`}
              date={date}
              day={day}
              weekIndex={weekIndex}
              getMealItems={getMealItems}
              onEdit={onEdit}
              onViewDetails={onViewDetails}
            />
          );
        })}
      </View>
    </View>
  );
}

function PreviewDayCard({
  date,
  day,
  weekIndex,
  getMealItems,
  onEdit,
  onViewDetails,
}: {
  date: Date;
  day: DayId;
  weekIndex: number;
  getMealItems: (day: DayId, mealType: MealType, weekIndex?: number) => PlannedMealItem[];
  onEdit: (weekIndex: number, day: DayId, mealType: MealType) => void;
  onViewDetails: (weekIndex: number, day: DayId, mealType: MealType) => void;
}) {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const lunchItems = getMealItems(day, 'lunch', weekIndex);
  const dinnerItems = getMealItems(day, 'dinner', weekIndex);

  return (
    <View style={styles.previewDayCard}>
      <View style={styles.previewDateBlock}>
        <Text style={styles.previewDateNumber}>{date.getDate()}</Text>
        <Text style={styles.previewDateWeekday}>{weekday}</Text>
      </View>

      <View style={styles.previewSlotsColumn}>
        <PreviewMealSlotRow
          label="Lunch"
          mealType="lunch"
          items={lunchItems}
          onEdit={() => onEdit(weekIndex, day, 'lunch')}
          onViewDetails={() => onViewDetails(weekIndex, day, 'lunch')}
        />
        <PreviewMealSlotRow
          label="Dinner"
          mealType="dinner"
          items={dinnerItems}
          onEdit={() => onEdit(weekIndex, day, 'dinner')}
          onViewDetails={() => onViewDetails(weekIndex, day, 'dinner')}
        />
      </View>
    </View>
  );
}

function PreviewMealSlotRow({
  label,
  mealType,
  items,
  onEdit,
  onViewDetails,
}: {
  label: string;
  mealType: MealType;
  items: PlannedMealItem[];
  onEdit: () => void;
  onViewDetails: () => void;
}) {
  const count = items.length;
  const total = items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const mealName =
    count === 0 ? `No ${label.toLowerCase()} meal` : count === 1 ? items[0]?.name || label : `${count} meals`;

  const content = (
    <>
      <View style={styles.previewSlotLeft}>
        <Text style={styles.previewSlotLabel}>{label}</Text>
        <Text
          style={[styles.previewMealName, count === 0 && styles.previewMealNameEmpty]}
          numberOfLines={1}
        >
          {mealName}
        </Text>
      </View>

      <View style={styles.previewSlotRight}>
        {count > 0 ? <Text style={styles.previewSlotPrice}>{formatPrice(total)}</Text> : null}
        {count > 0 ? (
          <AnimatedPressable
            onPress={(event: any) => {
              event.stopPropagation();
              onEdit();
            }}
            hitSlop={10}
            style={styles.previewEditButton}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${label}`}
          >
            <Ionicons name="pencil" size={12} color={theme.colors.brand.grubRed} />
            <Text style={styles.previewEditText}>Edit</Text>
          </AnimatedPressable>
        ) : null}
      </View>
    </>
  );

  if (count === 0) {
    return <View style={[styles.previewSlotRow, styles.previewSlotRowEmpty]}>{content}</View>;
  }

  return (
    <AnimatedPressable
      onPress={onViewDetails}
      style={styles.previewSlotRow}
      accessibilityRole="button"
      accessibilityLabel={`View ${label.toLowerCase()} details`}
    >
      {content}
    </AnimatedPressable>
  );
}

function QuickActionRow({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone: 'brand' | 'blue' | 'gray';
  onPress: () => void;
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.quickActionRow,
        tone === 'brand' && styles.quickActionBrand,
        tone === 'blue' && styles.quickActionBlue,
        tone === 'gray' && styles.quickActionGray,
      ]}
    >
      <Text style={[styles.quickActionText, tone === 'brand' && styles.quickActionTextBrand]}>
        {tone === 'brand' ? '+  ' : tone === 'blue' ? 'R  ' : 'A  '}
        {label}
      </Text>
    </AnimatedPressable>
  );
}

function SubscribedMealCalendar({ calendarData }: { calendarData: SubscriptionCalendarData }) {
  const meals = Array.isArray(calendarData.meals) ? calendarData.meals : [];
  const groupedMeals = groupSubscriptionMealsByDate(meals);
  const totalMeals = calendarData.summary?.totalMeals || calendarData.calendar?.totalMeals || meals.length;
  const deliveredMeals = calendarData.calendar?.deliveredMeals || calendarData.summary?.byStatus?.delivered || 0;
  const remainingDays = calendarData.calendar?.remainingDays ?? 0;
  const progressPercentage = Math.max(0, Math.min(100, calendarData.calendar?.progressPercentage || 0));
  const period = calendarData.calendar?.subscriptionPeriod;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.subscribedHero}>
          <View style={styles.heroTitleRow}>
            <View style={styles.heroIconBubble}>
              <Text style={styles.heroIconText}>C</Text>
            </View>
            <Text style={styles.heroTitle}>Your Meal Calendar</Text>
          </View>
          <Text style={styles.heroCopy}>Track subscribed meals, delivery progress, and upcoming schedule.</Text>

          <AnimatedPressable
            onPress={() => router.push('/your-orders')}
            style={styles.heroPrimaryButton}
          >
            <Text style={styles.heroPrimaryButtonText}>View Orders</Text>
          </AnimatedPressable>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.blueIconBubble}>
              <Text style={styles.blueIconText}>A</Text>
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.cardTitle}>Active Subscription</Text>
              <Text style={styles.cardSubtitle}>
                {formatPlanType(period?.planType)} {formatSubscriptionPeriod(period?.startDate, period?.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.subscriptionStatsRow}>
            <SubscriptionStat label="Total Meals" value={String(totalMeals)} />
            <SubscriptionStat label="Delivered" value={String(deliveredMeals)} />
            <SubscriptionStat label="Days Left" value={String(remainingDays)} />
          </View>

          <View style={styles.progressMetaRow}>
            <Text style={styles.progressLabel}>Subscription Progress</Text>
            <Text style={styles.progressValue}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(progressPercentage, 5)}%` }]} />
          </View>
        </View>

        <View style={styles.scheduleCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>[]</Text>
            <Text style={styles.sectionTitle}>Subscribed Meal Schedule</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Meals generated from your active subscription.</Text>

          {groupedMeals.length > 0 ? (
            <View style={styles.dayList}>
              {groupedMeals.map((group) => (
                <View key={group.dateKey} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayNumberBubble}>
                      <Text style={styles.dayNumberText}>{group.dayNumber}</Text>
                    </View>
                    <View>
                      <Text style={styles.dayName}>{group.dayName}</Text>
                      <Text style={styles.dayDate}>{group.dateLabel}</Text>
                    </View>
                  </View>

                  {group.meals.map((meal) => (
                    <SubscriptionMealRow key={getSubscriptionMealKey(meal)} meal={meal} />
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCalendarBox}>
              <Text style={styles.emptyCalendarTitle}>No subscribed meals found</Text>
              <Text style={styles.emptyCalendarCopy}>Your active subscription exists, but no meals were returned for this calendar yet.</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.softGreenIcon}>
              <Text style={styles.softGreenIconText}>OK</Text>
            </View>
            <Text style={styles.sectionTitle}>Delivery Status</Text>
          </View>

          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Scheduled</Text>
            <Text style={styles.deliveryValue}>{calendarData.summary?.byStatus?.scheduled || 0}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.softPurpleIcon}>
              <Text style={styles.softPurpleIconText}>Z</Text>
            </View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <QuickActionRow label="Refresh Calendar" tone="blue" onPress={() => router.replace('/meal-calendar?source=subscription')} />
          <QuickActionRow label="Track Orders" tone="brand" onPress={() => router.push('/your-orders')} />
        </View>
      </ScrollView>
    </View>
  );
}

function SubscriptionStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.subscriptionStat}>
      <Text style={styles.subscriptionStatValue}>{value}</Text>
      <Text style={styles.subscriptionStatLabel}>{label}</Text>
    </View>
  );
}

function SubscriptionMealRow({ meal }: { meal: SubscriptionCalendarMeal }) {
  const isDinner = meal.mealType === 'dinner';

  return (
    <View style={[styles.mealRow, isDinner ? styles.dinnerRow : styles.lunchRow]}>
      <View style={[styles.mealIconBubble, isDinner ? styles.dinnerIconBubble : styles.lunchIconBubble]}>
        <Text style={styles.mealIconText}>{isDinner ? 'D' : 'L'}</Text>
      </View>
      <View style={styles.mealRowTextBlock}>
        <Text style={styles.mealRowTitle}>{meal.mealName || 'Subscribed Meal'}</Text>
        <Text style={styles.mealRowSubtitle}>
          {formatMealTypeLabel(meal.mealType)} • {meal.restaurantName || meal.restaurant || 'Restaurant'}
        </Text>
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusPillText}>{formatStatus(meal.status)}</Text>
      </View>
    </View>
  );
}

function groupSubscriptionMealsByDate(meals: SubscriptionCalendarMeal[]) {
  const groups = new Map<string, SubscriptionCalendarMeal[]>();

  meals.forEach((meal) => {
    if (!meal.date) return;
    const dateKey = new Date(meal.date).toISOString().split('T')[0];
    const current = groups.get(dateKey) || [];
    current.push(meal);
    groups.set(dateKey, current);
  });

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dateKey, dateMeals]) => {
      const date = new Date(`${dateKey}T00:00:00`);
      return {
        dateKey,
        dayNumber: String(date.getDate()),
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dateLabel: formatMonthDay(date),
        meals: dateMeals.sort((left, right) => String(left.mealType).localeCompare(String(right.mealType))),
      };
    });
}

function getSubscriptionMealKey(meal: SubscriptionCalendarMeal) {
  return meal._id || meal.id || `${meal.date}-${meal.mealType}-${meal.mealName}`;
}

function getNextSunday() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysUntilSunday = (7 - start.getDay()) % 7 || 7;
  start.setDate(start.getDate() + daysUntilSunday);
  return start;
}

function getDateForIndex(weekStart: Date, index: number) {
  const nextDate = new Date(weekStart);
  nextDate.setDate(weekStart.getDate() + index);
  return nextDate;
}

function formatRange(weekStart: Date) {
  const end = getDateForIndex(weekStart, 6);
  return `${formatShortDate(weekStart)} to ${formatShortDate(end)}`;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMonthDay(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function formatInputDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function formatDayName(day: DayId) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function formatMealType(mealType: MealType) {
  return mealTypes.find((item) => item.id === mealType)?.label || mealType;
}

function formatMealTypeLabel(mealType?: string) {
  if (!mealType) return 'Meal';
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

function formatStatus(status?: string) {
  if (!status) return 'Planned';
  return status.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPlanType(planType?: string) {
  if (!planType) return 'Subscription';
  if (planType === 'bi-weekly') return 'Bi-Weekly';
  if (planType === 'monthly') return 'Monthly';
  return formatStatus(planType);
}

function formatSubscriptionPeriod(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return '';
  const start = startDate ? formatShortDate(new Date(startDate)) : '';
  const end = endDate ? formatShortDate(new Date(endDate)) : '';
  if (start && end) return `• ${start} - ${end}`;
  return `• ${start || end}`;
}

function getItemPrice(item: PlannedMealItem) {
  const itemWithFallbackPrice = item as PlannedMealItem & { basePrice?: number | string };
  const rawPrice = item.price ?? itemWithFallbackPrice.basePrice ?? 0;
  const numericPrice = typeof rawPrice === 'string' ? Number(rawPrice) : rawPrice;
  return Number.isFinite(numericPrice) ? numericPrice : 0;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  previewHeader: {
    height: 56,
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F6F8',
  },
  previewHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeaderTitle: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '800',
  },
  previewScrollContent: {
    paddingTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
  },
  orderSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  orderSummaryPrimary: {
    color: '#111111',
    fontSize: 19,
    fontWeight: '800',
  },
  orderSummaryPrimaryPrice: {
    color: theme.colors.brand.grubRed,
    fontSize: 22,
    fontWeight: '900',
  },
  weekSection: {
    marginTop: theme.spacing[5],
  },
  weekSectionTitle: {
    color: theme.colors.gray[900],
    fontSize: 16,
    fontWeight: '800',
    marginBottom: theme.spacing[3],
  },
  previewDayList: {
    gap: theme.spacing[3],
  },
  previewDayCard: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  previewDateBlock: {
    width: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: theme.colors.brand.grubRed,
    shadowColor: theme.colors.brand.grubRed,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  previewDateNumber: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  previewDateWeekday: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    fontWeight: '700',
  },
  previewSlotsColumn: {
    flex: 1,
    gap: 10,
  },
  previewSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  previewSlotRowEmpty: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  previewSlotLeft: {
    flex: 1,
    paddingRight: theme.spacing[2],
  },
  previewSlotLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  previewMealName: {
    marginTop: 4,
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
  },
  previewMealNameEmpty: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  previewSlotRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  previewSlotPrice: {
    color: theme.colors.brand.grubRed,
    fontSize: 14,
    fontWeight: '800',
  },
  previewEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(136, 19, 55, 0.08)',
  },
  previewEditText: {
    color: theme.colors.brand.grubRed,
    fontSize: 12,
    fontWeight: '700',
  },
  previewFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    paddingTop: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.78)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  previewSubscribeButton: {
    minHeight: 54,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    shadowColor: theme.colors.brand.grubRed,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  previewSubscribeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  retryButton: {
    marginTop: theme.spacing[5],
    minWidth: 180,
  },
  previewSubscribeButtonDisabled: {
    opacity: 0.55,
  },
  previewSubscribeButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
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
  content: {
    paddingBottom: theme.layout.bottomNavHeight + theme.spacing[8],
  },
  heroBand: {
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[8],
    paddingBottom: theme.spacing[6],
  },
  subscribedHero: {
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[8],
    paddingBottom: theme.spacing[6],
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  heroIconBubble: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroIconText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  heroTitle: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  heroCopy: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.snug,
    marginBottom: theme.spacing[5],
  },
  heroSecondaryButton: {
    minHeight: 38,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroSecondaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  heroPrimaryButton: {
    minHeight: 38,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  heroPrimaryButtonText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  previewCard: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[6],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  blueIconBubble: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue[100],
  },
  blueIconText: {
    color: theme.colors.blue[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  headerTextBlock: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  cardSubtitle: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
  },
  totalBlock: {
    alignItems: 'center',
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  totalMealsText: {
    color: theme.colors.blue[600],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  totalMealsLabel: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  progressLabel: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.sm,
  },
  progressValue: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
  },
  progressTrack: {
    height: 12,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[200],
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.blue[600],
  },
  scheduleCard: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[6],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadow.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  sectionIcon: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sectionTitle: {
    flex: 1,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  sectionSubtitle: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.xs,
    marginBottom: theme.spacing[4],
  },
  jumpLabel: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.xs,
    marginBottom: theme.spacing[2],
  },
  dateInput: {
    height: 42,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[5],
  },
  dateInputText: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.xs,
  },
  dateInputIcon: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xs,
  },
  dayList: {
    gap: theme.spacing[3],
  },
  dayCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[3],
  },
  activeDayCard: {
    borderColor: theme.colors.brand.grubRed,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  dayNumberBubble: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[100],
  },
  activeDayNumberBubble: {
    backgroundColor: theme.colors.brand.grubRed,
  },
  dayNumberText: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  activeDayNumberText: {
    color: theme.colors.white,
  },
  dayName: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  dayDate: {
    color: theme.colors.red[600],
    fontSize: theme.typography.fontSize.xs,
  },
  mealRow: {
    minHeight: 54,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    borderWidth: 1,
    marginBottom: theme.spacing[2],
  },
  lunchRow: {
    backgroundColor: theme.colors.orange[100],
    borderColor: theme.colors.orange[200],
  },
  dinnerRow: {
    backgroundColor: theme.colors.blue[50],
    borderColor: theme.colors.blue[100],
  },
  mealIconBubble: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lunchIconBubble: {
    backgroundColor: theme.colors.orange[600],
  },
  dinnerIconBubble: {
    backgroundColor: theme.colors.blue[700],
  },
  mealIconText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  mealRowTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  mealRowTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  mealMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  mealRowSubtitle: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.xs,
  },
  viewDetailsButton: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.blue[600],
  },
  viewDetailsText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  pricePill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.green[100],
  },
  pricePillText: {
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryCard: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[4],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.shadow.sm,
  },
  softBlueIcon: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue[100],
  },
  softBlueIconText: {
    color: theme.colors.blue[600],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  softGreenIcon: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
  },
  softGreenIconText: {
    color: theme.colors.green[600],
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
  },
  softPurpleIcon: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue[100],
  },
  softPurpleIconText: {
    color: theme.colors.blue[700],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  breakdownRow: {
    minHeight: 50,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.gray[50],
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing[3],
  },
  breakdownLabel: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  breakdownValue: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  deliveryRow: {
    minHeight: 50,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionStatsRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginTop: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  subscriptionStat: {
    flex: 1,
    minHeight: 72,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  subscriptionStatValue: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  subscriptionStatLabel: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: 11,
    textAlign: 'center',
  },
  statusPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.green[100],
  },
  statusPillText: {
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  emptyCalendarBox: {
    minHeight: 128,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[5],
    backgroundColor: theme.colors.gray[50],
  },
  emptyCalendarTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
  },
  emptyCalendarCopy: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.snug,
    textAlign: 'center',
  },
  deliveryLabel: {
    color: theme.colors.blue[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  deliveryValue: {
    color: theme.colors.blue[600],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  quickActionRow: {
    minHeight: 42,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[4],
    justifyContent: 'center',
    marginTop: theme.spacing[3],
  },
  quickActionBrand: {
    backgroundColor: theme.colors.red[50],
  },
  quickActionBlue: {
    backgroundColor: theme.colors.blue[100],
  },
  quickActionGray: {
    backgroundColor: theme.colors.gray[50],
  },
  quickActionText: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  quickActionTextBrand: {
    color: theme.colors.brand.grubRed,
  },
  subscribeCard: {
    marginHorizontal: theme.spacing[3],
    marginTop: theme.spacing[4],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.brand.grubRed,
    padding: theme.spacing[4],
    minHeight: 118,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    ...theme.shadow.md,
  },
  subscribeIconBubble: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  subscribeIconText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  subscribeCopyBlock: {
    flex: 1,
    minWidth: 0,
  },
  subscribeTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
    marginBottom: theme.spacing[3],
  },
  subscribeCopy: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.base,
  },
  startPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    backgroundColor: '#d97706',
  },
  startPillText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  pressed: {
    opacity: 0.84,
  },
});
