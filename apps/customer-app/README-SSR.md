# Grub-Gate SSR Setup Guide

## Overview
This React/Vite application supports both Client-Side Rendering (CSR) in development and Server-Side Rendering (SSR) in production, with proper hydration and Netlify deployment compatibility.

## Fixed Issues

### 1. ENOENT Error Resolution
*Problem*: Server crashed with ENOENT: no such file or directory, open '...\\dist\\index.html'

*Root Cause*: The build process wasn't creating the required directory structure. The server was looking for dist/index.html but only a client build was being generated.

*Solution*: 
- Updated Vite config to create separate builds: dist/client and dist/server
- Created dedicated vite.config.ssr.js for server builds
- Modified server.js to correctly reference the client build location
- Updated build scripts to run both client and server builds sequentially

### 2. Hydration Errors Fixed
*Problem*: TestimonialsSection.jsx used window.innerWidth causing server/client mismatch

*Solution*:
- Added isClient state to track hydration status
- Deferred viewport-dependent logic until after client-side hydration
- Auto-play functionality now only starts after hydration completes
- Implemented server-safe default values (e.g., visibleCount: 3)

### 3. Express v5.x Routing Issues
*Problem*: app.use('*', ...) caused PathError with path-to-regexp

*Solution*:
- Changed to app.get(/.*/, handleSSR) using regex pattern
- Separated route handlers for better error handling
- Added proper middleware ordering

### 4. True SSR Implementation
*Problem*: Server was only serving static HTML with loading placeholders

*Solution*:
- Implemented proper SSR with React's renderToString
- Added development/production mode detection
- Integrated Vite's SSR capabilities for development
- Added graceful fallback to CSR if SSR fails

## Scripts

bash
# Development (SSR-enabled server with HMR)
npm run dev

# Build for production (both client and server)
npm run build

# Production server (full SSR)
npm start


## Architecture

### Development Mode
- Express server with Vite middleware integration
- Hot Module Replacement (HMR) support
- SSR available with live reload
- Fallback to static serving if Vite fails

### Production Mode
- Pre-built client assets served from dist/client
- Server-side rendering using dist/server/main.ssr.js
- Automatic fallback to CSR if SSR module fails to load
- Health check endpoint at /health

## Build Output Structure

dist/
├── client/              # Static assets for browser
│   ├── index.html       # HTML template
│   ├── assets/          # JS, CSS, images
│   └── vite.svg         # Favicon
└── server/              # SSR module
    └── main.ssr.js      # Server-side render function


## Netlify Deployment

### Configuration Files
- netlify.toml - Build and routing configuration
- netlify/functions/ssr.js - Edge function for SSR

### Build Process
1. *Client Build*: vite build → dist/client (static assets)
2. *Server Build*: vite build --config vite.config.ssr.js → dist/server (SSR module)
3. *Deployment*: Static files + Edge function for SSR

### Netlify Settings
toml
[build]
  publish = "dist/client"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200


## Hydration Safety

### Best Practices Implemented
- Components check isClient state before using browser APIs
- Server renders with safe defaults
- Client updates state after hydration
- No direct window access during initial render

### Hydration-Safe Pattern
jsx
const [isClient, setIsClient] = useState(false);
const [visibleCount, setVisibleCount] = useState(3); // Server-safe default

useEffect(() => {
  setIsClient(true);
  
  // Browser-specific code only after hydration
  if (typeof window !== 'undefined') {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 768) setVisibleCount(1);
      else if (width < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }
}, []);

// Auto-play only starts after client-side hydration
useEffect(() => {
  if (!isClient || !isAutoPlaying) return;
  // Auto-play logic here
}, [isClient, isAutoPlaying]);


## Environment Variables
- NODE_ENV=production - Enables production SSR mode
- PORT=3000 - Server port (default: 3000)
- Uses cross-env for Windows compatibility

## Troubleshooting

### Build Issues
1. *Missing dist/server/main.ssr.js*:
   bash
   npm run build:server
   

2. *Client build missing*:
   bash
   npm run build:client
   

3. *Both builds failing*:
   bash
   rm -rf dist
   npm run build
   

### Runtime Issues
1. *Internal Server Error*:
   - Check if all dependencies are installed: npm install
   - Verify all required files exist in src/
   - Check server logs for specific error messages

   #### PowerShell Solutions (Windows):
   powershell
   # 1. Check Node.js installation
   node --version
   npm --version

   # 2. Navigate to project directory
   cd "C:\Users\YourName\Downloads\grub-gate-01\grub-gate\frontend"

   # 3. Complete clean install
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   Remove-Item package-lock.json -ErrorAction SilentlyContinue
   npm cache clean --force
   npm install

   # 4. Install required dependencies
   npm install cross-env --save-dev

   # 5. Check for missing files
   Test-Path "src\App.jsx"
   Test-Path "src\main.jsx" 
   Test-Path "src\main.ssr.jsx"
   Test-Path "src\components\layout\Header.jsx"
   Test-Path "src\pages\HomePage.jsx"
   Test-Path "index.html"

   # 6. Kill conflicting processes
   Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
   netstat -ano | findstr :3000

   # 7. Set environment and start
   $env:NODE_ENV="development"
   npm run dev
   

   #### Command Prompt Solutions (Windows):
   cmd
   REM 1. Navigate to project
   cd /d "C:\Users\YourName\Downloads\grub-gate-01\grub-gate\frontend"

   REM 2. Clean reinstall
   rmdir /s /q node_modules 2>nul
   del package-lock.json 2>nul
   npm cache clean --force
   npm install

   REM 3. Install cross-env
   npm install cross-env --save-dev

   REM 4. Check required files exist
   if exist "src\App.jsx" (echo App.jsx found) else (echo ERROR: App.jsx missing)
   if exist "src\main.jsx" (echo main.jsx found) else (echo ERROR: main.jsx missing)
   if exist "index.html" (echo index.html found) else (echo ERROR: index.html missing)

   REM 5. Kill processes and start
   taskkill /f /im node.exe 2>nul
   set NODE_ENV=development
   npm run dev
   

2. *Hydration Mismatches*:
   - Look for components using browser APIs during initial render
   - Add isClient checks for viewport-dependent logic
   - Ensure server and client render the same initial state

3. *Port Already in Use*:
   bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <process_id> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill
   

### Development vs Production Differences
- *Development*: Vite dev server with SSR middleware
- *Production*: Express server with pre-built SSR module
- *Fallback*: Both modes fall back to CSR if SSR fails

## Health Check
bash
# Check if server is running
curl http://localhost:3000/health

# Expected response
{"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}


## Performance Notes
- SSR improves initial page load and SEO
- Hydration happens seamlessly after initial render
- Components are optimized to prevent layout shifts
- Automatic fallback ensures reliability

## Contributing to SSR
1. Ensure all new components are SSR-safe
2. Test both npm run dev and npm start
3. Verify no hydration warnings in browser console
4. Check that components work without JavaScript enabled
