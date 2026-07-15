import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import type { NavigationItem } from '../../data/navigation';

type NavGlyphProps = {
  name: NavigationItem['name'];
  active?: boolean;
};

const labels: Record<NavigationItem['name'], string> = {
  home: 'H',
  about: 'A',
  howItWorks: '?',
  contact: 'C',
  faq: 'F',
  yourOrders: 'O',
};

export function NavGlyph({ name, active = false }: NavGlyphProps) {
  return (
    <View
      style={[
        styles.iconFrame,
        active ? styles.iconFrameActive : styles.iconFrameInactive,
      ]}
    >
      <Text style={[styles.iconText, active ? styles.iconTextActive : styles.iconTextInactive]}>
        {labels[name]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconFrame: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFrameActive: {
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  iconFrameInactive: {
    backgroundColor: '#f5f6f8',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  iconText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: theme.typography.fontWeight.bold,
  },
  iconTextActive: {
    color: theme.colors.white,
  },
  iconTextInactive: {
    color: theme.colors.gray[600],
  },
});
