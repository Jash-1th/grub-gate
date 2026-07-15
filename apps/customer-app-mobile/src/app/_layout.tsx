import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CustomerHeader } from '../components/layout/CustomerHeader';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { AuthProvider } from '../contexts/AuthContext';
import { FlashProvider } from '../contexts/FlashContext';
import { MealPlanProvider } from '../contexts/MealPlanContext';
import { PlanningProvider } from '../contexts/PlanningContext';
import { ThemeProvider, theme } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FlashProvider>
          <AuthProvider>
            <PlanningProvider>
              <MealPlanProvider>
                <View style={styles.appShell}>
                  <StatusBar style="dark" />
                  <CustomerHeader />
                  <View style={styles.screenContent}>
                    <Stack screenOptions={{ headerShown: false, contentStyle: styles.stackContent }} />
                  </View>
                  <MobileBottomNav />
                </View>
              </MealPlanProvider>
            </PlanningProvider>
          </AuthProvider>
        </FlashProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
  },
  screenContent: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
  },
  stackContent: {
    backgroundColor: theme.colors.background.page,
  },
});
