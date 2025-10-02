# Netlify Deployment Guide for GrubGate Monorepo

This guide explains how to deploy both the **Customer App** and **Partner Portal** from a single monorepo to separate Netlify sites.

## Overview

The GrubGate project uses a monorepo structure with npm workspaces:
```
grub-gate/
├── apps/
│   ├── customer-app/      # Public-facing customer application
│   └── partner-portal/    # Restaurant partner dashboard
├── packages/
│   ├── ui/               # Shared UI components
│   ├── config/           # Shared configuration
│   └── locales/          # Shared i18n translations
└── package.json          # Root package.json with workspace configuration
```

**Strategy:** We'll create **two separate Netlify sites** from the same repository, each configured to build only its respective application.

---

## Prerequisites

1. A Netlify account (free tier works fine)
2. Your repository pushed to GitHub, GitLab, or Bitbucket
3. Both apps must have their respective `netlify.toml` files configured

---

## Part 1: Deploy the Customer App

### Step 1: Create a New Site on Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your **grub-gate** repository
5. You'll be taken to the build settings page

### Step 2: Configure Build Settings for Customer App

On the build settings page, configure the following:

**Base directory:**
```
apps/customer-app
```

**Build command:**
```
cd ../.. && npm ci && cd apps/customer-app && npm run build
```

**Publish directory:**
```
dist/client
```

**Functions directory:**
```
netlify/functions
```

### Step 3: Add Environment Variables

Under **Site settings** → **Environment variables**, add all required variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Step 4: Deploy

1. Click **"Deploy site"**
2. Netlify will begin building your customer app
3. Once complete, you'll get a URL like `https://random-name-123456.netlify.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `www.grubgate.com`)
4. Follow Netlify's instructions to update your DNS settings
5. Netlify will automatically provision an SSL certificate

---

## Part 2: Deploy the Partner Portal

### Step 1: Create Another New Site

1. Return to your Netlify dashboard
2. Click **"Add new site"** → **"Import an existing project"**
3. Select the **same grub-gate repository** again
4. This will create a second site from the same repo

### Step 2: Configure Build Settings for Partner Portal

On the build settings page:

**Base directory:**
```
apps/partner-portal
```

**Build command:**
```
cd ../.. && npm ci && cd apps/partner-portal && npm run build
```

**Publish directory:**
```
dist/client
```

**Functions directory:**
```
netlify/functions
```

### Step 3: Add Environment Variables

Add any required environment variables for the partner portal (similar process as Step 3 in Part 1).

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete
3. You'll get a different URL like `https://another-name-789012.netlify.app`

### Step 5: Configure Subdomain

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your subdomain (e.g., `partners.grubgate.com`)
4. Follow Netlify's DNS configuration instructions
5. SSL certificate will be automatically provisioned

---

## Understanding the Build Configuration

### Why the Complex Build Command?

```bash
cd ../.. && npm ci && cd apps/customer-app && npm run build
```

Here's what each part does:

1. **`cd ../..`** - Netlify starts in `/opt/build/repo/apps/customer-app`, so we navigate to the root `/opt/build/repo`
2. **`npm ci`** - Install all dependencies at the root level, which properly sets up the monorepo workspace links
3. **`cd apps/customer-app`** - Navigate back to the specific app directory
4. **`npm run build`** - Run the build script defined in that app's `package.json`

This approach ensures that:
- All shared packages (`packages/ui`, `packages/config`, `packages/locales`) are properly linked
- Both apps can access shared dependencies
- The monorepo structure is respected

### Publish Directory Paths

The publish directory is **relative to the base directory**:
- Base directory: `apps/customer-app`
- Publish directory: `dist/client`
- Full path: `/opt/build/repo/apps/customer-app/dist/client`

---

## Continuous Deployment

Both sites are now configured for continuous deployment:

1. **Automatic Deploys:** Push to your main/master branch → Both sites rebuild automatically
2. **Deploy Previews:** Create a pull request → Netlify generates preview URLs for both apps
3. **Branch Deploys:** Configure specific branches to deploy to staging environments

### Controlling Which Sites Deploy

If you want to prevent unnecessary builds, you can add build conditions:

**For Customer App** - In Netlify's build settings, add:
- **Ignore builds:** `git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- apps/customer-app packages`

**For Partner Portal** - Similar setting:
- **Ignore builds:** `git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- apps/partner-portal packages`

This ensures each site only rebuilds when its respective files change.

---

## Troubleshooting

### Build Fails with "Missing script: build"

**Problem:** The build command can't find the build script.

**Solution:** Ensure your `netlify.toml` uses the correct build command that navigates to the root first:
```toml
[build]
  command = "cd ../.. && npm ci && cd apps/customer-app && npm run build"
```

### Shared Packages Not Found

**Problem:** Build fails with "Cannot find module '@grubgate/ui'" or similar.

**Solution:** The root `npm ci` might not be running. Verify:
1. The build command includes `cd ../.. && npm ci`
2. The root `package.json` has workspaces configured correctly

### Environment Variables Not Working

**Problem:** App loads but environment-specific features don't work.

**Solution:** 
1. Verify all `VITE_*` variables are set in Netlify's UI
2. Redeploy the site after adding variables
3. Check that variable names match exactly in your code

### SSR Function Errors

**Problem:** Pages load but get 500 errors on navigation.

**Solution:**
1. Check the Netlify Functions logs in the Netlify dashboard
2. Ensure `netlify/functions/ssr.js` is being deployed correctly
3. Verify the redirect rule in `netlify.toml` is present

---

## Advanced Configuration

### Deploy Contexts

You can configure different settings for production vs. preview builds:

```toml
[build]
  command = "cd ../.. && npm ci && cd apps/customer-app && npm run build"
  publish = "dist/client"

[context.production]
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  command = "cd ../.. && npm ci && cd apps/customer-app && npm run build"

[context.branch-deploy]
  command = "cd ../.. && npm ci && cd apps/customer-app && npm run build"
```

### Custom Headers for Performance

Both apps have caching headers configured in their `netlify.toml` files for optimal performance:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

---

## Monitoring and Analytics

1. **Build Minutes:** Free tier includes 300 build minutes/month
2. **Bandwidth:** Free tier includes 100GB/month
3. **Concurrent Builds:** Free tier allows 1 concurrent build

Monitor usage at: **Team settings** → **Usage**

---

## Summary

You now have:
- ✅ Two independent Netlify sites from one repository
- ✅ Automatic deployments on every push
- ✅ Custom domains (optional)
- ✅ SSL certificates
- ✅ SSR support via Netlify Functions
- ✅ Optimized caching headers

**Customer App:** `www.grubgate.com` → Builds from `apps/customer-app`
**Partner Portal:** `partners.grubgate.com` → Builds from `apps/partner-portal`

For any issues, check the Netlify build logs, which provide detailed information about each build step.
