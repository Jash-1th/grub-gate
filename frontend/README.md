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


frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── common/          # Reusable components
│   │   └── home/            # Homepage sections
│   ├── data/                # Dummy data files
│   ├── pages/               # Page components
│   └── assets/              # Static assets
├── dist/
│   ├── client/              # Client build output
│   └── server/              # SSR build output
├── netlify/
│   └── functions/           # Netlify edge functions
├── server.js                # Express SSR server
├── vite.config.js           # Vite configuration
├── vite.config.ssr.js       # SSR-specific Vite config
└── tailwind.config.js       # Tailwind CSS configuration


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
