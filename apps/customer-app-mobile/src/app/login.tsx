import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useFlash } from '../contexts/FlashContext';
import api from '../lib/api';
import { type StoredUser } from '../lib/secureAuthStorage';
import { theme } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

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
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const { applyAuthenticatedSession } = useAuth();
  const { showFlash } = useFlash();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <LinearGradient
        colors={['#FFF1F2', '#FFFFFF', '#F3F4F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.page}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.card}>
              <View style={styles.headerSection}>
                <Text style={styles.heroTitle}>Welcome Back!</Text>
                <Text style={styles.heroSubtitle}>Log in to access your meal plans and continue your journey with GrubGate.</Text>
              </View>

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Email or Phone Number</Text>
                <View style={[styles.inputContainer, focusedField === 'email' && styles.inputContainerFocused]}>
                  <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? theme.colors.brand.grubRed : theme.colors.gray[400]} style={styles.inputIcon} />
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
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, focusedField === 'password' && styles.inputContainerFocused]}>
                  <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? theme.colors.brand.grubRed : theme.colors.gray[400]} style={styles.inputIcon} />
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
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.input}
                  />
                </View>
              </View>

              <Pressable style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              <AnimatedPressable
                disabled={isLoading}
                onPress={handleLogin}
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              >
                {isLoading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.primaryButtonText}>Login</Text>}
              </AnimatedPressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

           <AnimatedPressable style={styles.googleButton}>
                
                <View style={styles.googleButtonInner}>
                  <View style={styles.googleMark}>
                    <Text style={styles.googleMarkText}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Login with Google</Text>
                </View>
              </AnimatedPressable>

              <View style={styles.switchRow}>
                <Text style={styles.switchPrompt}>Don't have an account? </Text>
                <Pressable onPress={() => router.push('/signup')}>
                  <Text style={styles.switchLink}>Sign Up</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
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
  },
  content: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  card: {
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[6],
    ...theme.shadow.lg,
  },
  headerSection: {
    marginBottom: theme.spacing[6],
  },
  heroTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: 38,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: theme.spacing[3],
  },
  inputContainerFocused: {
    borderWidth: 2,
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: theme.spacing[3],
  },
  input: {
    flex: 1,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    paddingVertical: theme.spacing[2],
    backgroundColor: 'transparent',
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
    minHeight: 52,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
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
  googleButton: {
    height: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.white,
  },
  googleButtonInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMark: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: theme.colors.blue[600],
  },
});
