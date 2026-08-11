import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { theme } from '../../theme';

export function MealCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.imageSection}>
        <Skeleton width={60} height={60} borderRadius={12} />
        <View style={styles.textSection}>
          <Skeleton width={120} height={16} borderRadius={4} style={styles.title} />
          <Skeleton width={80} height={12} borderRadius={4} style={styles.subtitle} />
        </View>
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing[2],
  },
  imageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  textSection: {
    gap: theme.spacing[1],
  },
  title: {
    marginBottom: theme.spacing[1],
  },
  subtitle: {},
});
