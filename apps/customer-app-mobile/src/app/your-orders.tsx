import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

export default function YourOrdersScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <View style={styles.page}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.iconBubble}>
            <Ionicons name={isAuthenticated ? 'receipt-outline' : 'lock-closed-outline'} size={30} color="#E23744" />
          </View>
          <Text style={styles.title}>{isAuthenticated ? 'No orders yet' : 'Login Required'}</Text>
          <Text style={styles.copy}>
            {isAuthenticated
              ? 'Your active and past meal deliveries will appear here once you subscribe or place an order.'
              : 'Please log in to view your orders and track your meals.'}
          </Text>

          {!isAuthenticated ? (
            <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => router.push('/weekly-menu')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Plan Meals</Text>
            </Pressable>
          )}
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
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  headerTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  content: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  card: {
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E23744',
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
