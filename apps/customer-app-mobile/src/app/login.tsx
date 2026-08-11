import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useFlash } from '../contexts/FlashContext';
import api from '../lib/api';
import { type StoredUser } from '../lib/secureAuthStorage';
import { theme } from '../theme';

type LoginResponseData = {
  status?: string;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    jwt?: string;
    user?: StoredUser;
  };
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  jwt?: string;
  user?: StoredUser;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { applyAuthenticatedSession } = useAuth();
  const { showFlash } = useFlash();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post<LoginResponseData>('/auth/login', {
        identifier: trimmedEmail,
        password,
      });

      console.log('Login Response:', response.data);

      const authData = response.data.data || response.data;
      const token = authData.accessToken || authData.token || authData.jwt;

      if (!token) {
        setErrorMessage('Login succeeded, but no access token was returned.');
        return;
      }

      await applyAuthenticatedSession({
        token,
        refreshToken: authData.refreshToken,
        user: authData.user,
      });

      showFlash('Login successful. Welcome back!', 'success');
      router.replace('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('Login Error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          baseURL: error.config?.baseURL,
          url: error.config?.url,
        });
      }

      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.keyboardRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroShade} />
          <Text style={styles.heroTitle}>Welcome Back!</Text>
          <Text style={styles.heroSubtitle}>Log in to access your meal plans and continue your journey with GrubGate.</Text>
        </View>

        <View style={styles.card}>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Email or Phone Number</Text>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErrorMessage('');
              }}
              placeholder="Enter your email or phone number"
              placeholderTextColor={theme.colors.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setErrorMessage('');
              }}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.gray[400]}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <Pressable style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          <Pressable
            disabled={isLoading}
            onPress={handleLogin}
            style={({ pressed }) => [styles.primaryButton, (pressed || isLoading) && styles.pressed]}
          >
            {isLoading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.primaryButtonText}>Login</Text>}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}>
            <View style={styles.googleMark}>
              <Text style={styles.googleMarkText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Login with Google</Text>
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchPrompt}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/signup')}>
              <Text style={styles.switchLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as {
      message?: string;
      error?: string | { message?: string };
      errors?: { message?: string }[] | string[];
    } | undefined;
    const backendMessage = getBackendMessage(data);

    if (!error.response) {
      return 'Cannot connect to the backend. Restart the backend and make sure port 5000 is allowed on your Wi-Fi network.';
    }

    if (status === 400 || status === 401) {
      return backendMessage || 'Invalid email or password.';
    }

    return backendMessage || `Login failed with server status ${status || 'unknown'}.`;
  }

  if (error instanceof Error) return error.message;
  return 'Login failed. Please try again.';
}

function getBackendMessage(data?: {
  message?: string;
  error?: string | { message?: string };
  errors?: { message?: string }[] | string[];
}) {
  if (!data) return '';
  if (typeof data.message === 'string' && data.message.trim()) return data.message;
  if (typeof data.error === 'string' && data.error.trim()) return data.error;
  if (typeof data.error === 'object' && typeof data.error.message === 'string') return data.error.message;

  const firstError = Array.isArray(data.errors) ? data.errors[0] : null;
  if (typeof firstError === 'string') return firstError;
  if (firstError && typeof firstError.message === 'string') return firstError.message;

  return '';
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
  },
  content: {
    paddingBottom: theme.spacing[8],
  },
  hero: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.colors.brand.grubRed,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: 38,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: theme.spacing[3],
    color: theme.colors.red[100],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  card: {
    margin: theme.spacing[4],
    marginTop: -theme.spacing[8],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[6],
    ...theme.shadow.md,
  },
  errorBox: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.red[200],
    backgroundColor: theme.colors.red[50],
    padding: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  errorText: {
    color: theme.colors.red[700],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  fieldBlock: {
    marginBottom: theme.spacing[4],
  },
  label: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[2],
  },
  input: {
    minHeight: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.white,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing[4],
  },
  forgotText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray[300],
  },
  dividerText: {
    paddingHorizontal: theme.spacing[4],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  googleButton: {
    minHeight: 50,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  googleMark: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
    backgroundColor: theme.colors.blue[600],
  },
  googleMarkText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  googleButtonText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing[5],
  },
  switchPrompt: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
  },
  switchLink: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
});
