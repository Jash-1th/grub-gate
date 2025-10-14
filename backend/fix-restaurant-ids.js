const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');

async function cleanupInvalidRestaurantIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    
    console.log('🧹 CLEANING UP INVALID RESTAURANT IDs');
    console.log('='.repeat(50));
    
    // Get all partner users with restaurantId
    const partners = await User.find({ 
      roles: 'partner',
      restaurantId: { $exists: true }
    }).select('_id firstName lastName email restaurantId');
    
    console.log('👥 Partners with restaurantId:', partners.length);
    
    for (const partner of partners) {
      console.log('');
      console.log('🔍 Checking partner:', partner.firstName, partner.lastName);
      console.log('  Email:', partner.email);
      console.log('  Current restaurantId:', partner.restaurantId);
      
      // Check if restaurant exists and partner owns it
      const restaurant = await Restaurant.findById(partner.restaurantId);
      
      if (!restaurant) {
        console.log('  ❌ Restaurant not found - INVALID ID');
        
        // Find restaurant by ownerId
        const ownedRestaurant = await Restaurant.findOne({ ownerId: partner._id });
        
        if (ownedRestaurant) {
          console.log('  ✅ Found owned restaurant:', ownedRestaurant.name);
          console.log('  🔧 Updating restaurantId to:', ownedRestaurant._id);
          
          await User.findByIdAndUpdate(partner._id, { 
            restaurantId: ownedRestaurant._id 
          });
        } else {
          console.log('  ⚠️ No owned restaurant found - clearing restaurantId');
          
          await User.findByIdAndUpdate(partner._id, { 
            $unset: { restaurantId: 1 } 
          });
        }
      } else {
        console.log('  ✅ Restaurant exists:', restaurant.name);
        
        // Check if partner owns this restaurant
        if (restaurant.ownerId.toString() === partner._id.toString()) {
          console.log('  ✅ Valid ownership - partner owns this restaurant');
        } else {
          console.log('  ❌ Invalid ownership - partner does not own this restaurant');
          console.log('  🔧 Looking for correct restaurant...');
          
          // Find restaurant by ownerId
          const ownedRestaurant = await Restaurant.findOne({ ownerId: partner._id });
          
          if (ownedRestaurant) {
            console.log('  ✅ Found owned restaurant:', ownedRestaurant.name);
            console.log('  🔧 Updating restaurantId to:', ownedRestaurant._id);
            
            await User.findByIdAndUpdate(partner._id, { 
              restaurantId: ownedRestaurant._id 
            });
          } else {
            console.log('  ⚠️ No owned restaurant found - clearing restaurantId');
            
            await User.findByIdAndUpdate(partner._id, { 
              $unset: { restaurantId: 1 } 
            });
          }
        }
      }
    }
    
    console.log('');
    console.log('✅ CLEANUP COMPLETE - All invalid restaurantIds fixed');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

cleanupInvalidRestaurantIds();
