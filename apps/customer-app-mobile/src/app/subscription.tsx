import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useRootNavigationState } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFlash } from '../contexts/FlashContext';
import {
  mealTypes,
  type DayId,
  type MealType,
  type PlannedMealItem,
  useMealPlan,
} from '../contexts/MealPlanContext';
import api from '../lib/api';
import { theme } from '../theme';

const DEFAULT_DELIVERY_FEE = 3.99;
const SERVICE_FEE_PERCENTAGE = 0.099;
const DEFAULT_TAX_RATE = 0.15;
const PLATFORM_COMMISSION_PERCENTAGE = 0.17;
const calendarDayOrder: DayId[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const planIds = ['bi-weekly', 'monthly'] as const;

type PlanId = (typeof planIds)[number];
type AddressType = 'home' | 'work' | 'other';
type SavedAddress = {
  _id?: string;
  id?: string;
  type?: AddressType;
  street: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  instructions?: string;
  isDefault?: boolean;
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

const emptyAddressForm: AddressFormState = {
  type: 'home',
  street: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  country: '',
  instructions: '',
  isDefault: false,
};

export default function SubscriptionScreen() {
  const { getMealItems, getTotalItems, getTotalCost, hasHydrated } = useMealPlan();
  const { isAuthenticated, isHydrating } = useAuth();
  const { showFlash } = useFlash();
  const rootNavigationState = useRootNavigationState();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly');
  const [showSetupModal, setShowSetupModal] = useState(false);

  const totalItems = getTotalItems();
  const biweeklyMealCost = getTotalCost();
  const deliveryCount = getActualDeliveryCount(getMealItems);

  useEffect(() => {
    if (!rootNavigationState?.key || !hasHydrated) return;
    if (totalItems > 0) return;

    showFlash('Please select at least one meal item before choosing a subscription plan.', 'info');
    router.replace('/weekly-menu');
  }, [hasHydrated, rootNavigationState?.key, showFlash, totalItems]);

  const pricingByPlan = useMemo(() => ({
    'bi-weekly': getMealCostForPlan('bi-weekly', biweeklyMealCost, deliveryCount),
    monthly: getMealCostForPlan('monthly', biweeklyMealCost, deliveryCount),
  }), [biweeklyMealCost, deliveryCount]);

  const currentPricing = pricingByPlan[selectedPlan];

  const plans = [
    {
      id: 'bi-weekly' as const,
      name: 'Bi-Weekly',
      description: 'Perfect for regular meal planning',
      price: pricingByPlan['bi-weekly'].total,
      period: 'every 2 weeks',
      features: [
        '14 days of meal planning',
        'Restaurant recommendations',
        'Dietary preferences support',
        'Mobile app access',
        'Email support',
        'Flexible scheduling',
      ],
      popular: false,
      color: 'blue' as const,
    },
    {
      id: 'monthly' as const,
      name: '1 Month',
      description: 'Best value for consistent planning',
      price: pricingByPlan.monthly.total,
      period: 'every month',
      features: [
        'Everything in Bi-Weekly',
        '30 days of meal planning',
        'Advanced nutritional tracking',
        'Multiple dietary profiles',
        'Priority support',
        'Exclusive restaurant deals',
        '10% savings vs bi-weekly',
      ],
      popular: true,
      color: 'brand' as const,
    },
  ];

  const handleSubscribeNow = () => {
    if (!isAuthenticated) {
      showFlash('Please login to subscribe to a plan.', 'info');
      router.push('/login?redirect=/subscription');
      return;
    }

    setShowSetupModal(true);
  };

  if (isHydrating) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.brand.grubRed} />
          <Text style={styles.loadingText}>Loading subscription plans...</Text>
        </View>
      </>
    );
  }

  const selectedPlanMeta = plans.find((plan) => plan.id === selectedPlan) || plans[0];
  const footerTotalLabel = formatPrice(currentPricing.total);
  const FOOTER_HEIGHT = 86;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.page}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.push('/weekly-menu');
            }}
            hitSlop={12}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.gray[900]} />
          </Pressable>

          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + FOOTER_HEIGHT + theme.spacing[4] },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your plan</Text>
            <Text style={styles.sectionSubtitle}>Select one option to continue.</Text>
          </View>

          <View style={styles.planList}>
            {plans.map((plan) => {
              const selected = selectedPlan === plan.id;
              const isBrand = plan.color === 'brand';

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                  style={({ pressed }) => [
                    styles.planCard,
                    selected ? styles.planCardActive : styles.planCardInactive,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${plan.name} plan`}
                >
                  {plan.popular ? (
                    <View style={styles.popularPill}>
                      <Text style={styles.popularPillText}>Most Popular</Text>
                    </View>
                  ) : null}

                  <View style={styles.planTopRow}>
                    <View style={styles.planTitleBlock}>
                      <Text style={[styles.planName, !selected && styles.planNameInactive]}>{plan.name}</Text>
                      <Text style={[styles.planDescription, !selected && styles.planDescriptionInactive]}>
                        {plan.description}
                      </Text>
                    </View>

                    <View style={styles.radio}>
                      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>
                    </View>
                  </View>

                  <View style={styles.planPriceRow}>
                    <Text style={[styles.planPrice, isBrand ? styles.planPriceBrand : styles.planPriceBlue]}>
                      {formatPrice(plan.price)}
                    </Text>
                    <Text style={[styles.planPeriod, !selected && styles.planDescriptionInactive]}>{plan.period}</Text>
                  </View>

                  <View style={styles.featureList}>
                    {plan.features.map((feature) => (
                      <View key={feature} style={styles.featureRow}>
                        <Text style={[styles.featureCheck, isBrand ? styles.featureCheckBrand : styles.featureCheckBlue]}>
                          ✓
                        </Text>
                        <Text style={[styles.featureText, !selected && styles.featureTextInactive]}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownTitle}>Total Cost Breakdown</Text>
              <Text style={styles.breakdownSubtitle}>
                Based on {totalItems} meal{totalItems === 1 ? '' : 's'} for {getPlanDurationText(selectedPlan)}
              </Text>
            </View>

            <View style={styles.breakdownBody}>
              <CostRow label="Meal Costs" value={currentPricing.subtotal} />
              <CostRow label="Delivery Fee" value={currentPricing.deliveryFee} />
              <CostRow label="Service Fee" value={currentPricing.serviceFee} />
              <CostRow label="Tax" value={currentPricing.tax} />
              <CostRow label="Platform Commission" value={currentPricing.platformCommission} />

              <View style={styles.receiptDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(currentPricing.total)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={handleSubscribeNow}
            style={({ pressed }) => [styles.subscribeButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Subscribe now for ${footerTotalLabel}`}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now • {footerTotalLabel}</Text>
          </Pressable>
        </View>

        <SubscriptionSetupModal
          visible={showSetupModal}
          selectedPlan={selectedPlanMeta}
          onClose={() => setShowSetupModal(false)}
          onBack={() => setShowSetupModal(false)}
          onUseCurrentLocation={() => showFlash('Location permission flow will be connected next.', 'info')}
          onAddAddress={() => showFlash('Address form will be connected next.', 'info')}
        />
      </SafeAreaView>
    </>
  );
}

function SubscriptionSetupModal({
  visible,
  selectedPlan,
  onClose,
  onBack,
  onUseCurrentLocation,
  onAddAddress,
}: {
  visible: boolean;
  selectedPlan: {
    id: PlanId;
    name: string;
    price: number;
  };
  onClose: () => void;
  onBack: () => void;
  onUseCurrentLocation: () => void;
  onAddAddress: () => void;
}) {
  const { showFlash } = useFlash();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!visible) return;

    let mounted = true;

    async function loadAddresses() {
      setIsLoadingAddresses(true);
      const result = await getUserAddresses();

      if (!mounted) return;

      if (result.success) {
        setAddresses(result.addresses);
        const defaultAddress = result.addresses.find((address) => address.isDefault) || result.addresses[0];
        setSelectedAddressId(getAddressId(defaultAddress) || null);
      } else {
        showFlash(result.error || 'Unable to load saved addresses.', 'error');
      }

      setIsLoadingAddresses(false);
    }

    loadAddresses();

    return () => {
      mounted = false;
    };
  }, [showFlash, visible]);

  const selectedAddress = addresses.find((address) => getAddressId(address) === selectedAddressId) || null;

  const handleOpenAddressForm = () => {
    setFormError('');
    setAddressForm(emptyAddressForm);
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    const validationMessage = validateAddressForm(addressForm);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setIsSavingAddress(true);
    setFormError('');

    const result = await addUserAddress({
      type: addressForm.type,
      label: addressForm.type,
      street: addressForm.street.trim(),
      addressLine2: addressForm.addressLine2.trim(),
      city: addressForm.city.trim(),
      province: addressForm.province.trim(),
      postalCode: addressForm.postalCode.trim(),
      country: addressForm.country,
      instructions: addressForm.instructions.trim(),
      isDefault: addressForm.isDefault,
    });

    if (result.success) {
      setAddresses(result.addresses);
      const nextAddress = result.addresses.find((address) => address.isDefault) || result.addresses[result.addresses.length - 1];
      setSelectedAddressId(getAddressId(nextAddress) || null);
      setShowAddressForm(false);
      setAddressForm(emptyAddressForm);
      showFlash('Address saved successfully.', 'success');
    } else {
      setFormError(result.error || 'Unable to save address.');
    }

    setIsSavingAddress(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Your Subscription</Text>
              <Pressable onPress={onClose} hitSlop={12} style={({ pressed }) => [styles.modalCloseButton, pressed && styles.pressed]}>
                <Text style={styles.modalCloseText}>x</Text>
              </Pressable>
            </View>

            <View style={styles.selectedPlanPanel}>
              <Text style={styles.selectedPlanLabel}>Selected Plan:</Text>
              <Text style={styles.selectedPlanName}>{selectedPlan.name}</Text>
              <View style={styles.selectedPlanPriceRow}>
                <Text style={styles.selectedPlanPrice}>{formatPrice(selectedPlan.price)}</Text>
                <Text style={styles.selectedPlanPeriod}>/ period</Text>
              </View>
              <View style={styles.selectedPlanNotice}>
                <Text style={styles.selectedPlanNoticeText}>Complete your subscription setup below</Text>
              </View>
            </View>

            <View style={styles.stepper}>
              <View style={styles.stepBlock}>
                <View style={styles.stepCircleActive}>
                  <Text style={styles.stepCircleActiveText}>P</Text>
                </View>
                <Text style={styles.stepTitleActive}>Delivery Address</Text>
                <Text style={styles.stepCaption}>Where should we deliver?</Text>
              </View>

              <View style={styles.stepLine} />

              <View style={styles.stepBlock}>
                <View style={styles.stepCircleInactive}>
                  <Text style={styles.stepCircleInactiveText}>C</Text>
                </View>
                <Text style={styles.stepTitleInactive}>Schedule & Payment</Text>
                <Text style={styles.stepCaption}>Set delivery schedule and payment</Text>
              </View>
            </View>

            <View style={styles.addressCard}>
              <Text style={styles.addressTitle}>Select Delivery Address</Text>
              <Text style={styles.addressSubtitle}>Choose where you'd like your order delivered</Text>

              {!showAddressForm ? (
                <>
                  <View style={styles.quickOptionsBox}>
                    <Text style={styles.quickOptionsTitle}>Quick Options</Text>
                    <View style={styles.quickOptionsButtons}>
                      <Pressable
                        onPress={onUseCurrentLocation}
                        style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.locationButtonText}>P  Use Current Location</Text>
                      </Pressable>

                      <Pressable
                        onPress={handleOpenAddressForm}
                        style={({ pressed }) => [styles.addAddressButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.addAddressButtonText}>+  Add New Address</Text>
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.savedAddressTitle}>Your Saved Addresses</Text>

                  {isLoadingAddresses ? (
                    <View style={styles.emptyAddressState}>
                      <ActivityIndicator color={theme.colors.blue[600]} />
                      <Text style={styles.emptyAddressText}>Loading your addresses...</Text>
                    </View>
                  ) : addresses.length > 0 ? (
                    <View style={styles.savedAddressList}>
                      {addresses.map((address) => {
                        const addressId = getAddressId(address);
                        const selected = addressId === selectedAddressId;

                        return (
                          <Pressable
                            key={addressId || address.street}
                            onPress={() => setSelectedAddressId(addressId)}
                            style={({ pressed }) => [
                              styles.savedAddressCard,
                              selected && styles.savedAddressCardSelected,
                              pressed && styles.pressed,
                            ]}
                          >
                            <View style={styles.savedAddressTopRow}>
                              <Text style={styles.savedAddressType}>{formatAddressType(address.type)}</Text>
                              {address.isDefault ? (
                                <View style={styles.defaultPill}>
                                  <Text style={styles.defaultPillText}>Default</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={styles.savedAddressStreet}>{address.street}</Text>
                            <Text style={styles.savedAddressMeta}>
                              {address.city}, {address.province} {address.postalCode}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.emptyAddressState}>
                      <View style={styles.emptyPinCircle}>
                        <Text style={styles.emptyPinText}>P</Text>
                      </View>
                      <Text style={styles.emptyAddressText}>No saved addresses found</Text>
                      <Pressable
                        onPress={handleOpenAddressForm}
                        style={({ pressed }) => [styles.firstAddressButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.firstAddressButtonText}>+  Add Your First Address</Text>
                      </Pressable>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.addressFormPanel}>
                  <Text style={styles.formTitle}>Add New Address</Text>

                  <Text style={styles.inputLabel}>Address Type</Text>
                  <View style={styles.addressTypeRow}>
                    {(['home', 'work', 'other'] as AddressType[]).map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => setAddressForm((current) => ({ ...current, type }))}
                        style={({ pressed }) => [
                          styles.addressTypeButton,
                          addressForm.type === type && styles.addressTypeButtonActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.addressTypeText, addressForm.type === type && styles.addressTypeTextActive]}>
                          {formatAddressType(type)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <AddressInput
                    label="Street Address *"
                    placeholder="123 Main Street"
                    value={addressForm.street}
                    onChangeText={(street) => setAddressForm((current) => ({ ...current, street }))}
                  />

                  <AddressInput
                    label="Apartment, Suite, etc. (Optional)"
                    placeholder="Apt 4B, Unit 12, etc."
                    value={addressForm.addressLine2}
                    onChangeText={(addressLine2) => setAddressForm((current) => ({ ...current, addressLine2 }))}
                  />

                  <View style={styles.inputGrid}>
                    <AddressInput
                      label="City *"
                      placeholder="Toronto"
                      value={addressForm.city}
                      onChangeText={(city) => setAddressForm((current) => ({ ...current, city }))}
                      compact
                    />
                    <AddressInput
                      label="Province *"
                      placeholder="ON"
                      value={addressForm.province}
                      onChangeText={(province) => setAddressForm((current) => ({ ...current, province }))}
                      compact
                    />
                    <AddressInput
                      label="Postal Code *"
                      placeholder="M5V 2B4"
                      value={addressForm.postalCode}
                      onChangeText={(postalCode) => {
                        setAddressForm((current) => ({
                          ...current,
                          postalCode,
                          country: current.country || detectCountry(postalCode),
                        }));
                      }}
                      compact
                    />
                  </View>

                  <Text style={styles.inputLabel}>Country *</Text>
                  <Pressable
                    onPress={() => setAddressForm((current) => ({ ...current, country: getNextCountry(current.country) }))}
                    style={({ pressed }) => [styles.countrySelect, pressed && styles.pressed]}
                  >
                    <Text style={[styles.countrySelectText, !addressForm.country && styles.placeholderText]}>
                      {getCountryLabel(addressForm.country) || 'Select Country'}
                    </Text>
                    <Text style={styles.countryChevron}>v</Text>
                  </Pressable>

                  <Text style={styles.inputLabel}>Delivery Instructions (Optional)</Text>
                  <TextInput
                    value={addressForm.instructions}
                    onChangeText={(instructions) => setAddressForm((current) => ({ ...current, instructions: instructions.slice(0, 200) }))}
                    placeholder="Ring buzzer, leave at door, call before delivery, etc."
                    placeholderTextColor={theme.colors.gray[400]}
                    multiline
                    maxLength={200}
                    style={styles.instructionsInput}
                  />
                  <Text style={styles.characterCount}>{addressForm.instructions.length}/200 characters</Text>

                  <Pressable
                    onPress={() => setAddressForm((current) => ({ ...current, isDefault: !current.isDefault }))}
                    style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}
                  >
                    <View style={[styles.checkboxBox, addressForm.isDefault && styles.checkboxBoxChecked]}>
                      <Text style={styles.checkboxCheck}>{addressForm.isDefault ? '✓' : ''}</Text>
                    </View>
                    <Text style={styles.checkboxLabel}>Set as default address</Text>
                  </Pressable>

                  {formError ? <Text style={styles.formError}>{formError}</Text> : null}

                  <View style={styles.formActionRow}>
                    <Pressable
                      onPress={() => {
                        setShowAddressForm(false);
                        setFormError('');
                      }}
                      style={({ pressed }) => [styles.cancelFormButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.cancelFormButtonText}>Cancel</Text>
                    </Pressable>

                    <Pressable
                      onPress={handleSaveAddress}
                      disabled={isSavingAddress}
                      style={({ pressed }) => [styles.saveAddressButton, isSavingAddress && styles.disabledButton, pressed && styles.pressed]}
                    >
                      {isSavingAddress ? (
                        <ActivityIndicator color={theme.colors.white} />
                      ) : (
                        <Text style={styles.saveAddressButtonText}>Save Address</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}

              <View style={styles.modalFooter}>
                <Pressable onPress={onBack} style={({ pressed }) => [styles.modalBackButton, pressed && styles.pressed]}>
                  <Text style={styles.modalBackButtonText}>Back</Text>
                </Pressable>

                <Pressable
                  disabled={!selectedAddress}
                  onPress={() => showFlash('Payment step will be connected next.', 'info')}
                  style={({ pressed }) => [
                    selectedAddress ? styles.enabledPaymentButton : styles.disabledPaymentButton,
                    pressed && selectedAddress && styles.pressed,
                  ]}
                >
                  <Text style={selectedAddress ? styles.enabledPaymentText : styles.disabledPaymentText}>Continue to Payment</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.costRow}>
      <Text style={styles.costLabel}>{label}</Text>
      <Text style={styles.costValue}>{formatPrice(value)}</Text>
    </View>
  );
}

function AddressInput({
  label,
  placeholder,
  value,
  onChangeText,
  compact,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <View style={compact ? styles.compactInputWrap : styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.gray[400]}
        style={styles.textInput}
      />
    </View>
  );
}

async function getUserAddresses(): Promise<{ success: true; addresses: SavedAddress[] } | { success: false; error: string }> {
  try {
    const response = await api.get('/users/addresses');
    return {
      success: true,
      addresses: Array.isArray(response.data?.data?.addresses) ? response.data.data.addresses : [],
    };
  } catch (error) {
    return {
      success: false,
      error: getApiError(error, 'Failed to load addresses.'),
    };
  }
}

async function addUserAddress(address: AddressFormState & { label: string }): Promise<{ success: true; addresses: SavedAddress[] } | { success: false; error: string }> {
  try {
    const response = await api.post('/users/addresses', address);
    return {
      success: true,
      addresses: Array.isArray(response.data?.data?.addresses) ? response.data.data.addresses : [],
    };
  } catch (error) {
    return {
      success: false,
      error: getApiError(error, 'Failed to save address.'),
    };
  }
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

function getAddressId(address?: SavedAddress | null) {
  return address?._id || address?.id || null;
}

function formatAddressType(type?: AddressType) {
  if (type === 'work') return 'Work';
  if (type === 'other') return 'Other';
  return 'Home';
}

function detectCountry(postalCode: string) {
  const value = postalCode.trim();
  if (/^\d{6}$/.test(value)) return 'IN';
  if (/^\d{5}(-\d{4})?$/.test(value)) return 'US';
  if (/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value)) return 'CA';
  return '';
}

function getNextCountry(currentCountry: string) {
  const countryOrder = ['', 'CA', 'US', 'IN', 'UK', 'AU'];
  const currentIndex = countryOrder.indexOf(currentCountry);
  return countryOrder[(currentIndex + 1) % countryOrder.length];
}

function getCountryLabel(country: string) {
  const countries: Record<string, string> = {
    CA: 'Canada',
    US: 'United States',
    IN: 'India',
    UK: 'United Kingdom',
    AU: 'Australia',
  };

  return countries[country] || '';
}

function getApiError(error: unknown, fallback: string) {
  const maybeError = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
  return maybeError.response?.data?.message || maybeError.response?.data?.error || maybeError.message || fallback;
}

function getMealCostForPlan(planId: PlanId, biweeklyMealCost: number, deliveryCount: number) {
  const multiplier = planId === 'monthly' ? 2 : 1;
  const subtotal = biweeklyMealCost * multiplier;
  const deliveryFee = calculateDeliveryFee(planId, deliveryCount || 2);
  const serviceFee = roundMoney(subtotal * SERVICE_FEE_PERCENTAGE);
  const tax = roundMoney(subtotal * DEFAULT_TAX_RATE);
  const platformCommission = roundMoney((subtotal + serviceFee + tax) * PLATFORM_COMMISSION_PERCENTAGE);
  const total = roundMoney(subtotal + deliveryFee + serviceFee + tax + platformCommission);

  return {
    subtotal: roundMoney(subtotal),
    deliveryFee: roundMoney(deliveryFee),
    serviceFee,
    tax,
    platformCommission,
    total,
  };
}

function calculateDeliveryFee(planId: PlanId, totalDeliveries: number) {
  const multiplier = totalDeliveries > 1 ? totalDeliveries : planId === 'monthly' ? 4 : 2;
  return DEFAULT_DELIVERY_FEE * multiplier;
}

function getActualDeliveryCount(getMealItems: (day: DayId, mealType: MealType) => PlannedMealItem[]) {
  return calendarDayOrder.reduce((total, day) => (
    total + mealTypes.reduce((mealTotal, mealType) => (
      mealTotal + (getMealItems(day, mealType.id).length > 0 ? 1 : 0)
    ), 0)
  ), 0);
}

function getPlanDurationText(planId: PlanId) {
  return planId === 'monthly' ? '1 Month' : 'Biweekly';
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  content: {
    paddingTop: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
  },
  header: {
    height: 56,
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.gray[900],
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[3],
  },
  sectionTitle: {
    color: theme.colors.gray[900],
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: 6,
    color: theme.colors.gray[600],
    fontSize: 13,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.white,
  },
  loadingText: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
  },
  heroBand: {
    backgroundColor: theme.colors.brand.grubRed,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[5],
    alignItems: 'center',
  },
  backButton: {
    minHeight: 34,
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
  heroTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  heroCopy: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  introBlock: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[5],
    alignItems: 'center',
  },
  introTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  introCopy: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.base,
    textAlign: 'center',
  },
  breakdownCard: {
    marginTop: theme.spacing[5],
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadow.sm,
  },
  breakdownHeader: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  breakdownTitle: {
    color: theme.colors.gray[900],
    fontSize: 15,
    fontWeight: '700',
  },
  breakdownSubtitle: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing[1],
  },
  breakdownBody: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  costRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costLabel: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
  },
  costValue: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  receiptDivider: {
    borderTopWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#E5E7EB',
    marginVertical: theme.spacing[3],
  },
  totalRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  totalValue: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  planList: {
    gap: theme.spacing[4],
  },
  planCard: {
    position: 'relative',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  planCardInactive: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  planCardActive: {
    borderColor: theme.colors.brand.grubRed,
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  popularPill: {
    position: 'absolute',
    top: -13,
    alignSelf: 'center',
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.brand.grubRed,
  },
  popularPillText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
  },
  planTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  radio: {
    width: 28,
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterActive: {
    borderColor: theme.colors.brand.grubRed,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.brand.grubRed,
  },
  planName: {
    color: theme.colors.gray[900],
    fontSize: 16,
    fontWeight: '800',
  },
  planNameInactive: {
    color: theme.colors.gray[800],
  },
  planDescription: {
    marginTop: 4,
    color: theme.colors.gray[600],
    fontSize: 12,
    fontWeight: '500',
  },
  planDescriptionInactive: {
    color: theme.colors.gray[600],
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing[2],
    marginTop: theme.spacing[3],
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  planPriceBlue: {
    color: theme.colors.blue[700],
  },
  planPriceBrand: {
    color: theme.colors.brand.grubRed,
  },
  planPeriod: {
    color: theme.colors.gray[600],
    fontSize: 12,
    fontWeight: '500',
  },
  featureList: {
    gap: 8,
    marginTop: theme.spacing[3],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureCheck: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  featureCheckBlue: {
    color: theme.colors.blue[600],
  },
  featureCheckBrand: {
    color: theme.colors.brand.grubRed,
  },
  featureText: {
    flex: 1,
    color: theme.colors.gray[700],
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  featureTextInactive: {
    color: theme.colors.gray[700],
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    ...theme.shadow.md,
  },
  subscribeButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  subscribeButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '94%',
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
  },
  modalContent: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[8],
  },
  modalHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  modalTitle: {
    flex: 1,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: theme.colors.gray[400],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectedPlanPanel: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
    alignItems: 'center',
    backgroundColor: '#f4f7ff',
    marginBottom: theme.spacing[6],
  },
  selectedPlanLabel: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing[2],
  },
  selectedPlanName: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
  },
  selectedPlanPriceRow: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  selectedPlanPrice: {
    color: '#4f46e5',
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  selectedPlanPeriod: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    paddingBottom: theme.spacing[1],
  },
  selectedPlanNotice: {
    alignSelf: 'stretch',
    minHeight: 42,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[3],
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  selectedPlanNoticeText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: theme.spacing[7],
  },
  stepBlock: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircleActive: {
    width: 62,
    height: 62,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    ...theme.shadow.md,
  },
  stepCircleActiveText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  stepCircleInactive: {
    width: 62,
    height: 62,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    ...theme.shadow.md,
  },
  stepCircleInactiveText: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  stepLine: {
    width: 54,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray[300],
    marginTop: 29,
  },
  stepTitleActive: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
  },
  stepTitleInactive: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
  },
  stepCaption: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.xs,
    textAlign: 'center',
  },
  addressCard: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[4],
    ...theme.shadow.sm,
  },
  addressTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    marginBottom: theme.spacing[2],
  },
  addressSubtitle: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.base,
    marginBottom: theme.spacing[5],
  },
  quickOptionsBox: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: theme.radius.xl,
    backgroundColor: '#eff6ff',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  quickOptionsTitle: {
    color: '#1e3a8a',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[4],
  },
  quickOptionsButtons: {
    gap: theme.spacing[3],
  },
  locationButton: {
    minHeight: 54,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
    backgroundColor: '#2563eb',
    ...theme.shadow.md,
  },
  locationButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
  },
  addAddressButton: {
    minHeight: 54,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#60a5fa',
    backgroundColor: theme.colors.white,
  },
  addAddressButtonText: {
    color: '#1d4ed8',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
  },
  savedAddressTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    marginBottom: theme.spacing[4],
  },
  emptyAddressState: {
    minHeight: 190,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[5],
    backgroundColor: theme.colors.gray[50],
  },
  emptyPinCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[200],
    marginBottom: theme.spacing[3],
  },
  emptyPinText: {
    color: theme.colors.gray[400],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  emptyAddressText: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  firstAddressButton: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: '#2563eb',
  },
  firstAddressButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
    textAlign: 'center',
  },
  savedAddressList: {
    gap: theme.spacing[3],
  },
  savedAddressCard: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    padding: theme.spacing[4],
  },
  savedAddressCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  savedAddressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
  },
  savedAddressType: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  defaultPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.green[100],
  },
  defaultPillText: {
    color: theme.colors.green[800],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  savedAddressStreet: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  savedAddressMeta: {
    marginTop: theme.spacing[1],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
  },
  addressFormPanel: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing[4],
  },
  formTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    marginBottom: theme.spacing[6],
  },
  inputLabel: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
  },
  addressTypeRow: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  addressTypeButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  addressTypeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    ...theme.shadow.sm,
  },
  addressTypeText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  addressTypeTextActive: {
    color: '#1d4ed8',
  },
  inputWrap: {
    marginBottom: theme.spacing[5],
  },
  compactInputWrap: {
    flex: 1,
    minWidth: 0,
    marginBottom: theme.spacing[5],
  },
  inputGrid: {
    gap: theme.spacing[3],
  },
  textInput: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
  },
  countrySelect: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[5],
  },
  countrySelectText: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
  },
  placeholderText: {
    color: theme.colors.gray[400],
  },
  countryChevron: {
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  instructionsInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[5],
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  checkboxBoxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxCheck: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  checkboxLabel: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.base,
  },
  formError: {
    color: theme.colors.red[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[4],
  },
  formActionRow: {
    gap: theme.spacing[3],
  },
  cancelFormButton: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  cancelFormButtonText: {
    color: theme.colors.gray[800],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  saveAddressButton: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  saveAddressButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
  disabledButton: {
    opacity: 0.65,
  },
  modalFooter: {
    marginTop: theme.spacing[6],
    gap: theme.spacing[3],
  },
  modalBackButton: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.colors.white,
  },
  modalBackButtonText: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  disabledPaymentButton: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.colors.gray[300],
  },
  disabledPaymentText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  enabledPaymentButton: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: '#2563eb',
  },
  enabledPaymentText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  pressed: {
    opacity: 0.84,
  },
});
