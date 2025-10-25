#!/bin/bash
# Push Notifications Deployment Checklist
# Run this script to verify everything is ready for deployment

echo "🔔 GrubGate Push Notifications - Deployment Checklist"
echo "===================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

echo "1️⃣  Checking Customer App..."
echo "----------------------------"

# Check if vite-plugin-static-copy is installed
if grep -q "vite-plugin-static-copy" apps/customer-app/package.json; then
    echo -e "${GREEN}✅ vite-plugin-static-copy installed${NC}"
else
    echo -e "${RED}❌ vite-plugin-static-copy NOT installed${NC}"
    echo "   Run: cd apps/customer-app && npm install vite-plugin-static-copy --save-dev"
fi

# Check if .env exists
if [ -f "apps/customer-app/.env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check for required variables
    if grep -q "VITE_VAPID_PUBLIC_KEY" apps/customer-app/.env; then
        echo -e "${GREEN}✅ VAPID key configured${NC}"
    else
        echo -e "${YELLOW}⚠️  VAPID key not found in .env${NC}"
    fi
else
    echo -e "${RED}❌ .env file missing${NC}"
    echo "   Copy .env.example to .env and fill in values"
fi

# Check if service workers exist
if [ -f "apps/customer-app/public/service-worker.js" ]; then
    echo -e "${GREEN}✅ service-worker.js exists${NC}"
else
    echo -e "${RED}❌ service-worker.js missing${NC}"
fi

if [ -f "apps/customer-app/public/firebase-messaging-sw.js" ]; then
    echo -e "${GREEN}✅ firebase-messaging-sw.js exists${NC}"
else
    echo -e "${RED}❌ firebase-messaging-sw.js missing${NC}"
fi

echo ""
echo "2️⃣  Checking Partner Portal..."
echo "----------------------------"

# Check if vite-plugin-static-copy is installed
if grep -q "vite-plugin-static-copy" apps/partner-portal/package.json; then
    echo -e "${GREEN}✅ vite-plugin-static-copy installed${NC}"
else
    echo -e "${RED}❌ vite-plugin-static-copy NOT installed${NC}"
    echo "   Run: cd apps/partner-portal && npm install vite-plugin-static-copy --save-dev"
fi

# Check if .env exists
if [ -f "apps/partner-portal/.env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check for required variables
    if grep -q "VITE_VAPID_PUBLIC_KEY" apps/partner-portal/.env; then
        echo -e "${GREEN}✅ VAPID key configured${NC}"
    else
        echo -e "${YELLOW}⚠️  VAPID key not found in .env${NC}"
    fi
else
    echo -e "${RED}❌ .env file missing${NC}"
    echo "   Copy .env.example to .env and fill in values"
fi

# Check if service workers exist
if [ -f "apps/partner-portal/public/service-worker.js" ]; then
    echo -e "${GREEN}✅ service-worker.js exists${NC}"
else
    echo -e "${RED}❌ service-worker.js missing${NC}"
fi

if [ -f "apps/partner-portal/public/firebase-messaging-sw-partner.js" ]; then
    echo -e "${GREEN}✅ firebase-messaging-sw-partner.js exists${NC}"
else
    echo -e "${RED}❌ firebase-messaging-sw-partner.js missing${NC}"
fi

echo ""
echo "3️⃣  Checking Backend..."
echo "----------------------------"

# Check if .env exists
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check for CORS_ORIGIN (optional for local, required for deployment)
    if grep -q "CORS_ORIGIN" backend/.env; then
        echo -e "${GREEN}✅ CORS_ORIGIN configured (ready for deployment)${NC}"
    else
        echo -e "${YELLOW}⚠️  CORS_ORIGIN not set (add for deployment)${NC}"
        echo "   Example: CORS_ORIGIN=https://app1.com,https://app2.com"
    fi
    
    # Check for VAPID keys
    if grep -q "VAPID_PUBLIC_KEY" backend/.env; then
        echo -e "${GREEN}✅ VAPID keys configured${NC}"
    else
        echo -e "${RED}❌ VAPID keys missing${NC}"
        echo "   Run: node backend/generate-vapid-keys.js"
    fi
else
    echo -e "${RED}❌ .env file missing${NC}"
    echo "   Copy .env.example to .env and fill in values"
fi

echo ""
echo "4️⃣  Testing Build..."
echo "----------------------------"

# Try building customer app
cd apps/customer-app
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Customer app builds successfully${NC}"
    
    # Check if service workers are in dist
    if [ -f "dist/service-worker.js" ]; then
        echo -e "${GREEN}✅ service-worker.js copied to dist${NC}"
    else
        echo -e "${RED}❌ service-worker.js NOT in dist${NC}"
    fi
    
    if [ -f "dist/firebase-messaging-sw.js" ]; then
        echo -e "${GREEN}✅ firebase-messaging-sw.js copied to dist${NC}"
    else
        echo -e "${RED}❌ firebase-messaging-sw.js NOT in dist${NC}"
    fi
else
    echo -e "${RED}❌ Customer app build failed${NC}"
fi
cd ../..

echo ""
echo "===================================================="
echo ""
echo "📋 DEPLOYMENT CHECKLIST:"
echo ""
echo "Before deploying, make sure:"
echo "  [ ] All ✅ checks passed above"
echo "  [ ] Firebase Console: Cloud Messaging enabled"
echo "  [ ] Firebase Console: Authorized domains added"
echo "  [ ] Backend CORS_ORIGIN includes deployed URLs"
echo "  [ ] All environment variables set in deployment platform"
echo ""
echo "📖 Full Guide: PUSH_NOTIFICATIONS_DEPLOYMENT_GUIDE.md"
echo "⚡ Quick Fix: PUSH_NOTIFICATIONS_QUICK_FIX.md"
echo ""
