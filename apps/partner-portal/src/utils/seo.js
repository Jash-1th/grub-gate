// SEO utilities for public pages
export const generateSEOMeta = (url, data = {}) => {
  const baseUrl = 'https://partners.grubgate.app'
  
  // Map URL paths to SEO data
  const getPageKey = (url) => {
    if (url === '/' || url === '') return 'home'
    if (url === '/login') return 'login'
    if (url === '/register') return 'register'
    if (url === '/forgot-password') return 'forgotPassword'
    if (url.startsWith('/dashboard')) return 'dashboard'
    return 'home'
  }
  
  const seoData = {
    home: {
      title: 'GrubGate Partner Portal - Join Montreal\'s Leading Restaurant Network',
      description: 'Join Montreal\'s leading restaurant network and grow your business with predictable revenue through subscription meal plans. Partner with GrubGate today.',
      keywords: 'restaurant partners, Montreal restaurants, food delivery, subscription meals, restaurant business',
      image: `${baseUrl}/icons/logo512.png`,
      canonical: baseUrl
    },
    login: {
      title: 'Login - GrubGate Partner Portal',
      description: 'Sign in to your GrubGate partner dashboard to manage your restaurant, orders, and analytics.',
      keywords: 'partner login, restaurant dashboard, GrubGate login',
      image: `${baseUrl}/icons/logo512.png`,
      canonical: `${baseUrl}/login`
    },
    register: {
      title: 'Join GrubGate - Partner Registration',
      description: 'Register your restaurant with GrubGate and start growing your business with subscription meal plans.',
      keywords: 'restaurant registration, join GrubGate, partner signup, restaurant partnership',
      image: `${baseUrl}/icons/logo512.png`,
      canonical: `${baseUrl}/register`
    },
    forgotPassword: {
      title: 'Reset Password - GrubGate Partner Portal',
      description: 'Reset your GrubGate partner account password to regain access to your dashboard.',
      keywords: 'reset password, forgot password, GrubGate partner',
      image: `${baseUrl}/icons/logo512.png`,
      canonical: `${baseUrl}/forgot-password`
    },
    dashboard: {
      title: 'Dashboard - GrubGate Partner Portal',
      description: 'Manage your restaurant dashboard, view analytics, and track your performance with GrubGate.',
      keywords: 'restaurant dashboard, partner analytics, order management, GrubGate',
      image: `${baseUrl}/icons/logo512.png`,
      canonical: `${baseUrl}/dashboard`
    }
  }

  const pageKey = getPageKey(url)
  return seoData[pageKey] || seoData.home
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






