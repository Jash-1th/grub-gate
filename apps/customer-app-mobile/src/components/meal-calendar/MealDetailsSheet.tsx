import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mealTypes, type MealType, type PlannedMealItem } from '../../contexts/MealPlanContext';
import { theme } from '../../theme';

type MealDetailsSheetProps = {
  visible: boolean;
  mealType: MealType;
  date: Date | null;
  items: PlannedMealItem[];
  onClose: () => void;
};

export function MealDetailsSheet({
  visible,
  mealType,
  date,
  items,
  onClose,
}: MealDetailsSheetProps) {
  const insets = useSafeAreaInsets();
  const totalMeals = items.length;
  const totalPrice = items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const title = `${formatMealTypeLabel(mealType)} Details`;
  const dateLabel = date ? formatFullDate(date) : '';
  const timeWindow = getMealWindow(mealType);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close meal details" />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.title}>{title}</Text>
              {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Close meal details"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 132 },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {totalMeals} Meal{totalMeals === 1 ? '' : 's'} Planned
              </Text>
              <Text style={styles.summaryPrice}>{formatPrice(totalPrice)}</Text>
            </View>

            <View style={styles.cardsColumn}>
              {items.map((item) => (
                <View key={item.planId} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name || 'Planned Meal'}
                    </Text>
                    <Text style={styles.itemPrice}>{formatPrice(getItemPrice(item))}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="storefront-outline" size={15} color="#64748B" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {item.restaurantName || 'Restaurant'}
                    </Text>
                  </View>

                  <View style={styles.itemFooterRow}>
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={15} color="#64748B" />
                      <Text style={styles.metaText}>{timeWindow}</Text>
                    </View>

                    <View style={styles.plannedBadge}>
                      <Text style={styles.plannedBadgeText}>Planned</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <Text style={styles.helperText}>👁 Preview Mode - Subscribe to activate</Text>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeCta, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Close meal details sheet"
            >
              <Text style={styles.closeCtaText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatMealTypeLabel(mealType: MealType) {
  return mealTypes.find((item) => item.id === mealType)?.label || 'Meal';
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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

function getMealWindow(mealType: MealType) {
  if (mealType === 'lunch') return '12:00 - 13:00';
  if (mealType === 'dinner') return '19:00 - 20:00';
  return 'Scheduled Window';
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: '88%',
    minHeight: 420,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: theme.colors.gray[900],
    fontSize: 22,
    fontWeight: '700',
  },
  date: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  summaryLabel: {
    color: theme.colors.gray[900],
    fontSize: 16,
    fontWeight: '600',
  },
  summaryPrice: {
    color: theme.colors.brand.grubRed,
    fontSize: 18,
    fontWeight: '700',
  },
  cardsColumn: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemName: {
    flex: 1,
    color: theme.colors.gray[900],
    fontSize: 17,
    fontWeight: '700',
  },
  itemPrice: {
    color: theme.colors.brand.grubRed,
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  itemFooterRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  plannedBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#DCFCE7',
  },
  plannedBadgeText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  helperText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  closeCta: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  closeCtaText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.86,
  },
});
