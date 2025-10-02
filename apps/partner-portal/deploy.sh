#!/bin/bash

# GrubGate Partner Portal Deployment Script
echo "🚀 Starting GrubGate Partner Portal deployment..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
# Go to root and install all workspace dependencies
cd ../..
npm ci

echo "🔨 Building Partner Portal..."
# Go back to partner portal and build
cd apps/partner-portal

# Build client
echo "Building client bundle..."
npm run build:client

# Build server (SSR)
echo "Building SSR bundle..."
npm run build:server

echo "✅ Build complete!"
echo "📁 Client assets: dist/client/"
echo "📁 SSR bundle: dist/server/"
echo "🔧 Netlify function: netlify/functions/ssr.js"

# Verify critical files exist
if [ -f "dist/client/index.html" ]; then
    echo "✅ Client build successful"
else
    echo "❌ Client build failed - index.html not found"
    exit 1
fi

if [ -f "dist/server/entry-server.js" ]; then
    echo "✅ SSR build successful"
else
    echo "❌ SSR build failed - entry-server.js not found"
    exit 1
fi

if [ -f "netlify/functions/ssr.js" ]; then
    echo "✅ Netlify function ready"
else
    echo "❌ Netlify function not found"
    exit 1
fi

echo "🎉 Partner Portal is ready for deployment!"
