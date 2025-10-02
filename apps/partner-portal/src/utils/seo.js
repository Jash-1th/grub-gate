// SEO utilities for public pages
export const generateSEOMeta = (page, data = {}) => {
  const baseUrl = 'https://partners.grubgate.app'
  
  const seoData = {
    home: {
      title: 'GrubGate Partner Portal - Join Montreal\'s Leading Restaurant Network',
      description: 'Join Montreal\'s leading restaurant network and grow your business with predictable revenue through subscription meal plans. Partner with GrubGate today.',
      keywords: 'restaurant partners, Montreal restaurants, food delivery, subscription meals, restaurant business',
      ogTitle: 'GrubGate Partner Portal - Grow Your Restaurant Business',
      ogDescription: 'Join Montreal\'s leading restaurant network and grow your business with predictable revenue.',
      canonical: baseUrl
    },
    login: {
      title: 'Login - GrubGate Partner Portal',
      description: 'Sign in to your GrubGate partner dashboard to manage your restaurant, orders, and analytics.',
      keywords: 'partner login, restaurant dashboard, GrubGate login',
      ogTitle: 'Partner Login - GrubGate',
      ogDescription: 'Sign in to your GrubGate partner dashboard.',
      canonical: `${baseUrl}/login`
    },
    register: {
      title: 'Join GrubGate - Partner Registration',
      description: 'Register your restaurant with GrubGate and start growing your business with subscription meal plans.',
      keywords: 'restaurant registration, join GrubGate, partner signup, restaurant partnership',
      ogTitle: 'Join GrubGate - Partner Registration',
      ogDescription: 'Register your restaurant with GrubGate and start growing your business.',
      canonical: `${baseUrl}/register`
    },
    forgotPassword: {
      title: 'Reset Password - GrubGate Partner Portal',
      description: 'Reset your GrubGate partner account password to regain access to your dashboard.',
      keywords: 'reset password, forgot password, GrubGate partner',
      ogTitle: 'Reset Password - GrubGate Partner',
      ogDescription: 'Reset your GrubGate partner account password.',
      canonical: `${baseUrl}/forgot-password`
    }
  }

  return seoData[page] || seoData.home
}

export const generateStructuredData = (page, data = {}) => {
  const baseUrl = 'https://partners.grubgate.app'
  
  const structuredData = {
    home: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "GrubGate Partner Portal",
      "url": baseUrl,
      "logo": `${baseUrl}/icons/logo512.png`,
      "description": "Join Montreal's leading restaurant network and grow your business with predictable revenue through subscription meal plans.",
      "sameAs": [
        "https://facebook.com/grubgate",
        "https://instagram.com/grubgate",
        "https://twitter.com/grubgate"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-514-GRUBGATE",
        "contactType": "customer service",
        "areaServed": "CA",
        "availableLanguage": ["English", "French"]
      }
    }
  }

  return structuredData[page] || null
}





