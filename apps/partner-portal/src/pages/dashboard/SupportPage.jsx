import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, 
  faCommentDots, 
  faBook, 
  faPlay, 
  faCheckCircle,
  faSearch,
  faEnvelope,
  faPhone,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';

const SupportPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = [
    { value: 'all', label: 'All Topics' },
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'menu-management', label: 'Menu Management' },
    { value: 'orders', label: 'Orders & Delivery' },
    { value: 'payments', label: 'Payments & Billing' },
    { value: 'account', label: 'Account Settings' }
  ];

  const faqItems = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I add my first menu item?',
      answer: 'To add your first menu item, go to the Menu Management section and click "Add Menu Item". Fill in the required information including name, description, price, and category.'
    },
    {
      id: 2,
      category: 'menu-management',
      question: 'Can I update my menu items anytime?',
      answer: 'Yes, you can update your menu items at any time. Simply go to Menu Management, find the item you want to edit, and click the edit button.'
    },
    {
      id: 3,
      category: 'orders',
      question: 'How do I handle order notifications?',
      answer: 'Order notifications are sent automatically when a new order is placed. You can also enable SMS notifications in your account settings for instant alerts.'
    },
    {
      id: 4,
      category: 'payments',
      question: 'When do I receive payments?',
      answer: 'Payments are processed weekly and deposited into your account every Friday. You can view your payment history in the Analytics section.'
    },
    {
      id: 5,
      category: 'account',
      question: 'How do I change my restaurant information?',
      answer: 'You can update your restaurant information in the Settings section. Changes to basic information are updated immediately, while address changes may require verification.'
    }
  ];

  const filteredFaqs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const supportOptions = [
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: faCommentDots,
      action: 'contact'
    },
    {
      title: 'Documentation',
      description: 'Browse our comprehensive guides',
      icon: faBook,
      action: 'docs'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials',
      icon: faPlay,
      action: 'tutorials'
    },
    {
      title: 'System Status',
      description: 'Check platform status and updates',
      icon: faCheckCircle,
      action: 'status'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('support.title')}
        </h1>
        <p className="text-gray-600">
          {t('support.subtitle')}
        </p>
      </div>

      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-grub-red/10 rounded-full mb-4">
                  <FontAwesomeIcon icon={Icon} className="h-6 w-6 text-grub-red" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Support</p>
                <p className="text-sm text-gray-600">support@grubgate.com</p>
                <p className="text-xs text-gray-500">Response within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full">
                <FontAwesomeIcon icon={faPhone} className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Phone Support</p>
                <p className="text-sm text-gray-600">+1 (514) 555-0123</p>
                <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Live Chat</p>
                <p className="text-sm text-gray-600">Available 24/7</p>
                <p className="text-xs text-gray-500">Instant support</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('support.faq')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search FAQ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grub-red focus:border-grub-red"
                >
                  {faqCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;






