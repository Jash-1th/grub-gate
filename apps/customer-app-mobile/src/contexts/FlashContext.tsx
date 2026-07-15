import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

type FlashTone = 'success' | 'error' | 'info';

type FlashState = {
  message: string;
  tone: FlashTone;
};

type FlashContextValue = {
  showFlash: (message: string, tone?: FlashTone) => void;
  clearFlash: () => void;
};

const FlashContext = createContext<FlashContextValue | null>(null);

export function FlashProvider({ children }: { children: ReactNode }) {
  const [flash, setFlash] = useState<FlashState | null>(null);

  const clearFlash = useCallback(() => {
    setFlash(null);
  }, []);

  const showFlash = useCallback((message: string, tone: FlashTone = 'success') => {
    setFlash({ message, tone });
  }, []);

  useEffect(() => {
    if (!flash) return;

    const timer = setTimeout(clearFlash, 3000);
    return () => clearTimeout(timer);
  }, [clearFlash, flash]);

  const value = useMemo(() => ({ showFlash, clearFlash }), [clearFlash, showFlash]);

  return (
    <FlashContext.Provider value={value}>
      {children}
      {flash ? (
        <Pressable onPress={clearFlash} style={[styles.banner, styles[flash.tone]]}>
          <Text style={styles.message}>{flash.message}</Text>
        </Pressable>
      ) : null}
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error('useFlash must be used inside FlashProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 86,
    left: theme.spacing[4],
    right: theme.spacing[4],
    zIndex: 50,
    minHeight: 46,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
    ...theme.shadow.md,
  },
  success: {
    backgroundColor: theme.colors.green[600],
  },
  error: {
    backgroundColor: theme.colors.red[600],
  },
  info: {
    backgroundColor: theme.colors.blue[600],
  },
  message: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
});
