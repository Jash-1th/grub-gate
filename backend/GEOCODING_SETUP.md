# 🌍 Geocoding API Setup Guide

This guide will help you set up the geocoding services for automatic coordinate calculation from postal codes.

## 📋 Overview

The GrubGate platform uses a **multi-provider geocoding system** with automatic fallback:

1. **Google Maps API** (Primary - Most Accurate)
2. **MapBox API** (Secondary - Good Free Tier) 
3. **OpenStreetMap Nominatim** (Fallback - Free)

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install axios
```

### Step 2: Environment Configuration

Add these variables to your `.env` file:

```bash
# Geocoding API Configuration
# Google Maps API (Most accurate, requires billing account)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# MapBox API (Good accuracy, generous free tier)
MAPBOX_ACCESS_TOKEN=pk.your-mapbox-access-token

# OpenStreetMap Nominatim is free and used as fallback (no API key needed)
```

## 🗝️ API Key Setup

### Option 1: Google Maps API (Recommended)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select existing
3. **Enable APIs**:
   - Go to "APIs & Services" → "Library"
   - Search and enable "Geocoding API"
   - Search and enable "Maps JavaScript API" (optional, for map display)

4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

5. **Secure the API Key** (Important):
   - Click on your API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Geocoding API" and "Maps JavaScript API"
   - Under "Application restrictions", add your server IP or use "HTTP referrers"

6. **Set up Billing** (Required):
   - Google Maps requires a billing account
   - You get $200 free credits monthly
   - Geocoding costs $5 per 1000 requests after free tier

7. **Add to .env**:
   ```bash
   GOOGLE_MAPS_API_KEY=AIzaSyBvOkBwGyiwHXXXXXXXXXXXXXXXXXX
   ```

### Option 2: MapBox API (Good Alternative)

1. **Sign up**: https://account.mapbox.com/auth/signup/
2. **Get Access Token**:
   - Go to your account page
   - Copy the "Default public token" or create a new one
   - For server-side use, create a secret token with appropriate scopes

3. **Free Tier**: 100,000 requests/month free
4. **Add to .env**:
   ```bash
   MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsXXXXXXXXXX
   ```

### Option 3: OpenStreetMap Nominatim (Free Fallback)

- **No API key required**
- **Rate limited**: 1 request per second
- **Usage policy**: Must include User-Agent header (already implemented)
- **Automatically used as fallback**

## 🧪 Testing the Setup

### 1. Test the Geocoding Service

Create a test file `test-geocoding.js`:

```javascript
const { geocodeAddress } = require('./src/services/geocodingService');

async function testGeocoding() {
  try {
    console.log('🧪 Testing geocoding service...');
    
    // Test Canadian postal code
    const result = await geocodeAddress('H3A 0G4', 'Montreal', 'Quebec', 'Canada');
    console.log('✅ Geocoding successful:', result);
    
  } catch (error) {
    console.error('❌ Geocoding failed:', error.message);
  }
}

testGeocoding();
```

Run the test:
```bash
node test-geocoding.js
```

### 2. Test Restaurant Creation

```bash
# Test creating a restaurant with geocoding
curl -X POST http://localhost:5000/api/v1/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Restaurant",
    "description": "Test restaurant with geocoding",
    "cuisine": ["Italian"],
    "businessType": "restaurant",
    "address": {
      "street": "123 Test Street",
      "city": "Montreal", 
      "province": "Quebec",
      "postalCode": "H3A 0G4"
    },
    "phone": "+1-514-123-4567",
    "email": "test@restaurant.com",
    "tags": ["italian", "pizza", "delivery"]
  }'
```

### 3. Populate Existing Restaurants

Run the coordinate population script:

```bash
node scripts/populateCoordinates.js
```

## 🔍 How It Works

### Provider Priority System

1. **Google Maps** (if API key configured)
   - Highest accuracy
   - Best address parsing
   - Requires billing account

2. **MapBox** (if access token configured)
   - Good accuracy
   - Generous free tier
   - Fast response times

3. **Nominatim** (always available)
   - Free service
   - Decent accuracy
   - Rate limited (1 req/sec)

### Automatic Fallback

```javascript
// The service tries providers in order:
try {
  return await geocodeWithGoogle(address);
} catch {
  try {
    return await geocodeWithMapbox(address);
  } catch {
    return await geocodeWithNominatim(address);
  }
}
```

### Error Handling

- **Geocoding fails**: Restaurant still created without coordinates
- **Partial address**: Warning logged, coordinates can be updated later
- **Rate limits**: Automatic retry with next provider

## 📊 Usage Examples

### Restaurant Creation with Coordinates

```javascript
// Input address
{
  "street": "123 Main St",
  "city": "Montreal",
  "province": "Quebec", 
  "postalCode": "H3A 0G4"
}

// Automatic geocoding result
{
  "street": "123 Main St",
  "city": "Montreal",
  "province": "Quebec",
  "postalCode": "H3A 0G4",
  "coordinates": {
    "lat": 45.5017,
    "lng": -73.5673
  }
}
```

### Nearest Restaurant Search

```javascript
// Search by postal code with coordinate fallback
GET /api/v1/restaurants/by-postal-code?postalCode=H3A0G4&radius=5

// Returns restaurants within 5km radius using:
// 1. Exact postal code match (fastest)
// 2. Coordinate-based search (if no exact matches)
// 3. Partial postal code match (fallback)
```

## 🚨 Important Notes

### Rate Limits
- **Google**: 50 requests/second (with billing)
- **MapBox**: 600 requests/minute
- **Nominatim**: 1 request/second

### Best Practices
1. **Cache results** - Store coordinates in database
2. **Batch processing** - Use population script for existing data
3. **Error handling** - Always have fallbacks
4. **Monitoring** - Track API usage and costs

### Cost Optimization
1. **Start with MapBox** - Better free tier than Google
2. **Use Nominatim** - For development and testing
3. **Monitor usage** - Set up billing alerts
4. **Cache aggressively** - Avoid re-geocoding same addresses

## 🔧 Troubleshooting

### Common Issues

**1. "Geocoding failed" errors**
```bash
# Check API keys are set
echo $GOOGLE_MAPS_API_KEY
echo $MAPBOX_ACCESS_TOKEN

# Test API connectivity
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Montreal&key=$GOOGLE_MAPS_API_KEY"
```

**2. "Rate limit exceeded"**
- Wait and retry
- Check if you have valid API keys
- Consider upgrading API plan

**3. "Invalid coordinates"**
- Check address format
- Ensure postal code is valid
- Try different provider

### Debug Mode

Enable debug logging:
```javascript
// In geocodingService.js
console.log(`🌍 Attempting geocoding with ${providerName} for: ${address}`);
```

## 📈 Monitoring

### Track API Usage

Add to your monitoring dashboard:
- Geocoding success/failure rates
- Provider usage distribution  
- API costs and limits
- Response times

### Alerts

Set up alerts for:
- API quota approaching limits
- High failure rates
- Unusual cost spikes

## 🎯 Next Steps

1. **Set up API keys** (start with MapBox for free tier)
2. **Test geocoding** with the test script
3. **Populate existing restaurants** with coordinates
4. **Monitor usage** and optimize as needed
5. **Consider caching** for frequently accessed locations

The geocoding system is now ready to automatically calculate coordinates for all restaurant addresses! 🎉
