import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMealPlan } from '../contexts/MealPlanContext';
import { theme } from '../theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { getTotalItems, hasHydrated, selectedRestaurants } = useMealPlan();
  const totalItems = getTotalItems();
  const hasStartedPlan = selectedRestaurants.length > 0 || totalItems > 0;
  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length > 0;

  const handleSearch = () => {
    if (!canSearch) return;
    router.push(hasStartedPlan ? '/weekly-menu' : '/plan');
  };

  if (!hasHydrated) {
    return (
      <View style={styles.page}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={theme.colors.gray[500]} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by postal code or restaurant"
                placeholderTextColor={theme.colors.gray[400]}
                style={styles.searchInput}
                returnKeyType="search"
                editable={false}
              />
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.loadingState}>
          <ActivityIndicator color={theme.colors.brand.grubRed} />
          <Text style={styles.loadingText}>Loading your plan...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.gray[500]} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              placeholder="Search by postal code or restaurant"
              placeholderTextColor={theme.colors.gray[400]}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <View style={styles.iconBubble}>
            <Ionicons name="location-sharp" size={28} color="#E23744" />
          </View>
          <Text style={styles.title}>Find food near you</Text>
          <Text style={styles.copy}>
            {hasStartedPlan
              ? 'Your plan is already in progress. Open your weekly menu and keep building your meals.'
              : 'Enter your postal code, choose nearby restaurants, and start building your weekly meal plan.'}
          </Text>
          <Pressable
            onPress={handleSearch}
            disabled={!canSearch}
            style={({ pressed }) => [styles.primaryButton, !canSearch && styles.primaryButtonDisabled, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open postal code search"
          >
            <Text style={styles.primaryButtonText}>{hasStartedPlan ? 'Open Weekly Menu' : 'Go to Postal Code Search'}</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...theme.shadow.sm,
  },
  headerInner: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  searchBar: {
    minHeight: 48,
    borderRadius: theme.radius['2xl'],
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  content: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
  },
  loadingText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  heroCard: {
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[6],
    alignItems: 'center',
    ...theme.shadow.md,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    marginBottom: theme.spacing[4],
  },
  title: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  copy: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 52,
    marginTop: theme.spacing[6],
    borderRadius: theme.radius['2xl'],
    backgroundColor: '#E23744',
    paddingHorizontal: theme.spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  primaryButtonDisabled: {
    opacity: 0.5,
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
