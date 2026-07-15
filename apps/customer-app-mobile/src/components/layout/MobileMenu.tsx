import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthButtons } from './AuthButtons';
import { theme } from '../../theme';

type MobileMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export function MobileMenu({ visible, onClose }: MobileMenuProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.panel, { paddingTop: insets.top + theme.spacing[4] }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Menu</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          </View>

          <View style={styles.panelBody}>
            <View style={styles.card}>
              <Text style={styles.cardHeading}>LANGUAGE</Text>
              <View style={styles.languagePill}>
                <Text style={styles.languageText}>English</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeading}>ACCOUNT</Text>
              <AuthButtons stacked />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'flex-end',
    backgroundColor: theme.colors.background.overlay,
  },
  panel: {
    width: '78%',
    maxWidth: 340,
    height: '100%',
    backgroundColor: theme.colors.white,
    ...theme.shadow.lg,
  },
  panelHeader: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    paddingHorizontal: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  closeText: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  panelBody: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing[5],
    padding: theme.spacing[5],
  },
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    ...theme.shadow.sm,
  },
  cardHeading: {
    marginBottom: theme.spacing[3],
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  languagePill: {
    alignSelf: 'center',
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    backgroundColor: theme.colors.gray[50],
  },
  languageText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  pressed: {
    opacity: 0.72,
  },
});
