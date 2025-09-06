import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo';
import FollowUsSection from '../components/contact/FollowUsSection';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-grub-red to-red-700 py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Get in Touch
              </h1>
              <p className="text-xl sm:text-2xl text-red-100 max-w-3xl mx-auto">
                Have questions about our meal subscription service? We'd love to hear from you!
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* First Row: Contact Form (left) + Contact Info & Find Us (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
              {/* Contact Form - Left Side */}
              <div className="order-1 lg:order-1">
                <ContactForm />
              </div>
              
              {/* Contact Information & Find Us - Right Side */}
              <div className="order-2 lg:order-2">
                <ContactInfo />
              </div>
            </div>
            
            {/* Second Row: Follow Us - Full Width */}
            <div className="w-full">
              <FollowUsSection />
            </div>
          </div>
        </section>
      </main>
     
    </div>
  );
};

export default Contact;
