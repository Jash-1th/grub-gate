import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFlash } from '../contexts/FlashContext';
import {
  getAddressId,
  getUserAddresses,
  updateUserAddress,
  type AddressPayload,
  type AddressType,
  type SavedAddress,
} from '../lib/userAddressApi';
import { theme } from '../theme';

type ProfileSection = 'Profile' | 'Addresses' | 'Orders' | 'Social';

type ProfileUser = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  displayName?: string;
  fullName?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AddressFormState = {
  type: AddressType;
  street: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  instructions: string;
  isDefault: boolean;
};

const profileRows: { label: ProfileSection; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Profile', icon: 'person-outline' },
  { label: 'Addresses', icon: 'location-outline' },
  { label: 'Orders', icon: 'receipt-outline' },
  { label: 'Social', icon: 'people-outline' },
];

const emptyAddressForm: AddressFormState = {
  type: 'home',
  street: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'IN',
  instructions: '',
  isDefault: false,
};

export default function ProfileScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { showFlash } = useFlash();
  const profileUser = (user || {}) as ProfileUser;
  const [activeSection, setActiveSection] = useState<ProfileSection>(params.tab === 'addresses' ? 'Addresses' : 'Profile');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [formError, setFormError] = useState('');

  const fullName =
    profileUser.fullName ||
    [profileUser.firstName, profileUser.lastName].filter(Boolean).join(' ') ||
    profileUser.name ||
    'GrubGate Customer';
  const displayName = profileUser.displayName || profileUser.firstName || profileUser.name || fullName;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'G';
  const userId = profileUser._id || profileUser.id || 'Not available';

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) || addresses[0] || null,
    [addresses],
  );

  useEffect(() => {
    if (params.tab === 'addresses') setActiveSection('Addresses');
  }, [params.tab]);

  useEffect(() => {
    if (!isAuthenticated || activeSection !== 'Addresses') return;

    let mounted = true;

    async function loadAddresses() {
      setIsLoadingAddresses(true);
      const result = await getUserAddresses();

      if (!mounted) return;

      if (result.success) {
        setAddresses(result.addresses);
      } else {
        showFlash(result.error, 'error');
      }

      setIsLoadingAddresses(false);
    }

    loadAddresses();

    return () => {
      mounted = false;
    };
  }, [activeSection, isAuthenticated, showFlash]);

  const openAddressEditor = (address: SavedAddress) => {
    setEditingAddressId(getAddressId(address));
    setAddressForm({
      type: address.type || 'home',
      street: address.street || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      province: address.province || '',
      postalCode: address.postalCode || '',
      country: address.country || detectCountry(address.postalCode || '') || 'IN',
      instructions: address.instructions || '',
      isDefault: Boolean(address.isDefault),
    });
    setFormError('');
  };

  const closeAddressEditor = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setFormError('');
  };

  const handleSaveAddress = async () => {
    const validationMessage = validateAddressForm(addressForm);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    if (!editingAddressId) return;

    setIsSavingAddress(true);
    setFormError('');

    const payload: AddressPayload = {
      type: addressForm.type,
      label: addressForm.type,
      street: addressForm.street.trim(),
      addressLine2: addressForm.addressLine2.trim(),
      city: addressForm.city.trim(),
      province: addressForm.province.trim(),
      postalCode: addressForm.postalCode.trim(),
      country: addressForm.country.trim(),
      instructions: addressForm.instructions.trim(),
      isDefault: addressForm.isDefault,
    };

    const result = await updateUserAddress(editingAddressId, payload);

    if (result.success) {
      setAddresses(result.addresses);
      closeAddressEditor();
      showFlash('Address updated successfully.', 'success');
    } else {
      setFormError(result.error);
    }

    setIsSavingAddress(false);
  };

  const handleLogout = async () => {
    await logout();
    showFlash('Logged out successfully.', 'success');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.page}>
        <ProfileHeader />
        <View style={styles.authWrap}>
          <View style={styles.card}>
            <View style={styles.authIcon}>
              <Ionicons name="person-outline" size={34} color={theme.colors.brand.grubRed} />
            </View>
            <Text style={styles.authTitle}>Your GrubGate Profile</Text>
            <Text style={styles.authCopy}>Sign in to manage your meal plans, orders, addresses, and subscription details.</Text>
            <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/signup')} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
              <Text style={styles.outlineButtonText}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ProfileHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userCopy}>
            <Text numberOfLines={1} style={styles.userName}>{displayName}</Text>
            <Text numberOfLines={1} style={styles.userEmail}>{profileUser.email || 'No email available'}</Text>
          </View>
        </View>

        <View style={styles.actionList}>
          {profileRows.map((row) => {
            const active = activeSection === row.label;
            return (
              <Pressable
                key={row.label}
                onPress={() => setActiveSection(row.label)}
                style={({ pressed }) => [styles.actionRow, active && styles.actionRowActive, pressed && styles.pressed]}
              >
                <View style={[styles.actionIcon, active && styles.actionIconActive]}>
                  <Ionicons name={row.icon} size={20} color={active ? theme.colors.brand.grubRed : theme.colors.gray[600]} />
                </View>
                <Text style={styles.actionText}>{row.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
              </Pressable>
            );
          })}
        </View>

        {activeSection === 'Profile' ? (
          <ProfileDetails
            userId={userId}
            fullName={fullName}
            displayName={displayName}
            email={profileUser.email || 'Not available'}
            createdAt={profileUser.createdAt}
            updatedAt={profileUser.updatedAt}
          />
        ) : activeSection === 'Addresses' ? (
          <AddressBook
            addresses={addresses}
            isLoading={isLoadingAddresses}
            editingAddressId={editingAddressId}
            addressForm={addressForm}
            formError={formError}
            isSaving={isSavingAddress}
            onOpenEditor={openAddressEditor}
            onCloseEditor={closeAddressEditor}
            onSave={handleSaveAddress}
            onChangeForm={(patch) => setAddressForm((current) => ({ ...current, ...patch }))}
          />
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{activeSection}</Text>
            <Text style={styles.sectionCopy}>{activeSection} details will be connected next.</Text>
          </View>
        )}

        <Pressable
          onPress={handleLogout}
          disabled={isLoading}
          style={({ pressed }) => [styles.logoutButton, isLoading && styles.disabledButton, pressed && styles.pressed]}
        >
          <Ionicons name="log-out-outline" size={18} color={theme.colors.brand.grubRed} />
          <Text style={styles.logoutButtonText}>{isLoading ? 'Logging out...' : 'Logout'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ProfileHeader() {
  return (
    <SafeAreaView edges={['top']} style={styles.header}>
      <View style={styles.headerInner}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Settings">
          <Ionicons name="settings-outline" size={22} color={theme.colors.gray[700]} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ProfileDetails({
  userId,
  fullName,
  displayName,
  email,
  createdAt,
  updatedAt,
}: {
  userId: string;
  fullName: string;
  displayName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}) {
  return (
    <View style={styles.detailsGrid}>
      <ProfileInfoCard label="User ID" value={userId} />
      <ProfileInfoCard label="Full name" value={fullName} />
      <ProfileInfoCard label="Display name" value={displayName} />
      <ProfileInfoCard label="Email" value={email} />
      <ProfileInfoCard label="Created" value={formatDate(createdAt)} />
      <ProfileInfoCard label="Updated" value={formatDate(updatedAt)} />
    </View>
  );
}

function AddressBook({
  addresses,
  isLoading,
  editingAddressId,
  addressForm,
  formError,
  isSaving,
  onOpenEditor,
  onCloseEditor,
  onSave,
  onChangeForm,
}: {
  addresses: SavedAddress[];
  isLoading: boolean;
  editingAddressId: string | null;
  addressForm: AddressFormState;
  formError: string;
  isSaving: boolean;
  onOpenEditor: (address: SavedAddress) => void;
  onCloseEditor: () => void;
  onSave: () => void;
  onChangeForm: (patch: Partial<AddressFormState>) => void;
}) {
  return (
    <View style={styles.addressSection}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Address Book</Text>
        <Text style={styles.sectionCopy}>Manage your delivery locations and set a default address.</Text>
      </View>

      {isLoading ? (
        <View style={styles.cardCentered}>
          <ActivityIndicator color={theme.colors.brand.grubRed} />
          <Text style={styles.sectionCopy}>Loading saved addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.cardCentered}>
          <Ionicons name="location-outline" size={34} color={theme.colors.gray[300]} />
          <Text style={styles.sectionCopy}>No saved addresses found</Text>
        </View>
      ) : (
        <View style={styles.savedAddressList}>
          {addresses.map((address) => {
            const addressId = getAddressId(address);
            const editing = addressId === editingAddressId;

            return (
              <View key={addressId || address.street} style={styles.savedAddressCard}>
                <View style={styles.savedAddressContent}>
                  <Text style={styles.savedAddressStreet}>{formatAddressLine(address)}</Text>
                  <Text style={styles.savedAddressMeta}>
                    {formatAddressType(address.type)}{address.isDefault ? ' • DEFAULT' : ''}
                  </Text>
                </View>
                <Pressable onPress={() => onOpenEditor(address)} style={({ pressed }) => [styles.editAddressButton, pressed && styles.pressed]}>
                  <Text style={styles.editAddressButtonText}>{editing ? 'Editing' : 'Edit'}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {editingAddressId ? (
        <View style={styles.addressEditor}>
          <Text style={styles.sectionTitle}>Edit Address</Text>
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <View style={styles.addressTypeRow}>
            {(['home', 'work', 'other'] as AddressType[]).map((type) => {
              const active = addressForm.type === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => onChangeForm({ type })}
                  style={({ pressed }) => [styles.addressTypeButton, active && styles.addressTypeButtonActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.addressTypeText, active && styles.addressTypeTextActive]}>{formatAddressType(type)}</Text>
                </Pressable>
              );
            })}
          </View>

          <AddressInput label="Street Address *" value={addressForm.street} onChangeText={(street) => onChangeForm({ street })} />
          <AddressInput label="Apartment, Suite, etc." value={addressForm.addressLine2} onChangeText={(addressLine2) => onChangeForm({ addressLine2 })} />
          <View style={styles.inputRow}>
            <AddressInput compact label="City *" value={addressForm.city} onChangeText={(city) => onChangeForm({ city })} />
            <AddressInput compact label="Province *" value={addressForm.province} onChangeText={(province) => onChangeForm({ province })} />
          </View>
          <View style={styles.inputRow}>
            <AddressInput compact label="Postal Code *" value={addressForm.postalCode} onChangeText={(postalCode) => onChangeForm({ postalCode, country: detectCountry(postalCode) || addressForm.country })} />
            <AddressInput compact label="Country *" value={addressForm.country} onChangeText={(country) => onChangeForm({ country })} />
          </View>
          <AddressInput label="Delivery Instructions" value={addressForm.instructions} onChangeText={(instructions) => onChangeForm({ instructions: instructions.slice(0, 200) })} />

          <Pressable onPress={() => onChangeForm({ isDefault: !addressForm.isDefault })} style={({ pressed }) => [styles.defaultRow, pressed && styles.pressed]}>
            <View style={[styles.checkboxBox, addressForm.isDefault && styles.checkboxBoxChecked]}>
              <Text style={styles.checkboxText}>{addressForm.isDefault ? '✓' : ''}</Text>
            </View>
            <Text style={styles.defaultText}>Set as default address</Text>
          </Pressable>

          <View style={styles.editorActions}>
            <Pressable onPress={onCloseEditor} style={({ pressed }) => [styles.cancelAddressButton, pressed && styles.pressed]}>
              <Text style={styles.cancelAddressButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={isSaving}
              style={({ pressed }) => [styles.saveAddressButton, isSaving && styles.disabledButton, pressed && styles.pressed]}
            >
              {isSaving ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.saveAddressButtonText}>Save Address</Text>}
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function AddressInput({
  label,
  value,
  onChangeText,
  compact = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <View style={compact ? styles.compactInputWrap : styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={styles.textInput} placeholderTextColor={theme.colors.gray[400]} />
    </View>
  );
}

function ProfileInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text selectable numberOfLines={2} style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function formatAddressLine(address: SavedAddress) {
  return [address.street, address.city, address.province, address.postalCode].filter(Boolean).join(', ') || 'Saved address';
}

function formatAddressType(type?: AddressType) {
  if (type === 'work') return 'Work';
  if (type === 'other') return 'Other';
  return 'Home';
}

function validateAddressForm(form: AddressFormState) {
  if (!form.street.trim()) return 'Street address is required.';
  if (!form.city.trim()) return 'City is required.';
  if (!form.province.trim()) return 'Province is required.';
  if (!form.postalCode.trim()) return 'Postal code is required.';
  if (!form.country.trim()) return 'Country is required.';
  if (form.instructions.length > 200) return 'Delivery instructions cannot exceed 200 characters.';
  return '';
}

function detectCountry(postalCode: string) {
  const value = postalCode.trim();
  if (/^\d{6}$/.test(value)) return 'IN';
  if (/^\d{5}(-\d{4})?$/.test(value)) return 'US';
  if (/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value)) return 'CA';
  return '';
}

function formatDate(value?: string) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...theme.shadow.sm,
  },
  headerInner: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
  },
  headerTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: theme.spacing[4],
    paddingBottom: 120,
    gap: theme.spacing[4],
  },
  userCard: {
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    ...theme.shadow.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.red[50],
  },
  avatarText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  userCopy: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  userEmail: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  actionList: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  actionRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  actionRowActive: {
    backgroundColor: '#FFF7F8',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    marginRight: theme.spacing[3],
  },
  actionIconActive: {
    backgroundColor: theme.colors.red[50],
  },
  actionText: {
    flex: 1,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  detailsGrid: {
    gap: theme.spacing[3],
  },
  infoCard: {
    minHeight: 78,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
  },
  infoLabel: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  infoValue: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 22,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  card: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    ...theme.shadow.sm,
  },
  cardCentered: {
    minHeight: 110,
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    ...theme.shadow.sm,
  },
  sectionTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sectionCopy: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  addressSection: {
    gap: theme.spacing[4],
  },
  savedAddressList: {
    gap: theme.spacing[3],
  },
  savedAddressCard: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    ...theme.shadow.sm,
  },
  savedAddressContent: {
    flex: 1,
    minWidth: 0,
  },
  savedAddressStreet: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 22,
    fontWeight: theme.typography.fontWeight.bold,
  },
  savedAddressMeta: {
    marginTop: theme.spacing[2],
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
  },
  editAddressButton: {
    minHeight: 38,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.red[50],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[3],
  },
  editAddressButtonText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  addressEditor: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    gap: theme.spacing[4],
    ...theme.shadow.sm,
  },
  formError: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  addressTypeRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  addressTypeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  addressTypeButtonActive: {
    borderColor: theme.colors.brand.grubRed,
    backgroundColor: theme.colors.red[50],
  },
  addressTypeText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  addressTypeTextActive: {
    color: theme.colors.brand.grubRed,
  },
  inputWrap: {
    gap: theme.spacing[2],
  },
  compactInputWrap: {
    flex: 1,
    gap: theme.spacing[2],
  },
  inputLabel: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  textInput: {
    minHeight: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: theme.colors.brand.grubRed,
    borderColor: theme.colors.brand.grubRed,
  },
  checkboxText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: theme.typography.fontWeight.bold,
  },
  defaultText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  editorActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  cancelAddressButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelAddressButtonText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  saveAddressButton: {
    flex: 1.4,
    minHeight: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brand.grubRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAddressButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  authWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing[4],
  },
  authIcon: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.red[50],
    marginBottom: theme.spacing[4],
    alignSelf: 'center',
  },
  authTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  authCopy: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    marginTop: theme.spacing[6],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.brand.grubRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  outlineButton: {
    width: '100%',
    minHeight: 52,
    marginTop: theme.spacing[3],
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.red[200],
    backgroundColor: theme.colors.red[50],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  outlineButtonText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.red[200],
    backgroundColor: theme.colors.red[50],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  logoutButtonText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.76,
  },
});
