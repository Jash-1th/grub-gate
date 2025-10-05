import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Mail from 'lucide-react/dist/esm/icons/mail';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import { Card, CardContent, CardHeader, CardTitle } from '@grub-gate/ui';

/**
 * AccordionItem Component
 * Individual FAQ item with expand/collapse functionality
 */
const AccordionItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-grub-red focus:ring-opacity-50 rounded-lg p-2 -m-2 hover:bg-gray-50 transition-colors"
          aria-expanded={isOpen}
        >
          <h3 className="text-lg font-semibold text-gray-900 pr-4">
            {question}
          </h3>
          <div className="flex-shrink-0 text-grub-red">
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </button>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0">
          <div className="prose prose-gray max-w-none">
            {typeof answer === 'string' ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {answer}
              </p>
            ) : (
              answer
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * FAQs Page Component
 * Displays frequently asked questions organized by categories
 */
const FaqsPage = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (itemId) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      // Close all others and open this one (accordion behavior)
      newOpenItems.clear();
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  // FAQ data organized by categories
  const faqCategories = [
    {
      title: t('faqs.categories.gettingStarted.title', 'Getting Started'),
      id: 'getting-started',
      faqs: [
        {
          id: 'how-to-join',
          question: t('faqs.categories.gettingStarted.howToJoin.question', 'How do I become a GrubGate partner?'),
          answer: t('faqs.categories.gettingStarted.howToJoin.answer', 
            `Getting started with GrubGate is simple:
            
            1. Click "Become a Partner" or "Join Us" to start your application
            2. Fill out our partner application form with your restaurant details
            3. Upload required documents (business license, menu, photos)
            4. Our team will review your application within 2-3 business days
            5. Once approved, we'll schedule an onboarding call to set up your account
            6. Start receiving orders and growing your business!
            
            The entire process typically takes 5-7 business days from application to going live.`
          )
        },
        {
          id: 'requirements',
          question: t('faqs.categories.gettingStarted.requirements.question', 'What are the requirements to join?'),
          answer: t('faqs.categories.gettingStarted.requirements.answer',
            `To become a GrubGate partner, you need:
            
            • Valid business license and food service permits
            • Physical restaurant location in Montreal
            • Ability to prepare subscription meal plans
            • Commitment to quality and food safety standards
            • Basic internet connection for order management
            • Staff available during operating hours
            
            We welcome restaurants of all sizes, from small local eateries to established chains.`
          )
        },
        {
          id: 'costs',
          question: t('faqs.categories.gettingStarted.costs.question', 'Are there any upfront costs or fees?'),
          answer: t('faqs.categories.gettingStarted.costs.answer',
            `GrubGate operates on a simple commission-based model:
            
            • No upfront fees or setup costs
            • No monthly subscription fees
            • We only take a small percentage of each completed order
            • Commission rates are competitive and transparent
            • You receive payments weekly via direct deposit
            
            We believe in your success - we only succeed when you do!`
          )
        }
      ]
    },
    {
      title: t('faqs.categories.orders.title', 'Orders & Operations'),
      id: 'orders',
      faqs: [
        {
          id: 'how-orders-work',
          question: t('faqs.categories.orders.howOrdersWork.question', 'How do orders work with subscription meal plans?'),
          answer: t('faqs.categories.orders.howOrdersWork.answer',
            `Our subscription model is designed for predictable business:
            
            • Customers subscribe to weekly meal plans
            • You receive orders at least 48 hours in advance
            • Orders are batched by delivery day for efficient preparation
            • Clear preparation schedules help with inventory planning
            • Customers can pause, modify, or cancel with proper notice
            
            This model provides steady, predictable revenue compared to traditional delivery.`
          )
        },
        {
          id: 'order-management',
          question: t('faqs.categories.orders.management.question', 'How do I manage orders through the platform?'),
          answer: t('faqs.categories.orders.management.answer',
            `Our partner dashboard makes order management simple:
            
            • View all upcoming orders in one place
            • Filter by delivery date, meal type, or customer
            • Mark orders as prepared when ready
            • Track order status and delivery updates
            • Access customer notes and special requests
            • Print preparation labels and packing slips
            
            You can access the dashboard on any device - computer, tablet, or smartphone.`
          )
        },
        {
          id: 'delivery',
          question: t('faqs.categories.orders.delivery.question', 'Who handles delivery to customers?'),
          answer: t('faqs.categories.orders.delivery.answer',
            `GrubGate handles all delivery logistics:
            
            • Our delivery team picks up prepared orders from your restaurant
            • You prepare meals according to the schedule we provide
            • Delivery windows are coordinated to maintain food quality
            • Customers are notified when their order is out for delivery
            • Any delivery issues are handled by our customer service team
            
            You focus on what you do best - creating delicious meals!`
          )
        }
      ]
    },
    {
      title: t('faqs.categories.payments.title', 'Payments & Pricing'),
      id: 'payments',
      faqs: [
        {
          id: 'payment-schedule',
          question: t('faqs.categories.payments.schedule.question', 'When and how do I get paid?'),
          answer: t('faqs.categories.payments.schedule.answer',
            `We offer reliable, weekly payments:
            
            • Payments are processed every Wednesday
            • You receive payment for orders delivered in the previous week
            • Direct deposit to your business bank account
            • Detailed payment reports available in your dashboard
            • No minimum payout thresholds
            
            For example, orders delivered Monday-Sunday are paid the following Wednesday.`
          )
        },
        {
          id: 'pricing-control',
          question: t('faqs.categories.payments.pricing.question', 'Can I set my own menu prices?'),
          answer: t('faqs.categories.payments.pricing.answer',
            `Yes, you have full control over your pricing:
            
            • Set your own prices for each menu item
            • Adjust prices anytime through your dashboard
            • Create special pricing for meal plans or bundles
            • Our system automatically calculates customer totals
            • You see exactly what you'll earn from each order
            
            We provide pricing suggestions based on market data, but the final decision is yours.`
          )
        },
        {
          id: 'commission-rates',
          question: t('faqs.categories.payments.commission.question', 'What are your commission rates?'),
          answer: t('faqs.categories.payments.commission.answer',
            `Our commission structure is transparent and competitive:
            
            • Commission rates vary by order volume and partnership level
            • Higher volume partners receive preferential rates
            • No hidden fees or surprise charges
            • All costs are clearly outlined in your partner agreement
            • Rate details will be discussed during your onboarding call
            
            Contact our partner team for specific rate information based on your restaurant's situation.`
          )
        }
      ]
    },
    {
      title: t('faqs.categories.support.title', 'Support & Help'),
      id: 'support',
      faqs: [
        {
          id: 'customer-service',
          question: t('faqs.categories.support.customerService.question', 'What kind of support do you provide?'),
          answer: t('faqs.categories.support.customerService.answer',
            `We provide comprehensive support to ensure your success:
            
            • Dedicated partner success manager
            • 24/7 technical support for urgent issues
            • Regular business reviews and optimization suggestions
            • Marketing support to help promote your restaurant
            • Training materials and best practices sharing
            • Direct phone and email support channels
            
            Our goal is to be a true partner in growing your business.`
          )
        },
        {
          id: 'technical-issues',
          question: t('faqs.categories.support.technical.question', 'What if I have technical problems with the platform?'),
          answer: t('faqs.categories.support.technical.answer',
            `Technical support is available when you need it:
            
            • Live chat support during business hours (9 AM - 9 PM)
            • Email support with response within 4 hours
            • Phone support for urgent issues
            • Step-by-step guides and video tutorials
            • Regular platform updates and improvements
            
            Most issues are resolved quickly, and we'll keep you updated throughout the process.`
          )
        },
        {
          id: 'contact-methods',
          question: t('faqs.categories.support.contact.question', 'How can I contact GrubGate support?'),
          answer: (
            <div className="space-y-4">
              <p className="text-gray-700">You can reach us through multiple channels:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-grub-red" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-sm text-gray-600">+1 (514) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-grub-red" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-gray-600">partners@grubgate.app</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Support hours: Monday-Friday 9 AM - 9 PM, Saturday-Sunday 10 AM - 6 PM EST
              </p>
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-grub-red rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t('faqs.title', 'Frequently Asked Questions')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('faqs.subtitle', 'Find answers to common questions about becoming a GrubGate partner and managing your restaurant business with us.')}
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {faqCategories.map((category) => (
          <div key={category.id} className="mb-12">
            {/* Category Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-grub-red pl-4">
              {category.title}
            </h2>

            {/* FAQ Items */}
            <div className="space-y-2">
              {category.faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openItems.has(faq.id)}
                  onToggle={() => toggleItem(faq.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <Card className="bg-gradient-to-r from-grub-red to-red-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              {t('faqs.stillHaveQuestions.title', 'Still have questions?')}
            </h3>
            <p className="text-red-100 mb-6">
              {t('faqs.stillHaveQuestions.subtitle', "Our partner success team is here to help you get started and grow your business.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:partners@grubgate.app"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-grub-red rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                <Mail className="h-5 w-5 mr-2" />
                {t('faqs.contact.email', 'Email Us')}
              </a>
              <a
                href="tel:+15141234567"
                className="inline-flex items-center justify-center px-6 py-3 bg-white bg-opacity-20 text-white border border-white rounded-lg hover:bg-opacity-30 transition-colors font-semibold"
              >
                <Phone className="h-5 w-5 mr-2" />
                {t('faqs.contact.phone', 'Call Us')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaqsPage;