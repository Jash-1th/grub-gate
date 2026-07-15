import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  type SubscriptionCalendarData,
  type SubscriptionCalendarMeal,
  type SubscriptionStatus,
} from '../lib/mealCalendarApi';
import { theme } from '../theme';

const calendarDayOrder: DayId[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function MealCalendarScreen() {
  const { getMealItems, getTotalItems, getTotalCost } = useMealPlan();
  const { showFlash } = useFlash();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionCalendar, setSubscriptionCalendar] = useState<SubscriptionCalendarData | null>(null);
  const [isLoadingSubscriptionCalendar, setIsLoadingSubscriptionCalendar] = useState(true);

  const weekStart = useMemo(() => getNextSunday(), []);
  const totalMeals = getTotalItems();
  const totalCost = getTotalCost();
  const lunchCount = getMealTypeCount(getMealItems, 'lunch');
  const dinnerCount = getMealTypeCount(getMealItems, 'dinner');
  const hasActiveSubscription = Boolean(subscriptionStatus?.hasActiveSubscription);

  useEffect(() => {
    let mounted = true;

    async function loadSubscriptionCalendar() {
      setIsLoadingSubscriptionCalendar(true);
      const statusResult = await getSubscriptionStatus();

      if (!mounted) return;

      if (statusResult.success && statusResult.data) {
        setSubscriptionStatus(statusResult.data);

        if (statusResult.data.hasActiveSubscription) {
          const calendarResult = await getMealCalendar();
          if (!mounted) return;

          if (calendarResult.success && calendarResult.data) {
            setSubscriptionCalendar(calendarResult.data);
          }
        }
      }

      setIsLoadingSubscriptionCalendar(false);
    }

    loadSubscriptionCalendar();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubscribe = () => {
    if (totalMeals === 0) {
      showFlash('Please select at least one meal before choosing a subscription plan.', 'info');
      router.push('/weekly-menu');
      return;
    }

    router.push('/subscription');
  };

  const handleViewDetails = (items: PlannedMealItem[]) => {
    if (items.length === 0) return;
    const firstItem = items[0];
    showFlash(`${firstItem.name || 'Meal'} is planned for this slot.`, 'info');
  };

  if (isLoadingSubscriptionCalendar) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.brand.grubRed} />
        <Text style={styles.loadingText}>Loading meal calendar...</Text>
      </View>
    );
  }

  if (hasActiveSubscription && subscriptionCalendar) {
    return <SubscribedMealCalendar calendarData={subscriptionCalendar} />;
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBand}>
          <View style={styles.heroTitleRow}>
            <View style={styles.heroIconBubble}>
              <Text style={styles.heroIconText}>C</Text>
            </View>
            <Text style={styles.heroTitle}>Meal Plan Preview</Text>
          </View>
          <Text style={styles.heroCopy}>Preview your planned meals schedule before subscribing</Text>

          <Pressable
            onPress={() => router.push('/weekly-menu')}
            style={({ pressed }) => [styles.heroSecondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.heroSecondaryButtonText}>{'<'} Back to Menu</Text>
          </Pressable>

          <Pressable
            onPress={handleSubscribe}
            style={({ pressed }) => [styles.heroPrimaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.heroPrimaryButtonText}>Subscribe to Plan</Text>
          </Pressable>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.cardHeader}>
            <View style={styles.blueIconBubble}>
              <Text style={styles.blueIconText}>O</Text>
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.cardTitle}>Meal Plan Preview</Text>
              <Text style={styles.cardSubtitle}>Plan Type: Bi-Weekly</Text>
            </View>
          </View>

          <View style={styles.totalBlock}>
            <Text style={styles.totalMealsText}>{totalMeals}</Text>
            <Text style={styles.totalMealsLabel}>Total Meals</Text>
          </View>

          <View style={styles.progressMetaRow}>
            <Text style={styles.progressLabel}>Meal Planning</Text>
            <Text style={styles.progressValue}>
              {totalMeals} meal{totalMeals === 1 ? '' : 's'} planned
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: totalMeals > 0 ? '100%' : '8%' }]} />
          </View>
        </View>

        <View style={styles.scheduleCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>[]</Text>
            <Text style={styles.sectionTitle}>Weekly Meal Schedule</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Click on dates from {formatRange(weekStart)} (1 week)</Text>

          <Text style={styles.jumpLabel}>Jump to date:</Text>
          <View style={styles.dateInput}>
            <Text style={styles.dateInputText}>{formatInputDate(weekStart)}</Text>
            <Text style={styles.dateInputIcon}>[]</Text>
          </View>

          <View style={styles.dayList}>
            {calendarDayOrder.map((day, index) => {
              const date = getDateForIndex(weekStart, index);
              const isFirstDay = index === 0;

              return (
                <View key={day} style={[styles.dayCard, isFirstDay && styles.activeDayCard]}>
                  <View style={styles.dayHeader}>
                    <View style={[styles.dayNumberBubble, isFirstDay && styles.activeDayNumberBubble]}>
                      <Text style={[styles.dayNumberText, isFirstDay && styles.activeDayNumberText]}>
                        {date.getDate()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.dayName}>{formatDayName(day)}</Text>
                      <Text style={styles.dayDate}>{formatMonthDay(date)}</Text>
                    </View>
                  </View>

                  <MealPreviewRow
                    mealType="lunch"
                    items={getMealItems(day, 'lunch')}
                    onViewDetails={handleViewDetails}
                  />
                  <MealPreviewRow
                    mealType="dinner"
                    items={getMealItems(day, 'dinner')}
                    onViewDetails={handleViewDetails}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.softBlueIcon}>
              <Text style={styles.softBlueIconText}>B</Text>
            </View>
            <Text style={styles.sectionTitle}>Meal Breakdown</Text>
          </View>

          <BreakdownRow label="Lunch" value={lunchCount} tone="lunch" />
          <BreakdownRow label="Dinner" value={dinnerCount} tone="dinner" />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.softGreenIcon}>
              <Text style={styles.softGreenIconText}>OK</Text>
            </View>
            <Text style={styles.sectionTitle}>Delivery Status</Text>
          </View>

          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Planned</Text>
            <Text style={styles.deliveryValue}>{totalMeals}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.softPurpleIcon}>
              <Text style={styles.softPurpleIconText}>Z</Text>
            </View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <QuickActionRow label="Plan New Meals" tone="brand" onPress={() => router.push('/weekly-menu')} />
          <QuickActionRow label="Refresh Calendar" tone="blue" onPress={() => showFlash('Calendar refreshed.', 'success')} />
          <QuickActionRow label="Account Settings" tone="gray" onPress={() => showFlash('Account settings will be added soon.', 'info')} />
        </View>

        <Pressable onPress={handleSubscribe} style={({ pressed }) => [styles.subscribeCard, pressed && styles.pressed]}>
          <View style={styles.subscribeIconBubble}>
            <Text style={styles.subscribeIconText}>+</Text>
          </View>
          <View style={styles.subscribeCopyBlock}>
            <Text style={styles.subscribeTitle}>Subscribe to Plan</Text>
            <Text style={styles.subscribeCopy}>
              Ready to start your meal journey? Subscribe now to get fresh, delicious meals delivered to your door!
            </Text>
          </View>
          <View style={styles.startPill}>
            <Text style={styles.startPillText}>START NOW</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function MealPreviewRow({
  mealType,
  items,
  onViewDetails,
}: {
  mealType: MealType;
  items: PlannedMealItem[];
  onViewDetails: (items: PlannedMealItem[]) => void;
}) {
  const count = items.length;
  const total = items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const isLunch = mealType === 'lunch';

  return (
    <View style={[styles.mealRow, isLunch ? styles.lunchRow : styles.dinnerRow]}>
      <View style={[styles.mealIconBubble, isLunch ? styles.lunchIconBubble : styles.dinnerIconBubble]}>
        <Text style={styles.mealIconText}>{isLunch ? 'L' : 'D'}</Text>
      </View>

      <View style={styles.mealRowTextBlock}>
        <Text style={styles.mealRowTitle}>{formatMealType(mealType)}</Text>
        <View style={styles.mealMetaRow}>
          <Text style={styles.mealRowSubtitle}>{count === 0 ? 'No meals' : `${count} Item${count === 1 ? '' : 's'}`}</Text>
          {count > 0 ? (
            <Pressable onPress={() => onViewDetails(items)} style={({ pressed }) => [styles.viewDetailsButton, pressed && styles.pressed]}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {count > 0 ? (
        <View style={styles.pricePill}>
          <Text style={styles.pricePillText}>{formatPrice(total)}</Text>
        </View>
      ) : null}
    </View>
  );
}

function BreakdownRow({ label, value, tone }: { label: string; value: number; tone: 'lunch' | 'dinner' }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={styles.breakdownLabel}>{tone === 'lunch' ? 'L' : 'D'}  {label}</Text>
      <Text style={styles.breakdownValue}>{value}</Text>
    </View>
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickActionRow,
        tone === 'brand' && styles.quickActionBrand,
        tone === 'blue' && styles.quickActionBlue,
        tone === 'gray' && styles.quickActionGray,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.quickActionText, tone === 'brand' && styles.quickActionTextBrand]}>
        {tone === 'brand' ? '+  ' : tone === 'blue' ? 'R  ' : 'A  '}
        {label}
      </Text>
    </Pressable>
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

          <Pressable
            onPress={() => router.push('/your-orders')}
            style={({ pressed }) => [styles.heroPrimaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.heroPrimaryButtonText}>View Orders</Text>
          </Pressable>
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

function getMealTypeCount(getMealItems: (day: DayId, mealType: MealType) => PlannedMealItem[], mealType: MealType) {
  return calendarDayOrder.reduce((total, day) => total + getMealItems(day, mealType).length, 0);
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
    backgroundColor: theme.colors.gray[50],
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
    backgroundColor: '#dbeafe',
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
    backgroundColor: '#3b82f6',
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
    backgroundColor: '#fff7ed',
    borderColor: '#ffedd5',
  },
  dinnerRow: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ede9fe',
  },
  mealIconBubble: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lunchIconBubble: {
    backgroundColor: '#f97316',
  },
  dinnerIconBubble: {
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#3b82f6',
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
    backgroundColor: '#ecfdf5',
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
    backgroundColor: '#dbeafe',
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
    backgroundColor: '#f3e8ff',
  },
  softPurpleIconText: {
    color: '#7c3aed',
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
    backgroundColor: '#eff6ff',
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
    backgroundColor: '#ecfdf5',
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
    backgroundColor: '#fff1f2',
  },
  quickActionBlue: {
    backgroundColor: '#dbeafe',
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
