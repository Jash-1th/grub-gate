import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize Firebase and EmailJS on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically import Firebase and EmailJS only on client side
      Promise.all([
        import('firebase/firestore'),
        import('../../firebase'),
        import('emailjs-com')
      ]).then(([firestoreModule, firebaseModule, emailjsModule]) => {
        // Store references for use in handleSubmit
        window.firebaseModule = firebaseModule;
        window.firestoreModule = firestoreModule;
        window.emailjsModule = emailjsModule;
        
        // Initialize EmailJS
        emailjsModule.default.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
      }).catch(error => {
        console.error('Failed to load Firebase or EmailJS:', error);
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.validation.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('contact.form.validation.emailInvalid');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.validation.messageRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if modules are loaded
    if (!window.firebaseModule || !window.firestoreModule || !window.emailjsModule) {
      setErrorMessage(t('contact.form.errors.loading'));
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { collection, addDoc, serverTimestamp } = window.firestoreModule;
      const { db } = window.firebaseModule;
      const emailjs = window.emailjsModule.default;

      // Save to Firebase Firestore
      const submissionData = {
        ...formData,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'contactSubmissions'), submissionData);
      console.log('Document written with ID: ', docRef.id);

      // Send email via EmailJS
      const emailParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        reason: formData.reason || 'Not specified',
        message: formData.message,
        to_name: 'GrubGate Team'
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        emailParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      // Success - clear form and show success message
      setFormData({
        name: '',
        email: '',
        phone: '',
        reason: '',
        message: ''
      });
      setSuccessMessage(t('contact.form.success'));
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(t('contact.form.errors.submit'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8" style={{height:"930px"}}>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{color: '#800020'}}>
          {t('contact.formTitle')}
        </h2>
        <p className="text-gray-600">
          {t('contact.formSubtitle')}
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            {t('contact.form.nameLabel')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('contact.form.namePlaceholder')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('contact.form.emailLabel')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('contact.form.emailPlaceholder')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t('contact.form.phoneLabel')}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200"
            placeholder={t('contact.form.phonePlaceholder')}
          />
        </div>

        {/* Reason for Contact */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            {t('contact.form.reasonLabel')}
          </label>
          <select
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200"
          >
            <option value="">{t('contact.form.reasonPlaceholder')}</option>
            <option value="general">{t('contact.form.reasons.general')}</option>
            <option value="technical">{t('contact.form.reasons.technical')}</option>
            <option value="partnership">{t('contact.form.reasons.partnership')}</option>
            <option value="feedback">{t('contact.form.reasons.feedback')}</option>
          </select>
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            {t('contact.form.messageLabel')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-grub-red focus:border-grub-red transition-colors duration-200 resize-none ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('contact.form.messagePlaceholder')}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform transition-transform duration-200 ${
              loading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-grub-red text-white hover:bg-red-700 hover:-translate-y-1'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('contact.form.sending')}
              </div>
            ) : (
              t('contact.form.sendButton')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
