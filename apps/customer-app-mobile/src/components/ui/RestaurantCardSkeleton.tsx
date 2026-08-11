import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { theme } from '../../theme';

export function RestaurantCardSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width="100%" height={140} borderRadius={theme.radius['2xl']} style={styles.image} />
      <View style={styles.content}>
        <Skeleton width={150} height={18} borderRadius={4} style={styles.title} />
        <View style={styles.row}>
          <Skeleton width={60} height={14} borderRadius={4} />
          <Skeleton width={80} height={14} borderRadius={4} />
        </View>
        <Skeleton width={100} height={12} borderRadius={4} style={styles.tags} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing[4],
  },
  image: {
    marginBottom: theme.spacing[3],
  },
  content: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    gap: theme.spacing[2],
  },
  title: {
    marginBottom: theme.spacing[1],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tags: {
    marginTop: theme.spacing[1],
  },
});
