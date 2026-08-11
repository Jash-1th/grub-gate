import { useMemo, useState } from 'react';
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
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useFlash } from '../../contexts/FlashContext';
import { authValidation, loginCopy, signupCopy } from '../../data/auth';
import { theme } from '../../theme';

type AuthMode = 'login' | 'signup';
type FieldName = 'identifier' | 'name' | 'email' | 'phoneNumber' | 'password' | 'confirmPassword';
type FormState = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName | 'general', string>>;

const initialForm: FormState = {
  identifier: '',
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const { clearError, error: authError, isLoading, login, register } = useAuth();
  const { showFlash } = useFlash();
  const copy = mode === 'login' ? loginCopy : signupCopy;

  const isLogin = mode === 'login';
  const fields = useMemo(
    () =>
      isLogin
        ? (['identifier', 'password'] as FieldName[])
        : (['name', 'email', 'phoneNumber', 'password', 'confirmPassword'] as FieldName[]),
    [isLogin],
  );

  const updateField = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    clearError();
    if (errors[field] || errors.general) {
      setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (isLogin) {
      if (!form.identifier.trim()) {
        nextErrors.identifier = authValidation.identifierRequired;
      } else if (!isEmail(form.identifier) && !isPhone(form.identifier)) {
        nextErrors.identifier = authValidation.invalidIdentifier;
      }
    } else {
      if (!form.name.trim()) nextErrors.name = authValidation.nameRequired;
      else if (form.name.trim().length < 3) nextErrors.name = authValidation.nameTooShort;
      else if (form.name.trim().length > 100) nextErrors.name = authValidation.nameTooLong;
      else if (!isFullName(form.name)) nextErrors.name = authValidation.fullNameRequired;

      if (!form.email.trim()) nextErrors.email = authValidation.emailRequired;
      else if (!isEmail(form.email)) nextErrors.email = authValidation.invalidEmail;

      if (!form.phoneNumber.trim()) nextErrors.phoneNumber = authValidation.phoneRequired;
      else if (!isPhone(form.phoneNumber)) nextErrors.phoneNumber = authValidation.invalidPhone;
    }

    if (!form.password) nextErrors.password = authValidation.passwordRequired;
    else if (form.password.length < 6) nextErrors.password = authValidation.passwordTooShort;

    if (!isLogin) {
      if (!form.confirmPassword) nextErrors.confirmPassword = authValidation.confirmPasswordRequired;
      else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = authValidation.passwordsDoNotMatch;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (isLoading || !validate()) return;

    setErrors({});

    const result = isLogin
      ? await login({
          identifier: form.identifier.trim(),
          password: form.password,
        })
      : await register({
          ...splitFullName(form.name),
          email: form.email.trim().toLowerCase(),
          phoneNumber: normalizePhoneNumber(form.phoneNumber),
          password: form.password,
          role: 'customer',
        });

    if (result.ok) {
      showFlash(isLogin ? 'Login successful. Welcome back!' : 'Account created successfully. Welcome to GrubGate!', 'success');
      router.replace('/');
    } else {
      setErrors({ general: result.error });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.keyboardRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroShade} />
          <Text style={styles.heroTitle}>{copy.title}</Text>
          <Text style={styles.heroSubtitle}>{copy.subtitle}</Text>
        </View>

        <View style={styles.card}>
          {errors.general || authError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errors.general || authError}</Text>
            </View>
          ) : null}

          {fields.map((field) => (
            <AuthField
              key={field}
              field={field}
              value={form[field]}
              error={errors[field]}
              mode={mode}
              onChange={(value) => updateField(field, value)}
            />
          ))}

          {isLogin ? (
            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>{loginCopy.forgotPassword}</Text>
            </Pressable>
          ) : null}

          <Pressable
            disabled={isLoading}
            onPress={submit}
            style={({ pressed }) => [styles.primaryButton, (pressed || isLoading) && styles.pressed]}
          >
            {isLoading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.primaryButtonText}>{copy.button}</Text>}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{copy.divider}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}>
            <View style={styles.googleMark}>
              <Text style={styles.googleMarkText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>{copy.googleButton}</Text>
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchPrompt}>{isLogin ? loginCopy.signupPrompt : signupCopy.loginPrompt} </Text>
            <Pressable onPress={() => router.push(isLogin ? '/signup' : '/login')}>
              <Text style={styles.switchLink}>{isLogin ? loginCopy.signupLink : signupCopy.loginLink}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AuthField({
  field,
  value,
  error,
  mode,
  onChange,
}: {
  field: FieldName;
  value: string;
  error?: string;
  mode: AuthMode;
  onChange: (value: string) => void;
}) {
  const props = getFieldProps(field, mode);
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={props.placeholder}
        placeholderTextColor={theme.colors.gray[400]}
        keyboardType={props.keyboardType}
        secureTextEntry={props.secureTextEntry}
        autoCapitalize={props.autoCapitalize}
        style={[styles.input, error && styles.inputError]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function getFieldProps(field: FieldName, mode: AuthMode) {
  switch (field) {
    case 'identifier':
      return {
        label: loginCopy.identifierLabel,
        placeholder: loginCopy.identifierPlaceholder,
        keyboardType: 'email-address' as const,
        autoCapitalize: 'none' as const,
      };
    case 'name':
      return {
        label: signupCopy.nameLabel,
        placeholder: signupCopy.namePlaceholder,
        keyboardType: 'default' as const,
        autoCapitalize: 'words' as const,
      };
    case 'email':
      return {
        label: signupCopy.emailLabel,
        placeholder: signupCopy.emailPlaceholder,
        keyboardType: 'email-address' as const,
        autoCapitalize: 'none' as const,
      };
    case 'phoneNumber':
      return {
        label: signupCopy.phoneLabel,
        placeholder: signupCopy.phonePlaceholder,
        keyboardType: 'phone-pad' as const,
        autoCapitalize: 'none' as const,
      };
    case 'confirmPassword':
      return {
        label: signupCopy.confirmPasswordLabel,
        placeholder: signupCopy.confirmPasswordPlaceholder,
        keyboardType: 'default' as const,
        secureTextEntry: true,
        autoCapitalize: 'none' as const,
      };
    case 'password':
    default:
      return {
        label: mode === 'login' ? loginCopy.passwordLabel : signupCopy.passwordLabel,
        placeholder: mode === 'login' ? loginCopy.passwordPlaceholder : signupCopy.passwordPlaceholder,
        keyboardType: 'default' as const,
        secureTextEntry: true,
        autoCapitalize: 'none' as const,
      };
  }
}

function isEmail(value: string) {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value.trim());
}

function isPhone(value: string) {
  return /^[+]?[1-9]\d{1,14}$/.test(normalizePhoneNumber(value));
}

function isFullName(value: string) {
  return /^[a-zA-Z\s'-]+\s+[a-zA-Z\s'-]+$/.test(value.trim());
}

function normalizePhoneNumber(value: string) {
  return value.trim().replace(/[\s()-]/g, '');
}

function splitFullName(value: string) {
  const [firstName, ...lastNameParts] = value.trim().split(/\s+/);
  return {
    firstName: firstName || '',
    lastName: lastNameParts.join(' '),
  };
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
  inputError: {
    borderColor: theme.colors.red[300],
    backgroundColor: theme.colors.red[50],
  },
  fieldError: {
    marginTop: theme.spacing[1],
    color: theme.colors.red[600],
    fontSize: theme.typography.fontSize.sm,
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
