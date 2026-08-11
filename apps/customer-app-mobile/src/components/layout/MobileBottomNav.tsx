import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type TabItem = {
  label: string;
  href: Href;
  match: string;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  {
    label: 'Home',
    href: '/',
    match: '/',
    inactiveIcon: 'home-outline',
    activeIcon: 'home',
  },
  {
    label: 'Search',
    href: '/plan',
    match: '/search',
    inactiveIcon: 'search-outline',
    activeIcon: 'search',
  },
  {
    label: 'Orders',
    href: '/your-orders',
    match: '/your-orders',
    inactiveIcon: 'receipt-outline',
    activeIcon: 'receipt',
  },
  {
    label: 'Profile',
    href: '/profile',
    match: '/profile',
    inactiveIcon: 'person-outline',
    activeIcon: 'person',
  },
];

const tabRoutes = new Set(tabs.map((tab) => tab.match));
const activeColor = theme.colors.brand.grubRed;
const inactiveColor = '#999999';

export function MobileBottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (!tabRoutes.has(pathname)) {
    return null;
  }

  return (
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, theme.spacing[2]) }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = pathname === tab.match;
          const iconName = active ? tab.activeIcon : tab.inactiveIcon;

          return (
            <AnimatedPressable
              key={tab.label}
              onPress={() => router.push(tab.href)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Ionicons name={iconName} size={active ? 23 : 22} color={active ? theme.colors.brand.grubRed : inactiveColor} />
              </View>
              <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {tab.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing[4],
    paddingBottom: Math.max(theme.spacing[2], 16),
    paddingTop: theme.spacing[2],
    backgroundColor: 'transparent',
  },
  tabBar: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing[2],
    ...theme.shadow.lg,
  },
  tabButton: {
    flex: 1,
    height: 62,
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.red[50],
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: theme.colors.brand.grubRed,
  },
  tabLabelInactive: {
    color: inactiveColor,
  },
});
