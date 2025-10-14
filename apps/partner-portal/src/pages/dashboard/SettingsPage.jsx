import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faUpload, 
  faMapMarkerAlt, 
  faClock, 
  faBell, 
  faCreditCard,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { useRestaurant } from '../../hooks/useRestaurant';
import { useToast } from '../../contexts/ToastContext';
import EnhancedAddressForm from '../../components/address/EnhancedAddressForm';
import {
  getRestaurantSettings,
  updateRestaurantSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
  getBillingInfo,
  updateBillingInfo,
  formatAddress,
  validateEmail,
  validatePhone,
  validateURL
} from '../../api/settingsApi';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Form data state
  const [formData, setFormData] = useState({
    // Profile
    name: '',
    cuisine: '',
    description: '',
    // Enhanced address fields
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    coordinates: null,
    formattedAddress: '',
    // Legacy address field for backward compatibility
    address: '',
    phone: '',
    email: '',
    website: '',
    
    // Delivery
    deliveryRadius: 0,
    deliveryFee: 0,
    minOrderAmount: 0,
    avgDeliveryTime: 0,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    orderAlerts: true,
    customerMessages: true,
    systemUpdates: true,
    
    // Billing
    paymentMethod: '',
    taxId: '',
    billingAddress: ''
  });

  const tabs = [
    { id: 'profile', label: t('settings.profile.title'), icon: faUpload },
    { id: 'delivery', label: t('settings.delivery.title'), icon: faMapMarkerAlt },
    { id: 'notifications', label: t('settings.notifications.title'), icon: faBell },
    { id: 'billing', label: t('settings.billing.title'), icon: faCreditCard }
  ];

  // Load all settings data
  const loadSettings = async () => {
    if (!restaurant?.id) {
      console.log('🔍 No restaurant ID available:', restaurant);
      return;
    }
    
    console.log('📡 Loading settings for restaurant:', restaurant.id);
    
    try {
      setInitialLoading(true);
      
      // Load restaurant settings
      console.log('📋 Fetching restaurant settings...');
      const restaurantSettings = await getRestaurantSettings(restaurant.id);
      console.log('📋 Restaurant settings response:', restaurantSettings);
      const settings = restaurantSettings.data.settings;
      
      // Load notification preferences
      console.log('🔔 Fetching notification preferences...');
      const notificationPrefs = await getNotificationPreferences();
      console.log('🔔 Notification preferences response:', notificationPrefs);
      const preferences = notificationPrefs.data.preferences;
      
      // Load billing info
      console.log('💳 Fetching billing info...');
      const billingData = await getBillingInfo();
      console.log('💳 Billing info response:', billingData);
      const billingInfo = billingData.data.billingInfo;
      
      // Parse address data (support both legacy and enhanced formats)
      const addressData = settings.address || {};
      const isEnhancedAddress = addressData.street || addressData.city || addressData.country;
      
      // Update form data
      setFormData({
        // Profile
        name: settings.name || '',
        cuisine: Array.isArray(settings.cuisine) ? settings.cuisine.join(', ') : settings.cuisine || '',
        description: settings.description || '',
        // Enhanced address fields
        street: isEnhancedAddress ? (addressData.street || '') : '',
        city: isEnhancedAddress ? (addressData.city || '') : '',
        province: isEnhancedAddress ? (addressData.province || addressData.state || '') : '',
        postalCode: isEnhancedAddress ? (addressData.postalCode || '') : '',
        country: isEnhancedAddress ? (addressData.country || '') : '',
        coordinates: isEnhancedAddress ? (addressData.coordinates || null) : null,
        formattedAddress: isEnhancedAddress ? (addressData.formattedAddress || '') : '',
        // Legacy address field for backward compatibility
        address: !isEnhancedAddress ? (formatAddress(settings.address) || '') : '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
        
        // Delivery
        deliveryRadius: settings.deliverySettings?.radius || 0,
        deliveryFee: settings.deliverySettings?.fee || 0,
        minOrderAmount: settings.deliverySettings?.minOrderAmount || 0,
        avgDeliveryTime: settings.deliverySettings?.avgDeliveryTime || 0,
        
        // Notifications
        emailNotifications: preferences.emailNotifications ?? true,
        smsNotifications: preferences.smsNotifications ?? true,
        orderAlerts: preferences.orderAlerts ?? true,
        customerMessages: preferences.customerMessages ?? true,
        systemUpdates: preferences.systemUpdates ?? true,
        
        // Billing - Restaurant billing information
        businessName: billingInfo.businessName || '',
        billingStreet: billingInfo.billingAddress?.street || '',
        billingCity: billingInfo.billingAddress?.city || '',
        billingProvince: billingInfo.billingAddress?.province || '',
        billingPostalCode: billingInfo.billingAddress?.postalCode || '',
        billingCountry: billingInfo.billingAddress?.country || 'Canada',
        paymentMethod: billingInfo.paymentMethod || '',
        bankName: billingInfo.bankAccountInfo?.bankName || '',
        accountType: billingInfo.bankAccountInfo?.accountType || '',
        routingNumber: billingInfo.bankAccountInfo?.routingNumber || '',
        accountNumber: billingInfo.bankAccountInfo?.accountNumber || '',
        businessNumber: billingInfo.taxInfo?.businessNumber || '',
        gstHstNumber: billingInfo.taxInfo?.gstHstNumber || '',
        qstNumber: billingInfo.taxInfo?.qstNumber || '',
        billingEmail: billingInfo.contactInfo?.billingEmail || '',
        billingPhone: billingInfo.contactInfo?.billingPhone || '',
        contactPerson: billingInfo.contactInfo?.contactPerson || ''
      });
      
      console.log('✅ Settings loaded successfully');
      setErrors({});
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      console.log('📄 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If API calls fail, use fallback data from restaurant hook
      console.log('🔄 Using fallback data from restaurant hook...');
      
      // Parse restaurant address data (support both legacy and enhanced formats)
      const restaurantAddressData = restaurant?.address || {};
      const isRestaurantEnhancedAddress = restaurantAddressData.street || restaurantAddressData.city || restaurantAddressData.country;
      
      setFormData({
        // Profile - Use restaurant hook data as fallback
        name: restaurant?.name || '',
        cuisine: Array.isArray(restaurant?.cuisine) ? restaurant.cuisine.join(', ') : restaurant?.cuisine || '',
        description: restaurant?.description || '',
        // Enhanced address fields
        street: isRestaurantEnhancedAddress ? (restaurantAddressData.street || '') : '',
        city: isRestaurantEnhancedAddress ? (restaurantAddressData.city || '') : '',
        province: isRestaurantEnhancedAddress ? (restaurantAddressData.province || restaurantAddressData.state || '') : '',
        postalCode: isRestaurantEnhancedAddress ? (restaurantAddressData.postalCode || '') : '',
        country: isRestaurantEnhancedAddress ? (restaurantAddressData.country || '') : '',
        coordinates: isRestaurantEnhancedAddress ? (restaurantAddressData.coordinates || null) : null,
        formattedAddress: isRestaurantEnhancedAddress ? (restaurantAddressData.formattedAddress || '') : '',
        // Legacy address field for backward compatibility
        address: !isRestaurantEnhancedAddress ? (restaurant?.address || '') : '',
        phone: restaurant?.phone || '',
        email: restaurant?.email || '',
        website: restaurant?.website || '',
        
        // Delivery - Use restaurant hook data as fallback
        deliveryRadius: restaurant?.deliveryRadius || 0,
        deliveryFee: restaurant?.deliveryFee || 0,
        minOrderAmount: restaurant?.minOrderAmount || 0,
        avgDeliveryTime: restaurant?.avgDeliveryTime || 0,
        
        // Notifications - Use defaults
        emailNotifications: true,
        smsNotifications: true,
        orderAlerts: true,
        customerMessages: true,
        systemUpdates: true,
        
        // Billing - Use defaults
        paymentMethod: '',
        taxId: '',
        billingAddress: ''
      });
      
      showToast('Using demo data - API authentication required for live data', 'warning');
    } finally {
      setInitialLoading(false);
    }
  };

  // Load settings when restaurant is available
  useEffect(() => {
    loadSettings();
  }, [restaurant?.id]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (activeTab === 'profile') {
      if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
      if (!formData.cuisine.trim()) newErrors.cuisine = 'Cuisine is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      
      // Enhanced address validation
      const hasEnhancedAddress = formData.street || formData.city || formData.country;
      const hasLegacyAddress = formData.address && formData.address.trim();
      
      if (hasEnhancedAddress) {
        // Validate enhanced address fields
        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.province.trim()) newErrors.province = 'Province/State is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
      } else if (!hasLegacyAddress) {
        // Require at least legacy address if no enhanced address
        newErrors.address = 'Address is required';
      }
      
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      else if (!validatePhone(formData.phone)) newErrors.phone = 'Invalid phone format';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
      if (formData.website && !validateURL(formData.website)) newErrors.website = 'Invalid website URL';
    }
    
    if (activeTab === 'delivery') {
      if (formData.deliveryRadius <= 0) newErrors.deliveryRadius = 'Delivery radius must be greater than 0';
      if (formData.deliveryFee < 0) newErrors.deliveryFee = 'Delivery fee cannot be negative';
      if (formData.minOrderAmount < 0) newErrors.minOrderAmount = 'Minimum order amount cannot be negative';
      if (formData.avgDeliveryTime <= 0) newErrors.avgDeliveryTime = 'Delivery time must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Real-time field validation on blur
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    // Address field validation
    if (field === 'street' && !value.trim()) {
      newErrors.street = 'Street address is required';
    } else if (field === 'city' && !value.trim()) {
      newErrors.city = 'City is required';
    } else if (field === 'province' && !value.trim()) {
      newErrors.province = 'Province/State is required';
    } else if (field === 'postalCode' && !value.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (field === 'country' && !value.trim()) {
      newErrors.country = 'Country is required';
    }
    // Other field validation
    else if (field === 'name' && !value.trim()) {
      newErrors.name = 'Restaurant name is required';
    } else if (field === 'cuisine' && !value.trim()) {
      newErrors.cuisine = 'Cuisine is required';
    } else if (field === 'description' && !value.trim()) {
      newErrors.description = 'Description is required';
    } else if (field === 'phone') {
      if (!value.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!validatePhone(value)) {
        newErrors.phone = 'Invalid phone format';
      }
    } else if (field === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(value)) {
        newErrors.email = 'Invalid email format';
      }
    } else if (field === 'website' && value && !validateURL(value)) {
      newErrors.website = 'Invalid website URL';
    }
    
    setErrors(newErrors);
  };

  // Helper function to migrate legacy address to enhanced format
  const migrateLegacyAddress = () => {
    if (formData.address && !formData.street && !formData.city) {
      // Simple parsing attempt for common address formats
      const addressParts = formData.address.split(',').map(part => part.trim());
      
      if (addressParts.length >= 2) {
        setFormData(prev => ({
          ...prev,
          street: addressParts[0] || '',
          city: addressParts[1] || '',
          province: addressParts[2] || '',
          postalCode: addressParts[3] || '',
          country: addressParts[4] || 'CA', // Default to Canada
          address: '' // Clear legacy address
        }));
        
        showToast('Address migrated to enhanced format. Please review and update as needed.', 'info');
      }
    }
  };

  // Save settings
  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }
    
    if (!restaurant?.id) {
      showToast('Restaurant not found', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      if (activeTab === 'profile' || activeTab === 'delivery') {
        // Prepare address data (enhanced or legacy format)
        const hasEnhancedAddress = formData.street || formData.city || formData.country;
        let addressData;
        
        if (hasEnhancedAddress) {
          // Use enhanced address format
          addressData = {
            street: formData.street.trim(),
            city: formData.city.trim(),
            province: formData.province.trim(),
            postalCode: formData.postalCode.trim(),
            country: formData.country.trim(),
            coordinates: formData.coordinates,
            formattedAddress: formData.formattedAddress || `${formData.street}, ${formData.city}, ${formData.province} ${formData.postalCode}, ${formData.country}`
          };
        } else {
          // Use legacy address format
          addressData = formData.address.trim();
        }

        // Update restaurant settings
        const restaurantData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          cuisine: formData.cuisine.split(',').map(c => c.trim()).filter(c => c),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          website: formData.website.trim(),
          address: addressData,
          deliverySettings: {
            radius: parseFloat(formData.deliveryRadius),
            fee: parseFloat(formData.deliveryFee),
            minOrderAmount: parseFloat(formData.minOrderAmount),
            avgDeliveryTime: parseInt(formData.avgDeliveryTime)
          }
        };
        
        await updateRestaurantSettings(restaurant.id, restaurantData);
      }
      
      if (activeTab === 'notifications') {
        // Update notification preferences
        const preferences = {
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
          orderAlerts: formData.orderAlerts,
          customerMessages: formData.customerMessages,
          systemUpdates: formData.systemUpdates
        };
        
        await updateNotificationPreferences(preferences);
      }
      
      if (activeTab === 'billing') {
        // Update comprehensive billing info
        const billingInfo = {
          businessName: formData.businessName.trim(),
          billingAddress: {
            street: formData.billingStreet.trim(),
            city: formData.billingCity.trim(),
            province: formData.billingProvince.trim(),
            postalCode: formData.billingPostalCode.trim(),
            country: formData.billingCountry.trim() || 'Canada'
          },
          paymentMethod: formData.paymentMethod.trim(),
          bankAccountInfo: {
            bankName: formData.bankName.trim(),
            accountType: formData.accountType.trim(),
            routingNumber: formData.routingNumber.trim(),
            accountNumber: formData.accountNumber.trim()
          },
          taxInfo: {
            businessNumber: formData.businessNumber.trim(),
            gstHstNumber: formData.gstHstNumber.trim(),
            qstNumber: formData.qstNumber.trim()
          },
          contactInfo: {
            billingEmail: formData.billingEmail.trim(),
            billingPhone: formData.billingPhone.trim(),
            contactPerson: formData.contactPerson.trim()
          }
        };
        
        await updateBillingInfo(billingInfo);
      }
      
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(error.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (restaurantLoading || initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t('settings.title')}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Mobile Tab Selector */}
        <div className="lg:hidden">
          <Card>
            <CardContent className="p-3">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const iconDef = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-grub-red text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FontAwesomeIcon icon={iconDef} className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t('settings.profile.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Input
                      label={t('settings.profile.name')}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={errors.name}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      label={t('settings.profile.cuisine')}
                      value={formData.cuisine}
                      onChange={(e) => handleInputChange('cuisine', e.target.value)}
                      placeholder="e.g., French, Italian, American"
                      error={errors.cuisine}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('settings.profile.description')}
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your restaurant..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                {/* Enhanced Address Form */}
                <div className="space-y-4">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-grub-red" />
                          Restaurant Address
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Enhanced address system with global support, automatic country detection, and coordinate validation for accurate deliveries.
                        </p>
                      </div>
                      {process.env.NODE_ENV === 'development' && (
                        <button
                          onClick={() => {
                            // Test validation by validating all address fields
                            validateField('street', formData.street || '');
                            validateField('city', formData.city || '');
                            validateField('province', formData.province || '');
                            validateField('postalCode', formData.postalCode || '');
                            validateField('country', formData.country || '');
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Test Validation
                        </button>
                      )}
                    </div>
                    <EnhancedAddressForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      errors={errors}
                      loading={loading}
                      showCountrySelection={true}
                      showCoordinateCapture={true}
                      onFieldBlur={validateField}
                    />
                  </div>
                  
                  {/* Legacy address fallback for existing data */}
                  {formData.address && !formData.street && !formData.city && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mt-1 mr-2" />
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">Legacy Address Format</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              Current address: <strong>{formData.address}</strong>
                            </p>
                            <p className="text-xs text-yellow-600 mt-2">
                              Please update to the enhanced address format above for better delivery accuracy.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={migrateLegacyAddress}
                          className="ml-4 text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                        >
                          Migrate Address
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Input
                      label={t('settings.profile.phone')}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      error={errors.phone}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      label={t('settings.profile.email')}
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={errors.email}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Input
                      label={t('settings.profile.website')}
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourrestaurant.com"
                      error={errors.website}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'delivery' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.delivery.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label={t('settings.delivery.deliveryRadius')}
                      type="number"
                      min="1"
                      max="50"
                      value={formData.deliveryRadius}
                      onChange={(e) => handleInputChange('deliveryRadius', e.target.value)}
                      error={errors.deliveryRadius}
                    />
                  </div>
                  <div>
                    <Input
                      label={t('settings.delivery.deliveryFee')}
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.deliveryFee}
                      onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                      error={errors.deliveryFee}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label={t('settings.delivery.minOrderAmount')}
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minOrderAmount}
                      onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                      error={errors.minOrderAmount}
                    />
                  </div>
                  <div>
                    <Input
                      label={t('settings.delivery.deliveryTime')}
                      type="number"
                      min="10"
                      max="120"
                      value={formData.avgDeliveryTime}
                      onChange={(e) => handleInputChange('avgDeliveryTime', e.target.value)}
                      error={errors.avgDeliveryTime}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: t('settings.notifications.emailNotifications') },
                    { key: 'smsNotifications', label: t('settings.notifications.smsNotifications') },
                    { key: 'orderAlerts', label: t('settings.notifications.orderAlerts') },
                    { key: 'customerMessages', label: t('settings.notifications.customerMessages') },
                    { key: 'systemUpdates', label: t('settings.notifications.systemUpdates') }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {setting.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={formData[setting.key]}
                        onChange={(e) => handleInputChange(setting.key, e.target.checked)}
                        className="h-4 w-4 text-grub-red focus:ring-grub-red border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.billing.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Business Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label="Business Name"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="ABC Restaurant Inc."
                      />
                    </div>
                    <div>
                      <Input
                        label="Payment Method"
                        value={formData.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        placeholder="Visa ending in 4242"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        label="Street Address"
                        value={formData.billingStreet}
                        onChange={(e) => handleInputChange('billingStreet', e.target.value)}
                        placeholder="789 Business Ave"
                      />
                    </div>
                    <div>
                      <Input
                        label="City"
                        value={formData.billingCity}
                        onChange={(e) => handleInputChange('billingCity', e.target.value)}
                        placeholder="Montreal"
                      />
                    </div>
                    <div>
                      <Input
                        label="Province"
                        value={formData.billingProvince}
                        onChange={(e) => handleInputChange('billingProvince', e.target.value)}
                        placeholder="QC"
                      />
                    </div>
                    <div>
                      <Input
                        label="Postal Code"
                        value={formData.billingPostalCode}
                        onChange={(e) => handleInputChange('billingPostalCode', e.target.value)}
                        placeholder="H3B 2Y7"
                      />
                    </div>
                    <div>
                      <Input
                        label="Country"
                        value={formData.billingCountry}
                        onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                        placeholder="Canada"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Account Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label="Bank Name"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        placeholder="Royal Bank of Canada"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <select
                        value={formData.accountType}
                        onChange={(e) => handleInputChange('accountType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red"
                      >
                        <option value="">Select account type</option>
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                    <div>
                      <Input
                        label="Routing Number"
                        value={formData.routingNumber}
                        onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                        placeholder="003000123"
                      />
                    </div>
                    <div>
                      <Input
                        label="Account Number"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        placeholder="1234567890123"
                      />
                    </div>
                  </div>
                </div>

                {/* Tax Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Input
                        label="Business Number"
                        value={formData.businessNumber}
                        onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                        placeholder="123456789RP0001"
                      />
                    </div>
                    <div>
                      <Input
                        label="GST/HST Number"
                        value={formData.gstHstNumber}
                        onChange={(e) => handleInputChange('gstHstNumber', e.target.value)}
                        placeholder="123456789RT0001"
                      />
                    </div>
                    <div>
                      <Input
                        label="QST Number"
                        value={formData.qstNumber}
                        onChange={(e) => handleInputChange('qstNumber', e.target.value)}
                        placeholder="1234567890TQ0001"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Input
                        label="Contact Person"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        placeholder="ABC Finance Manager"
                      />
                    </div>
                    <div>
                      <Input
                        label="Billing Email"
                        type="email"
                        value={formData.billingEmail}
                        onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                        placeholder="billing@abcrestaurant.com"
                      />
                    </div>
                    <div>
                      <Input
                        label="Billing Phone"
                        value={formData.billingPhone}
                        onChange={(e) => handleInputChange('billingPhone', e.target.value)}
                        placeholder="+15145551235"
                      />
                    </div>
                  </div>
                </div>

                {/* Commission Rate */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Commission Rate
                    </span>
                    <span className="text-lg font-bold text-grub-red">
                      15%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This rate is set by GrubGate and cannot be changed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full sm:w-auto min-w-[120px] bg-grub-red hover:bg-red-700 text-white text-sm sm:text-base py-2.5 sm:py-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                  {t('common.save')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;






