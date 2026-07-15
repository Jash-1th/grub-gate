import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useFlash } from '../../contexts/FlashContext';
import { theme } from '../../theme';

type AuthButtonsProps = {
  stacked?: boolean;
};

export function AuthButtons({ stacked = false }: AuthButtonsProps) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const { showFlash } = useFlash();

  if (isAuthenticated) {
    const initial = getUserInitial(user);

    return (
      <View style={[styles.container, stacked && styles.containerStacked]}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          {stacked ? <Text style={styles.userText}>{getUserDisplayName(user)}</Text> : null}
        </View>
        <Pressable
          disabled={isLoading}
          onPress={async () => {
            await logout();
            showFlash('You have been logged out.', 'info');
            router.replace('/');
          }}
          style={({ pressed }) => [styles.loginButton, (pressed || isLoading) && styles.pressed]}
        >
          <Text style={styles.loginText}>Logout</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, stacked && styles.containerStacked]}>
      <Pressable
        onPress={() => router.push('/login')}
        style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
      >
        <Text style={styles.loginText}>Login</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/signup')}
        style={({ pressed }) => [styles.signupButton, pressed && styles.pressed]}
      >
        <Text style={styles.signupText}>Sign Up</Text>
      </Pressable>
    </View>
  );
}

function getUserInitial(user: ReturnType<typeof useAuth>['user']) {
  const source = user?.firstName || user?.name || user?.email || 'G';
  return source.slice(0, 1).toUpperCase();
}

function getUserDisplayName(user: ReturnType<typeof useAuth>['user']) {
  if (user?.firstName || user?.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }

  return user?.name || user?.email || 'Customer';
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  containerStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
  },
  loginButton: {
    minHeight: 44,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.sm,
  },
  signupButton: {
    minHeight: 44,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.sm,
  },
  loginText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  signupText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  avatarRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  userText: {
    flex: 1,
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
});
