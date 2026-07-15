import * as SecureStore from 'expo-secure-store';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'grubgate.customer.mobilePlanning';

type PlanningState = {
  postalCode: string;
  source: string;
};

type PlanningContextValue = PlanningState & {
  hasHydrated: boolean;
  setPostalCode: (postalCode: string) => void;
  setSource: (source: string) => void;
  resetPlanning: () => void;
};

const initialState: PlanningState = {
  postalCode: '',
  source: 'plan',
};

const PlanningContext = createContext<PlanningContextValue | null>(null);

export function PlanningProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PlanningState>(initialState);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const saved = await getStoredPlanning();
      if (!mounted) return;

      if (saved) {
        setState({
          postalCode: typeof saved.postalCode === 'string' ? saved.postalCode : '',
          source: typeof saved.source === 'string' ? saved.source : 'plan',
        });
      }

      setHasHydrated(true);
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    setStoredPlanning(state);
  }, [hasHydrated, state]);

  const setPostalCode = useCallback((postalCode: string) => {
    setState((current) => {
      const nextPostalCode = postalCode.trim().toUpperCase();
      if (current.postalCode === nextPostalCode) return current;
      return { ...current, postalCode: nextPostalCode };
    });
  }, []);

  const setSource = useCallback((source: string) => {
    setState((current) => {
      if (current.source === source) return current;
      return { ...current, source };
    });
  }, []);

  const resetPlanning = useCallback(() => {
    setState((current) => {
      if (current.postalCode === initialState.postalCode && current.source === initialState.source) return current;
      return initialState;
    });
  }, []);

  const value = useMemo<PlanningContextValue>(() => ({
    ...state,
    hasHydrated,
    setPostalCode,
    setSource,
    resetPlanning,
  }), [hasHydrated, resetPlanning, setPostalCode, setSource, state]);

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning() {
  const context = useContext(PlanningContext);

  if (!context) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }

  return context;
}

async function setStoredPlanning(state: PlanningState) {
  const value = JSON.stringify(state);

  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(STORAGE_KEY, value);
}

async function getStoredPlanning(): Promise<Partial<PlanningState> | null> {
  const value = Platform.OS === 'web'
    ? getWebStorage()?.getItem(STORAGE_KEY) || null
    : await SecureStore.getItemAsync(STORAGE_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as Partial<PlanningState>;
  } catch {
    return null;
  }
}

function getWebStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}
