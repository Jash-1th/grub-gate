import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

export function CustomerHeader() {
  const pathname = usePathname();

  if (pathname === '/search' || pathname === '/your-orders' || pathname === '/profile' || pathname === '/plan' || pathname === '/plan/restaurants' || pathname.startsWith('/restaurant/') || pathname === '/weekly-menu') {
    return null;
  }

  if (pathname === '/') {
    return (
      <SafeAreaView style={styles.homeHeaderSafe} edges={['top']}>
        <View style={styles.homeHeaderInner}>
          <Pressable
            onPress={() => router.push('/profile?tab=addresses')}
            style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Select delivery location"
          >
            <View style={styles.locationIconFrame}>
              <Ionicons name="location-sharp" size={22} color="#E23744" />
            </View>

            <View style={styles.locationCopy}>
              <Text style={styles.locationEyebrow}>Delivering to</Text>
              <View style={styles.locationTitleRow}>
                <Text numberOfLines={1} style={styles.locationTitle}>
                  Home - Nellore
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.gray[700]} />
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/weekly-menu')}
            style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open cart"
          >
            <Ionicons name="cart-outline" size={26} color={theme.colors.gray[900]} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.backHeaderSafe} edges={['top']}>
      <View style={styles.backHeaderInner}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            router.replace('/');
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.gray[900]} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeHeaderSafe: {
    width: '100%',
    zIndex: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...theme.shadow.sm,
  },
  homeHeaderInner: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    backgroundColor: '#FFFFFF',
  },
  locationButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: theme.spacing[3],
  },
  locationIconFrame: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    marginRight: theme.spacing[3],
  },
  locationCopy: {
    flex: 1,
    minWidth: 0,
  },
  locationEyebrow: {
    color: theme.colors.gray[500],
    fontSize: 12,
    lineHeight: 16,
    fontWeight: theme.typography.fontWeight.medium,
  },
  locationTitleRow: {
    marginTop: theme.spacing[0.5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  locationTitle: {
    maxWidth: '88%',
    color: theme.colors.gray[900],
    fontSize: 15,
    lineHeight: 20,
    fontWeight: theme.typography.fontWeight.bold,
  },
  cartButton: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 3,
    minWidth: 18,
    height: 18,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E23744',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  cartBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: theme.typography.fontWeight.bold,
  },
  backHeaderSafe: {
    width: '100%',
    zIndex: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...theme.shadow.sm,
  },
  backHeaderInner: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  pressed: {
    opacity: 0.72,
  },
});
