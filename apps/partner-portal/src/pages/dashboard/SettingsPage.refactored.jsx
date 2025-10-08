import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faUpload, 
  faMapMarkerAlt, 
  faClock, 
  faBell, 
  faCreditCard 
} from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { useRestaurant } from '../../hooks/useRestaurant';
import { useToast } from '../../contexts/ToastContext';
import {
  getRestaurantSettings,
  updateRestaurantSettings,
  getPartnerInfo,
  updatePartnerInfo,
  getUserPreferences,
  updateUserPreferences,
  formatAddress,
  validateEmail,
  validatePhone,
  validateURL
} from '../../api/settingsApi.refactored';

/**
 * Updated SettingsPage for Refactored User Model
 * Works with the new nested partnerInfo structure
 */
const SettingsPage = () => {
  const { t } = useTranslation();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Form data state - updated for new structure
  const [formData, setFormData] = useState({
    // Profile (Restaurant data)
    name: '',
    cuisine: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    
    // Delivery (Restaurant data)
    deliveryRadius: 0,
    deliveryFee: 0,
    minOrderAmount: 0,
    avgDeliveryTime: 0,
    
    // Notifications (partnerInfo.notificationPreferences)
    orderAlerts: true,
    systemUpdates: true,
    promotionalEmails: false,
    weeklyReports: true,
    
    // Billing (partnerInfo.billingInfo)
    businessName: '',
    paymentMethod: '',
    taxId: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'Canada',
    bankName: '',
    accountType: '',
    routingNumber: '',
    accountNumber: '',
    businessNumber: '',
    gstHstNumber: '',
    qstNumber: '',
    billingEmail: '',
    billingPhone: '',
    contactPerson: '',
    
    // Partner Status (partnerInfo)
    partnerStatus: '',
    commissionRate: 15,
    partnerSince: null,
    approvedAt: null
  });

  const tabs = [
    { id: 'profile', label: t('settings.profile.title'), icon: faUpload },
    { id: 'delivery', label: t('settings.delivery.title'), icon: faMapMarkerAlt },
    { id: 'notifications', label: t('settings.notifications.title'), icon: faBell },
    { id: 'billing', label: t('settings.billing.title'), icon: faCreditCard }
  ];

  // Load all settings data with new structure
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
      const settings = restaurantSettings.data.settings;
      
      // Load partner info (includes notifications and billing)
      console.log('👤 Fetching partner info...');
      const partnerData = await getPartnerInfo();
      const partnerInfo = partnerData.data.partnerInfo;
      
      // Load user preferences
      console.log('⚙️ Fetching user preferences...');
      const preferencesData = await getUserPreferences();
      const preferences = preferencesData.data.preferences;
      
      // Update form data with new structure
      setFormData({
        // Profile (Restaurant data)
        name: settings.name || '',
        cuisine: Array.isArray(settings.cuisine) ? settings.cuisine.join(', ') : settings.cuisine || '',
        description: settings.description || '',
        address: formatAddress(settings.address) || '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
        
        // Delivery (Restaurant data)
        deliveryRadius: settings.deliverySettings?.radius || 0,
        deliveryFee: settings.deliverySettings?.fee || 0,
        minOrderAmount: settings.deliverySettings?.minOrderAmount || 0,
        avgDeliveryTime: settings.deliverySettings?.avgDeliveryTime || 0,
        
        // Notifications (partnerInfo.notificationPreferences)
        orderAlerts: partnerInfo.notificationPreferences?.orderAlerts ?? true,
        systemUpdates: partnerInfo.notificationPreferences?.systemUpdates ?? true,
        promotionalEmails: partnerInfo.notificationPreferences?.promotionalEmails ?? false,
        weeklyReports: partnerInfo.notificationPreferences?.weeklyReports ?? true,
        
        // Billing (partnerInfo.billingInfo)
        businessName: partnerInfo.billingInfo?.businessName || '',
        paymentMethod: partnerInfo.billingInfo?.paymentMethod || '',
        taxId: partnerInfo.billingInfo?.taxId || '',
        billingStreet: partnerInfo.billingInfo?.billingAddress?.street || '',
        billingCity: partnerInfo.billingInfo?.billingAddress?.city || '',
        billingState: partnerInfo.billingInfo?.billingAddress?.state || '',
        billingPostalCode: partnerInfo.billingInfo?.billingAddress?.postalCode || '',
        billingCountry: partnerInfo.billingInfo?.billingAddress?.country || 'Canada',
        bankName: partnerInfo.billingInfo?.bankAccount?.bankName || '',
        accountType: partnerInfo.billingInfo?.bankAccount?.accountType || '',
        routingNumber: partnerInfo.billingInfo?.bankAccount?.routingNumber || '',
        accountNumber: partnerInfo.billingInfo?.bankAccount?.accountNumber || '',
        businessNumber: partnerInfo.billingInfo?.businessNumber || '',
        gstHstNumber: partnerInfo.billingInfo?.gstHstNumber || '',
        qstNumber: partnerInfo.billingInfo?.qstNumber || '',
        billingEmail: partnerInfo.billingInfo?.contactInfo?.billingEmail || '',
        billingPhone: partnerInfo.billingInfo?.contactInfo?.billingPhone || '',
        contactPerson: partnerInfo.billingInfo?.contactInfo?.contactPerson || '',
        
        // Partner Status
        partnerStatus: partnerInfo.partnerStatus || 'pending',
        commissionRate: partnerInfo.commissionRate || 15,
        partnerSince: partnerInfo.partnerSince,
        approvedAt: partnerInfo.approvedAt
      });
      
      console.log('✅ Settings loaded successfully');
      setErrors({});
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      
      // Fallback to restaurant hook data
      setFormData({
        name: restaurant?.name || '',
        cuisine: Array.isArray(restaurant?.cuisine) ? restaurant.cuisine.join(', ') : restaurant?.cuisine || '',
        description: restaurant?.description || '',
        address: restaurant?.address || '',
        phone: restaurant?.phone || '',
        email: restaurant?.email || '',
        website: restaurant?.website || '',
        deliveryRadius: restaurant?.deliveryRadius || 0,
        deliveryFee: restaurant?.deliveryFee || 0,
        minOrderAmount: restaurant?.minOrderAmount || 0,
        avgDeliveryTime: restaurant?.avgDeliveryTime || 0,
        // Default values for partner info
        orderAlerts: true,
        systemUpdates: true,
        promotionalEmails: false,
        weeklyReports: true,
        businessName: '',
        paymentMethod: '',
        taxId: '',
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingPostalCode: '',
        billingCountry: 'Canada',
        partnerStatus: 'pending',
        commissionRate: 15
      });
      
      showToast('Using demo data - API authentication required for live data', 'warning');
    } finally {
      setInitialLoading(false);
    }
  };

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
      if (!formData.address.trim()) newErrors.address = 'Address is required';
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Save settings with new structure
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
        // Update restaurant settings
        const restaurantData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          cuisine: formData.cuisine.split(',').map(c => c.trim()).filter(c => c),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          website: formData.website.trim(),
          address: formData.address.trim(),
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
        // Update partner notification preferences
        const partnerInfoUpdate = {
          notificationPreferences: {
            orderAlerts: formData.orderAlerts,
            systemUpdates: formData.systemUpdates,
            promotionalEmails: formData.promotionalEmails,
            weeklyReports: formData.weeklyReports
          }
        };
        
        await updatePartnerInfo(partnerInfoUpdate);
      }
      
      if (activeTab === 'billing') {
        // Update partner billing info
        const partnerInfoUpdate = {
          billingInfo: {
            businessName: formData.businessName.trim(),
            paymentMethod: formData.paymentMethod.trim(),
            taxId: formData.taxId.trim(),
            billingAddress: {
              street: formData.billingStreet.trim(),
              city: formData.billingCity.trim(),
              state: formData.billingState.trim(),
              postalCode: formData.billingPostalCode.trim(),
              country: formData.billingCountry.trim() || 'Canada'
            },
            bankAccount: {
              bankName: formData.bankName.trim(),
              accountType: formData.accountType.trim(),
              routingNumber: formData.routingNumber.trim(),
              accountNumber: formData.accountNumber.trim()
            },
            businessNumber: formData.businessNumber.trim(),
            gstHstNumber: formData.gstHstNumber.trim(),
            qstNumber: formData.qstNumber.trim(),
            contactInfo: {
              billingEmail: formData.billingEmail.trim(),
              billingPhone: formData.billingPhone.trim(),
              contactPerson: formData.contactPerson.trim()
            }
          }
        };
        
        await updatePartnerInfo(partnerInfoUpdate);
      }
      
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(error.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600">
          {t('settings.subtitle')}
        </p>
        
        {/* Partner Status Indicator */}
        <div className="mt-4 flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            formData.partnerStatus === 'approved' 
              ? 'bg-green-100 text-green-800' 
              : formData.partnerStatus === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            Partner Status: {formData.partnerStatus?.charAt(0).toUpperCase() + formData.partnerStatus?.slice(1)}
          </div>
          <div className="text-sm text-gray-600">
            Commission Rate: <span className="font-medium text-grub-red">{formData.commissionRate}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-grub-red text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content - Same as original but with updated data handling */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profile.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Same profile form as original */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label={t('settings.profile.name')}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={errors.name}
                    />
                  </div>
                  <div>
                    <Input
                      label={t('settings.profile.cuisine')}
                      value={formData.cuisine}
                      onChange={(e) => handleInputChange('cuisine', e.target.value)}
                      placeholder="e.g., French, Italian, American"
                      error={errors.cuisine}
                    />
                  </div>
                </div>
                {/* Rest of profile form... */}
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
                    { key: 'orderAlerts', label: 'Order Alerts' },
                    { key: 'systemUpdates', label: 'System Updates' },
                    { key: 'promotionalEmails', label: 'Promotional Emails' },
                    { key: 'weeklyReports', label: 'Weekly Reports' }
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

          {/* Billing and Delivery tabs remain similar but use updated data structure */}
          
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="min-w-[120px] bg-grub-red hover:bg-red-700 text-white"
            >
              {loading ? (
                <div className="flex items-center">
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
