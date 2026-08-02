import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

const ORDER_FILTERS = ['All Orders', 'Scheduled', 'Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'] as const;

type OrderFilter = (typeof ORDER_FILTERS)[number];

type OrderStatus =
  | 'scheduled'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out-for-delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | string;

type RestaurantSummary = {
  _id?: string;
  name?: string;
  rating?: number;
  reviewCount?: number;
};

type MenuItemSummary = {
  _id?: string;
  image?: string;
};

type OrderItemApi = {
  menuItemId?: string | MenuItemSummary;
  name?: string;
  price?: number;
  quantity?: number;
};

type OrderApi = {
  _id: string;
  orderNumber?: string;
  status?: OrderStatus;
  total?: number;
  subtotal?: number;
  scheduledDate?: string;
  createdAt?: string;
  restaurantId?: RestaurantSummary;
  restaurant?: RestaurantSummary;
  items?: OrderItemApi[];
};

type OrdersResponse = {
  status?: string;
  message?: string;
  data?: OrderApi[];
};

type OrderListItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  displayStatus: Exclude<OrderFilter, 'All Orders'>;
  scheduledDate: string;
  dateKey: string;
  restaurantName: string;
  restaurantInitial: string;
  restaurantRating: number;
  restaurantReviewCount: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
};

type OrderSection = {
  title: string;
  dateKey: string;
  data: OrderListItem[];
};

const statusLabelMap: Record<string, Exclude<OrderFilter, 'All Orders'>> = {
  scheduled: 'Scheduled',
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Preparing',
  'out-for-delivery': 'Preparing',
  delivered: 'Delivered',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

export default function YourOrdersScreen() {
  const { isAuthenticated, isHydrating, isSubscribed } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('All Orders');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (isHydrating) {
        return;
      }

      if (!isAuthenticated) {
        if (!isMounted) return;
        setOrders([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await api.get('/orders', {
          params: {
            includeScheduled: true,
            limit: 50,
            sortBy: 'scheduledDate',
            sortOrder: 'desc',
          },
        });

        const payload = response.data as OrdersResponse | undefined;
        if (payload?.status !== 'success') {
          throw new Error(payload?.message || 'Failed to fetch orders.');
        }

        const nextOrders = (payload.data || [])
          .map(normalizeOrder)
          .sort((left, right) => {
            return new Date(right.scheduledDate).getTime() - new Date(left.scheduledDate).getTime();
          });

        if (!isMounted) return;
        setOrders(nextOrders);
      } catch (requestError) {
        if (!isMounted) return;
        setOrders([]);
        setError(getErrorMessage(requestError));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isHydrating, reloadKey]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'All Orders') {
      return orders;
    }

    return orders.filter((order) => order.displayStatus === activeFilter);
  }, [activeFilter, orders]);

  const sections = useMemo<OrderSection[]>(() => {
    const grouped = new Map<string, OrderListItem[]>();

    filteredOrders.forEach((order) => {
      const existing = grouped.get(order.dateKey) || [];
      existing.push(order);
      grouped.set(order.dateKey, existing);
    });

    return Array.from(grouped.entries())
      .sort((left, right) => new Date(right[0]).getTime() - new Date(left[0]).getTime())
      .map(([dateKey, data]) => ({
        dateKey,
        title: formatOrderDate(dateKey),
        data,
      }));
  }, [filteredOrders]);

  const handleRetry = () => {
    setReloadKey((current) => current + 1);
  };

  const renderFilterPill = (filter: OrderFilter) => {
    const isActive = filter === activeFilter;

    return (
      <Pressable
        key={filter}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${filter}`}
        onPress={() => setActiveFilter(filter)}
        style={({ pressed }) => [
          styles.filterPill,
          isActive ? styles.filterPillActive : styles.filterPillInactive,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.filterPillText, isActive ? styles.filterPillTextActive : styles.filterPillTextInactive]}>
          {filter}
        </Text>
      </Pressable>
    );
  };

  const renderOrderCard = ({ item }: { item: OrderListItem }) => {
    const statusBadgeStyles = getStatusBadgeStyles(item.displayStatus);

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderCardBody}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderTitleRow}>
              <View style={styles.receiptIconWrap}>
                <Ionicons name="receipt-outline" size={16} color={theme.colors.brand.grubRed} />
              </View>
              <Text style={styles.cardHeaderTitle}>Order #{item.orderNumber}</Text>
            </View>

            <View style={[styles.statusBadge, statusBadgeStyles.badge]}>
              <Text style={[styles.statusBadgeText, statusBadgeStyles.text]}>{item.displayStatus}</Text>
            </View>
          </View>

          <View style={styles.restaurantRow}>
            <View style={styles.restaurantInitialBox}>
              <Text style={styles.restaurantInitial}>{item.restaurantInitial}</Text>
            </View>

            <View style={styles.restaurantCopy}>
              <Text numberOfLines={1} style={styles.restaurantName}>
                {item.restaurantName}
              </Text>

              <View style={styles.restaurantMetaRow}>
                <View style={styles.starsRow}>{renderStars(item.restaurantRating)}</View>
                <Text style={styles.restaurantMetaText}>
                  {item.restaurantRating.toFixed(1)} ({item.restaurantReviewCount} reviews)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.itemsCard}>
            {item.items.map((orderItem) => (
              <View key={orderItem.id} style={styles.itemRow}>
                <View style={styles.itemInfoRow}>
                  <View style={styles.itemImagePlaceholder}>
                    <Text style={styles.itemImagePlaceholderText}>{getInitial(orderItem.name)}</Text>
                  </View>

                  <View style={styles.itemCopy}>
                    <Text numberOfLines={1} style={styles.itemName}>
                      {orderItem.name}
                    </Text>
                    <Text style={styles.itemMeta}>Qty: {orderItem.quantity}</Text>
                  </View>
                </View>

                <Text style={styles.itemPrice}>{formatCurrency(orderItem.lineTotal || orderItem.price)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderFooterLabel}>Total Amount</Text>
          <Text style={styles.orderFooterAmount}>{formatCurrency(item.total)}</Text>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: OrderSection }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name="calendar-outline" size={18} color={theme.colors.brand.grubRed} />
      <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.page}>
        <SafeAreaView edges={['top']} style={styles.topChrome}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={styles.headerSpacer} />
          </View>

          {isAuthenticated ? (
            <View style={styles.filterBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarContent}>
                {ORDER_FILTERS.map(renderFilterPill)}
              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>

        {isHydrating || isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="small" color={theme.colors.brand.grubRed} />
            <Text style={styles.stateText}>Loading your orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.content}>
            <View style={styles.stateCard}>
              <View style={styles.iconBubble}>
                <Ionicons name="alert-circle-outline" size={30} color={theme.colors.brand.grubRed} />
              </View>
              <Text style={styles.stateTitle}>Unable to load orders</Text>
              <Text style={styles.stateCopy}>{error}</Text>
              <Pressable onPress={handleRetry} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          </View>
        ) : !isAuthenticated ? (
          <View style={styles.content}>
            <View style={styles.stateCard}>
              <View style={styles.iconBubble}>
                <Ionicons name="lock-closed-outline" size={30} color={theme.colors.brand.grubRed} />
              </View>
              <Text style={styles.stateTitle}>Login Required</Text>
              <Text style={styles.stateCopy}>Please log in to view your orders and track your meals.</Text>
              <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Login</Text>
              </Pressable>
            </View>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.content}>
            <View style={styles.stateCard}>
              <View style={styles.iconBubble}>
                <Ionicons name="receipt-outline" size={30} color={theme.colors.brand.grubRed} />
              </View>
              <Text style={styles.stateTitle}>No orders yet</Text>
              <Text style={styles.stateCopy}>
                Your active and past meal deliveries will appear here once you subscribe or place an order.
              </Text>
              <Pressable
                onPress={() => router.push(isSubscribed ? '/meal-calendar?source=subscription' : '/weekly-menu')}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>{isSubscribed ? 'View Meal Calendar' : 'Plan Meals'}</Text>
              </Pressable>
            </View>
          </View>
        ) : sections.length === 0 ? (
          <View style={styles.content}>
            <View style={styles.stateCard}>
              <View style={styles.iconBubble}>
                <Ionicons name="filter-outline" size={30} color={theme.colors.brand.grubRed} />
              </View>
              <Text style={styles.stateTitle}>No matching orders</Text>
              <Text style={styles.stateCopy}>Try a different filter to see more of your order history.</Text>
            </View>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderCard}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </>
  );
}

function normalizeOrder(order: OrderApi): OrderListItem {
  const scheduledDate = getDateValue(order.scheduledDate || order.createdAt);
  const restaurant = order.restaurantId || order.restaurant || {};
  const restaurantName = restaurant.name?.trim() || 'Restaurant';
  const items = (order.items || []).map((item, index) => {
    const quantity = item.quantity || 1;
    const price = item.price || 0;

    return {
      id: getItemId(item.menuItemId, order._id, index),
      name: item.name?.trim() || 'Meal Item',
      quantity,
      price,
      lineTotal: price * quantity,
    };
  });

  return {
    id: order._id,
    orderNumber: order.orderNumber?.trim() || order._id.slice(-6).toUpperCase(),
    status: order.status || 'scheduled',
    displayStatus: getDisplayStatus(order.status),
    scheduledDate,
    dateKey: getDateKey(scheduledDate),
    restaurantName,
    restaurantInitial: getInitial(restaurantName),
    restaurantRating: typeof restaurant.rating === 'number' ? restaurant.rating : 0,
    restaurantReviewCount: typeof restaurant.reviewCount === 'number' ? restaurant.reviewCount : 0,
    total: typeof order.total === 'number' ? order.total : items.reduce((sum, item) => sum + item.lineTotal, 0),
    items,
  };
}

function getDisplayStatus(status?: string): Exclude<OrderFilter, 'All Orders'> {
  return statusLabelMap[(status || '').toLowerCase()] || 'Pending';
}

function getDateValue(value?: string) {
  const fallback = new Date().toISOString();
  if (!value) return fallback;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function getDateKey(value: string) {
  return value.slice(0, 10);
}

function formatOrderDate(dateKey: string) {
  const parsed = new Date(`${dateKey}T12:00:00.000Z`);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0);
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'G';
}

function getItemId(menuItemId: string | MenuItemSummary | undefined, orderId: string, index: number) {
  if (typeof menuItemId === 'string' && menuItemId.length > 0) {
    return menuItemId;
  }

  if (menuItemId && typeof menuItemId === 'object' && typeof menuItemId._id === 'string') {
    return menuItemId._id;
  }

  return `${orderId}-${index}`;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.round(Math.max(0, Math.min(5, rating)));

    return (
      <Ionicons
        key={`star-${index}`}
        name={filled ? 'star' : 'star-outline'}
        size={12}
        color={filled ? '#F59E0B' : '#D1D5DB'}
      />
    );
  });
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || 'Please try again in a moment.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Please try again in a moment.';
}

function getStatusBadgeStyles(status: Exclude<OrderFilter, 'All Orders'>) {
  switch (status) {
    case 'Scheduled':
      return { badge: styles.statusBadgeScheduled, text: styles.statusBadgeTextScheduled };
    case 'Pending':
      return { badge: styles.statusBadgePending, text: styles.statusBadgeTextPending };
    case 'Confirmed':
      return { badge: styles.statusBadgeConfirmed, text: styles.statusBadgeTextConfirmed };
    case 'Preparing':
      return { badge: styles.statusBadgePreparing, text: styles.statusBadgeTextPreparing };
    case 'Delivered':
      return { badge: styles.statusBadgeDelivered, text: styles.statusBadgeTextDelivered };
    case 'Cancelled':
      return { badge: styles.statusBadgeCancelled, text: styles.statusBadgeTextCancelled };
    default:
      return { badge: styles.statusBadgePending, text: styles.statusBadgeTextPending };
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  topChrome: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    ...theme.shadow.sm,
  },
  header: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.white,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  filterBar: {
    paddingBottom: theme.spacing[3],
  },
  filterBarContent: {
    paddingHorizontal: theme.spacing[4],
  },
  filterPill: {
    minHeight: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
    marginRight: theme.spacing[2],
  },
  filterPillActive: {
    backgroundColor: theme.colors.brand.grubRed,
  },
  filterPillInactive: {
    backgroundColor: theme.colors.gray[100],
  },
  filterPillText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  filterPillTextActive: {
    color: theme.colors.white,
  },
  filterPillTextInactive: {
    color: theme.colors.gray[800],
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: theme.spacing[5],
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionHeaderTitle: {
    color: theme.colors.gray[900],
    fontSize: 18,
    fontWeight: '700',
  },
  orderCard: {
    marginBottom: theme.spacing[4],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    ...theme.shadow.md,
  },
  orderCardBody: {
    padding: theme.spacing[4],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  cardHeaderTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  receiptIconWrap: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.red[50],
    marginRight: theme.spacing[2],
  },
  cardHeaderTitle: {
    color: theme.colors.gray[600],
    fontSize: 13,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusBadge: {
    minHeight: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeScheduled: {
    backgroundColor: theme.colors.blue[100],
  },
  statusBadgeTextScheduled: {
    color: theme.colors.blue[700],
  },
  statusBadgePending: {
    backgroundColor: theme.colors.gray[200],
  },
  statusBadgeTextPending: {
    color: theme.colors.gray[600],
  },
  statusBadgeConfirmed: {
    backgroundColor: theme.colors.blue[100],
  },
  statusBadgeTextConfirmed: {
    color: theme.colors.blue[700],
  },
  statusBadgePreparing: {
    backgroundColor: theme.colors.yellow[100],
  },
  statusBadgeTextPreparing: {
    color: theme.colors.yellow[800],
  },
  statusBadgeDelivered: {
    backgroundColor: theme.colors.green[100],
  },
  statusBadgeTextDelivered: {
    color: theme.colors.green[800],
  },
  statusBadgeCancelled: {
    backgroundColor: theme.colors.red[100],
  },
  statusBadgeTextCancelled: {
    color: theme.colors.red[700],
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  restaurantInitialBox: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    marginRight: theme.spacing[3],
  },
  restaurantInitial: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantCopy: {
    flex: 1,
    minWidth: 0,
  },
  restaurantName: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[1],
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing[2],
  },
  restaurantMetaText: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  itemsCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing[3],
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: theme.spacing[3],
  },
  itemImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[200],
    marginRight: theme.spacing[3],
  },
  itemImagePlaceholderText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
  itemMeta: {
    marginTop: theme.spacing[0.5],
    color: theme.colors.gray[500],
    fontSize: 12,
  },
  itemPrice: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  orderFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 14,
  },
  orderFooterLabel: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.medium,
    opacity: 0.9,
  },
  orderFooterAmount: {
    marginTop: theme.spacing[1],
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing[4],
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  stateCard: {
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[6],
    alignItems: 'center',
    ...theme.shadow.md,
  },
  iconBubble: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.red[50],
    marginBottom: theme.spacing[4],
  },
  stateTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  stateCopy: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  stateText: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 52,
    marginTop: theme.spacing[6],
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[8],
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  pressed: {
    opacity: 0.76,
  },
});
