# Grub-Gate Frontend

A modern, responsive food delivery platform built with React, Vite, and Tailwind CSS. This project features server-side rendering (SSR) support and is designed for large-scale deployment.

## 🚀 Features

- **Modern React Architecture**: Built with React 19 and modern hooks
- **Server-Side Rendering (SSR)**: Express server with SSR support for better SEO
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component-Based**: Modular, reusable components
- **Dummy Data**: Comprehensive dummy data structure for development
- **Performance Optimized**: Vite build system for fast development and production builds

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── common/          # Reusable components
│   │   └── home/            # Homepage sections
│   ├── data/                # Dummy data files
│   ├── pages/               # Page components
│   └── assets/              # Static assets
├── server.js                # Express SSR server
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Start production server:
```bash
npm run start
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS**: Component-specific styles where needed
- **Color Scheme**: Grub-Gate brand colors (#800020)
- **Typography**: System fonts with proper hierarchy

## 📊 Dummy Data

Comprehensive dummy data is organized in separate files:
- `restaurants.js` - Restaurant data with ratings, menus, locations
- `testimonials.js` - Customer reviews and ratings
- `benefits.js` - Feature benefits and additional features
- `menuItems.js` - Menu items with dietary information
- `heroContent.js` - Hero section content and variants
- `navigation.js` - Navigation structure and site information

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:client` - Build client-side only
- `npm run build:server` - Build server-side only
- `npm run start` - Start production server
- `npm run preview` - Preview production build

## 🌐 Deployment

The application supports both client-side rendering (CSR) for development and server-side rendering (SSR) for production.

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

## 📝 Notes

- All components are SSR-aware (no browser-specific APIs outside useEffect)
- Dummy data can be easily replaced with backend API calls
- Responsive design tested across all major devices
- Performance optimized for large-scale deployment