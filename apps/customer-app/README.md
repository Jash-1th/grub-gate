# Grub-Gate Frontend

A modern, responsive food delivery platform built with React, Vite, and Tailwind CSS. This project features server-side rendering (SSR) support and is designed for large-scale deployment.

## 🚀 Features

- *Modern React Architecture*: Built with React 19 and modern hooks
- *Server-Side Rendering (SSR)*: Express server with SSR support for better SEO
- *Responsive Design*: Mobile-first approach with Tailwind CSS
- *Component-Based*: Modular, reusable components
- *Dummy Data*: Comprehensive dummy data structure for development
- *Performance Optimized*: Vite build system for fast development and production builds
- *Hydration Safe*: Components designed to prevent hydration mismatches
- *Netlify Ready*: Configured for seamless Netlify deployment

## 📁 Project Structure


grub-gate/frontend/
├── 📄 Configuration Files
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── vite.config.ssr.js
│   ├── netlify.toml
│   ├── server.js
│   └── test-server.js
│
├── 📁 netlify/
│   └── functions/
│       └── ssr.js
│
├── 📁 public/
│   ├── critical.css
│   ├── favicon.ico
│   ├── launch-screen.css
│   ├── manifest.json
│   ├── service-worker.js
│   ├── vite.svg
│   ├── 📁 icons/
│   │   ├── Logo.png
│   │   ├── logo192.png
│   │   └── logo512.png
│   ├── 📁 images/
│   │   ├── grub-gate-default-img.jpg
│   │   ├── grub-gate-default-restaurant-img.jpg
│   │   ├── HeroHome.jpg
│   │   ├── HeroHome.png
│   │   ├── HowItWorksHero.jpg
│   │   └── launch-background.jpg
│   └── 📁 locales/
│       ├── 📁 en/
│       │   └── translation.json
│       └── 📁 fr/
│           └── translation.json
│
├── 📁 src/
│   ├── App.css
│   ├── App.jsx
│   ├── App.old.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── main.ssr.jsx
│   ├── firebase.js
│   ├── i18n.js
│   ├── i18n.server.js
│   ├── pwa.js
│   │
│   ├── 📁 assets/
│   │   └── 📁 images/
│   │       ├── grub-gate-default-img.jpg
│   │       ├── grub-gate-default-restaurant-img.jpg
│   │       ├── HeroHome.png
│   │       ├── logo.png
│   │       ├── restaurant-default-img.webp
│   │       ├── react.svg
│   │       └── 📁 HowItWorks/
│   │           ├── ChoosePlan.png
│   │           ├── Hero.jpg
│   │           ├── HowITWorksHero.jpeg
│   │           ├── Location.png
│   │           ├── PickUporDel.png
│   │           ├── Relax&Enjoy.png
│   │           └── Restaurant.png
│   │
│   ├── 📁 components/
│   │   ├── 📁 auth/
│   │   │   ├── LoginModal.jsx
│   │   │   ├── modal-responsive.css
│   │   │   └── SignupModal.jsx
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── GetStartedCTA.jsx
│   │   │   ├── hero-responsive.css
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   ├── LaunchScreen.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── PushNotificationTester.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── TwoColumnSection.jsx
│   │   │
│   │   ├── 📁 contact/
│   │   │   ├── ContactForm.jsx
│   │   │   ├── ContactInfo.jsx
│   │   │   └── FollowUsSection.jsx
│   │   │
│   │   ├── 📁 faq/
│   │   │   └── AccordionItem.jsx
│   │   │
│   │   ├── 📁 home/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── NearbyRestaurants.css
│   │   │   ├── NearbyRestaurants.jsx
│   │   │   ├── PopularDishes.jsx
│   │   │   ├── StatisticsSection.jsx
│   │   │   ├── TestimonialsSection.jsx
│   │   │   └── WhyGrubGateSection.jsx
│   │   │
│   │   ├── 📁 howItWorks/
│   │   │   ├── HeroHowItWorks.jsx
│   │   │   └── ProcessSteps.jsx
│   │   │
│   │   ├── 📁 layout/
│   │   │   ├── AuthButtons.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.css
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── MobileBottomNav.jsx
│   │   │   ├── MobileMenu.jsx
│   │   │   └── NavIcon.jsx
│   │   │
│   │   ├── 📁 planning/
│   │   │   ├── FoodPreferences.jsx
│   │   │   ├── HeroPlan.jsx
│   │   │   ├── HowItWorksPlan.jsx
│   │   │   ├── LocationStep.jsx
│   │   │   ├── MenuSelectionStep.jsx
│   │   │   ├── PreferenceSelectionModal.jsx
│   │   │   ├── RestaurantCard.jsx
│   │   │   ├── RestaurantGrid.jsx
│   │   │   ├── RestaurantStep.jsx
│   │   │   ├── ScheduleDemo.jsx
│   │   │   ├── SubscriptionPlans.jsx
│   │   │   └── SubscriptionStep.jsx
│   │   │
│   │   ├── 📁 restaurant/
│   │   │   ├── DaysFilterModal.jsx
│   │   │   ├── FloatingNavbar.jsx
│   │   │   ├── FloatingPreferencesButton.jsx
│   │   │   ├── FoodItemCard.jsx
│   │   │   ├── ItemDetailsModal.jsx
│   │   │   ├── MealPlanSummary.jsx
│   │   │   ├── MenuItemsGrid.jsx
│   │   │   ├── NextStepButton.jsx
│   │   │   ├── PreferencesFilterModal.jsx
│   │   │   ├── PreferencesSelector.jsx
│   │   │   ├── ProFeaturesPanel.jsx
│   │   │   ├── ProUserFeatures.jsx
│   │   │   ├── RestaurantHero.jsx
│   │   │   ├── UserTypeToggle.jsx
│   │   │   └── WeeklyPlanSummary.jsx
│   │   │
│   │   └── 📁 shared/
│   │       ├── FilterSection.jsx
│   │       ├── StickyFilterBar.jsx
│   │       └── UserTypeSelectionModal.jsx
│   │
│   ├── 📁 config/
│   │   └── env.js
│   │
│   ├── 📁 context/
│   │   └── ModalContext.jsx
│   │
│   ├── 📁 contexts/
│   │   ├── MealPlanContext.jsx
│   │   ├── PlanningContext.jsx
│   │   └── ToastContext.jsx
│   │
│   ├── 📁 data/
│   │   ├── additionalFoodItems.js
│   │   ├── benefits.js
│   │   ├── faqData.js
│   │   ├── heroContent.js
│   │   ├── index.js
│   │   ├── menuItems.js
│   │   ├── navigation.js
│   │   ├── subscriptionPlans.js
│   │   ├── testimonials.js
│   │   └── unifiedRestaurants.js
│   │
│   ├── 📁 hooks/
│   │   ├── useClientSide.js
│   │   ├── useFilterState.js
│   │   ├── useIntersectionObserver.js
│   │   ├── useResponsiveNavigation.js
│   │   └── useScrollToTop.js
│   │
│   ├── 📁 pages/
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── DayMealPlanPage.jsx
│   │   ├── Faq.jsx
│   │   ├── HomePage.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── MealPlanningFlowPage.jsx
│   │   ├── MealPlanningPage.jsx
│   │   ├── RestaurantDetailPage.jsx
│   │   ├── SubscriptionPage.jsx
│   │   └── WeeklyMenuPage.jsx
│   │
│   └── 📁 utils/
│       ├── combinedMenuHelpers.js
│       ├── emailService.js
│       ├── filteringAlgorithms.js
│       ├── filteringHelpers.js
│       └── serverData.js
│
├── 📄 Documentation
│   ├── PUSH_NOTIFICATIONS_README.md
│   ├── README-SSR.md
│   ├── README.md
│   └── replacement_snippet.txt
│
└── 📁 node_modules/ (dependencies)

## 🛠 Installation

1. *Clone and navigate to the project:*
bash
cd grub-gate/frontend


2. *Install dependencies:*
bash
npm install


3. *Start development server:*
bash
npm run dev


4. *Build for production:*
bash
npm run build


5. *Start production server:*
bash
npm start


## 🔧 Available Scripts

- npm run dev - Start development server with SSR support
- npm run build - Build both client and server for production
- npm run build:client - Build client-side assets only
- npm run build:server - Build server-side rendering module
- npm run start - Start production server with SSR
- npm run lint - Run ESLint
- npm run preview - Preview production build

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- *Mobile*: < 768px (1 testimonial card)
- *Tablet*: 768px - 1024px (2 testimonial cards)
- *Desktop*: > 1024px (3 testimonial cards)

## 🎨 Styling

- *Tailwind CSS*: Utility-first CSS framework
- *Custom CSS*: Component-specific styles where needed
- *Color Scheme*: Grub-Gate brand colors (#800020)
- *Typography*: System fonts with proper hierarchy
- *Responsive Images*: Optimized for all screen sizes

## 📊 Dummy Data

Comprehensive dummy data is organized in separate files:
- restaurants.js - Restaurant data with ratings, menus, locations
- testimonials.js - Customer reviews and ratings
- benefits.js - Feature benefits and additional features
- menuItems.js - Menu items with dietary information
- heroContent.js - Hero section content and variants
- navigation.js - Navigation structure and site information

## 🌐 SSR & Deployment

### Development Mode
- Uses Vite dev server integrated with Express
- Supports hot module replacement
- SSR available but primarily CSR for faster development

### Production Mode
- Pre-built client assets served from dist/client
- Server-side rendering using dist/server/main.ssr.js
- Automatic fallback to CSR if SSR fails

### Netlify Deployment
bash
# Build command
npm run build

# Publish directory
dist/client

# Functions directory
netlify/functions


## 🔒 Hydration Safety

All components are designed to prevent hydration mismatches:
- Browser APIs only used in useEffect
- Server-safe default values
- isClient state pattern for viewport-dependent logic

### Example Pattern
jsx
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
  // Browser-specific code here
}, []);


## 🚨 Troubleshooting

### Common Issues

1. *Internal Server Error*: Run npm install to install dependencies
2. *Cross-env not found*: Install with npm install cross-env --save-dev
3. *Port in use*: Kill process on port 3000 or change PORT environment variable
4. *Module not found*: Ensure all required files exist in src/ directory

### Debug Commands
bash
# Check server health
curl http://localhost:3000/health

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install


## 📝 Environment Variables

- NODE_ENV=production - Enables production SSR mode
- PORT=3000 - Server port (default: 3000)

## 🤝 Contributing

1. Follow the component structure in src/components/
2. Ensure all components are SSR-safe
3. Test both development and production builds
4. Maintain responsive design principles

## 📄 License

This project is part of the Grub-Gate food delivery platform.
