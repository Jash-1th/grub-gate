import { getEmailJsConfig } from '../config/env';
import emailjs from '@emailjs/browser';

// Initialize EmailJS with configuration
const { serviceId, templateId, publicKey } = getEmailJsConfig();

// Check if EmailJS is properly configured
const isEmailJsConfigured = () => {
  return serviceId && templateId && publicKey && 
         !serviceId.includes('dummy') && 
         !templateId.includes('dummy') && 
         !publicKey.includes('dummy');
};

// Send email using EmailJS
export const sendEmail = async (templateParams) => {
  if (!isEmailJsConfigured()) {
    console.error('EmailJS is not properly configured');
    return { 
      success: false, 
      message: 'Email service is not configured. Please check your environment variables.' 
    };
  }

  try {
    const result = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    
    return { 
      success: true, 
      message: 'Email sent successfully!',
      data: result 
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      message: 'Failed to send email. Please try again later.',
      error: error.message 
    };
  }
};

// Log EmailJS status in development
if (process.env.NODE_ENV === 'development') {
  console.log('EmailJS Status:', {
    isConfigured: isEmailJsConfigured(),
    serviceId: serviceId ? '***' + serviceId.slice(-4) : 'Not set',
    templateId: templateId ? '***' + templateId.slice(-4) : 'Not set',
    publicKey: publicKey ? '***' + publicKey.slice(-4) : 'Not set'
  });
}
