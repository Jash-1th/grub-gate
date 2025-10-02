import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Upload, MapPin, Clock, Bell, CreditCard } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';
import { mockRestaurant } from '../../lib/mock-data.js';

const SettingsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: t('settings.profile.title'), icon: Upload },
    { id: 'delivery', label: t('settings.delivery.title'), icon: MapPin },
    { id: 'notifications', label: t('settings.notifications.title'), icon: Bell },
    { id: 'billing', label: t('settings.billing.title'), icon: CreditCard }
  ];

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
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
                      <Icon className="h-5 w-5 mr-3" />
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
                <CardTitle>{t('settings.profile.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('settings.profile.name')}
                    defaultValue={mockRestaurant.name}
                  />
                  <Input
                    label={t('settings.profile.cuisine')}
                    defaultValue={mockRestaurant.cuisine}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('settings.profile.description')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red"
                    rows={4}
                    defaultValue={mockRestaurant.description}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('settings.profile.address')}
                    defaultValue={mockRestaurant.address}
                  />
                  <Input
                    label={t('settings.profile.phone')}
                    defaultValue={mockRestaurant.phone}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('settings.profile.email')}
                    defaultValue={mockRestaurant.email}
                  />
                  <Input
                    label={t('settings.profile.website')}
                    defaultValue={mockRestaurant.website}
                  />
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
                  <Input
                    label={t('settings.delivery.deliveryRadius')}
                    type="number"
                    defaultValue={mockRestaurant.deliveryRadius}
                  />
                  <Input
                    label={t('settings.delivery.deliveryFee')}
                    type="number"
                    step="0.01"
                    defaultValue={mockRestaurant.deliveryFee}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('settings.delivery.minOrderAmount')}
                    type="number"
                    step="0.01"
                    defaultValue={mockRestaurant.minOrderAmount}
                  />
                  <Input
                    label={t('settings.delivery.deliveryTime')}
                    type="number"
                    defaultValue={mockRestaurant.avgDeliveryTime}
                  />
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
                        defaultChecked
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('settings.billing.paymentMethod')}
                    defaultValue="Visa ending in 4242"
                  />
                  <Input
                    label={t('settings.billing.taxId')}
                    defaultValue="12-3456789"
                  />
                </div>
                <div>
                  <Input
                    label={t('settings.billing.billingAddress')}
                    defaultValue={mockRestaurant.address}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {t('settings.billing.commissionRate')}
                    </span>
                    <span className="text-lg font-bold text-grub-red">
                      {mockRestaurant.commissionRate}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This rate is set by GrubGate and cannot be changed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              loading={loading}
              className="min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;





