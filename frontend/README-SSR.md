# Grub-Gate SSR Setup Guide

## Overview
This React/Vite application now supports both Client-Side Rendering (CSR) in development and Server-Side Rendering (SSR) in production, with proper hydration and Netlify deployment compatibility.

## Fixed Issues

### 1. ENOENT Error Resolution
**Problem**: Server crashed with `ENOENT: no such file or directory, open '...\\dist\\index.html'`

**Root Cause**: The build process wasn't creating the required directory structure. The server was looking for `dist/index.html` but only a client build was being generated.

**Solution**: 
- Updated Vite config to handle both client (`dist/client`) and server (`dist/server`) builds
- Modified server.js to correctly reference the client build location
- Updated build scripts to run both client and server builds

### 2. Hydration Errors Fixed
**Problem**: `TestimonialsSection.jsx` used `window.innerWidth` causing server/client mismatch

**Solution**:
- Added `isClient` state to track hydration status
- Deferred viewport-dependent logic until after client-side hydration
- Auto-play functionality now only starts after hydration completes

### 3. True SSR Implementation
**Problem**: Server was only serving static HTML with loading placeholders

**Solution**:
- Implemented proper SSR with React's `renderToString`
- Added development/production mode detection
- Integrated Vite's SSR capabilities for development
- Added fallback to CSR if SSR fails

## Scripts

```bash
# Development (CSR with SSR server)
npm run dev

# Build for production (both client and server)
npm run build

# Production server (SSR)
npm start
```

## Architecture

### Development Mode
- Uses Vite dev server integrated with Express
- Supports hot module replacement
- SSR available but primarily CSR for faster development

### Production Mode
- Pre-built client assets served from `dist/client`
- Server-side rendering using `dist/server/main.ssr.js`
- Automatic fallback to CSR if SSR fails

## Netlify Deployment

### Configuration
- `netlify.toml` configured for proper routing
- Edge function for SSR (`netlify/functions/ssr.js`)
- Static assets served from `dist/client`

### Build Process
1. Client build → `dist/client` (static assets)
2. Server build → `dist/server` (SSR module)
3. Netlify serves static files and uses edge function for SSR

## Hydration Safety

### Best Practices Implemented
- Components check `isClient` state before using browser APIs
- Server renders with safe defaults (e.g., `visibleCount: 3`)
- Client updates state after hydration
- No direct `window` access during initial render

### Example Pattern
```jsx
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
  // Browser-specific code here
}, []);

// Render with server-safe defaults
// Update with client-specific values after hydration
```

## File Structure
```
dist/
├── client/          # Static assets for browser
│   ├── index.html
│   └── assets/
└── server/          # SSR module
    └── main.ssr.js

netlify/
└── functions/
    └── ssr.js       # Edge function for Netlify SSR
```

## Environment Variables
- `NODE_ENV=production` enables production SSR mode
- Uses `cross-env` for Windows compatibility

## Troubleshooting

### Build Issues
- Ensure both `build:client` and `build:server` complete successfully
- Check that `dist/client/index.html` and `dist/server/main.ssr.js` exist

### Hydration Mismatches
- Look for components using browser APIs during initial render
- Add `isClient` checks for viewport-dependent logic
- Ensure server and client render the same initial state

### Netlify Deployment
- Verify `netlify.toml` configuration
- Check that build command produces both client and server builds
- Monitor edge function logs for SSR errors
