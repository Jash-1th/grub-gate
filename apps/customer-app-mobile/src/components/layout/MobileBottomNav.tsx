import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

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
    href: '/search',
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
const activeColor = '#E23744';
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
            <Pressable
              key={tab.label}
              onPress={() => router.push(tab.href)}
              style={({ pressed }) => [styles.tabButton, active && styles.tabButtonActive, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Ionicons name={iconName} size={active ? 23 : 22} color={active ? activeColor : inactiveColor} />
              </View>
              <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  tabBar: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius['3xl'],
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
    gap: theme.spacing[0.5],
  },
  tabButtonActive: {
    backgroundColor: '#FFF1F2',
  },
  iconWrap: {
    width: 32,
    height: 30,
    borderRadius: theme.radius.full,
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
    color: activeColor,
  },
  tabLabelInactive: {
    color: inactiveColor,
  },
  pressed: {
    opacity: 0.7,
  },
});
