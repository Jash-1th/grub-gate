// FILE: backend/update-restaurant-delivery.js
/**
 * Update Maple Leaf Bistro with delivery zone configuration
 * Run this script to add delivery zone and location data
 */

// Manual restaurant update data
const restaurantUpdate = {
  _id: '68e73d168c18e7fd776a6327',
  name: 'Maple Leaf Bistro',
  
  // Add delivery zone configuration
  deliveryZone: {
    radius: 5.0,        // 5km delivery radius
    fee: 2.99,          // $2.99 delivery fee
    minOrder: 15.00,    // $15 minimum order
    enabled: true       // Delivery enabled
  },
  
  // Add location coordinates (Toronto)
  location: {
    type: 'Point',
    coordinates: [-79.3871, 43.6426] // [longitude, latitude]
  }
};

console.log('🏪 Restaurant Update Configuration:');
console.log(JSON.stringify(restaurantUpdate, null, 2));

console.log('\n📋 To apply this update:');
console.log('1. Use MongoDB Compass or Atlas dashboard');
console.log('2. Find restaurant with ID: 68e73d168c18e7fd776a6327');
console.log('3. Add the deliveryZone and location fields shown above');

console.log('\n🔧 Or use this MongoDB update command:');
console.log(`
db.restaurants.updateOne(
  { _id: ObjectId("68e73d168c18e7fd776a6327") },
  { 
    $set: {
      "deliveryZone": {
        "radius": 5.0,
        "fee": 2.99,
        "minOrder": 15.00,
        "enabled": true
      },
      "location": {
        "type": "Point",
        "coordinates": [-79.3871, 43.6426]
      }
    }
  }
)
`);

module.exports = restaurantUpdate;
