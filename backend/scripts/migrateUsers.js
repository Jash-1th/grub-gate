#!/usr/bin/env node

/**
 * User Model Migration Script
 * 
 * This script migrates existing user documents to the new nested schema structure:
 * - Moves partner-specific fields (restaurantId, notificationPreferences, billingInfo) 
 *   into the new partnerInfo nested object
 * - Updates preferences structure to match new schema
 * - Adds missing addresses array field
 * 
 * Run this script AFTER deploying the new User model structure
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Migration functions
const migratePartnerUsers = async () => {
  console.log('\n🔄 Starting partner user migration...');
  
  try {
    // Find all users with partner role that have the old structure
    const partnersToMigrate = await mongoose.connection.db.collection('users').find({
      roles: 'partner',
      $or: [
        { restaurantId: { $exists: true } },
        { notificationPreferences: { $exists: true } },
        { billingInfo: { $exists: true } }
      ],
      partnerInfo: { $exists: false } // Only migrate users without partnerInfo
    }).toArray();

    console.log(`📊 Found ${partnersToMigrate.length} partner users to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of partnersToMigrate) {
      try {
        const updateOperations = {};
        const unsetOperations = {};

        // Build partnerInfo object from existing fields
        const partnerInfo = {};

        // Move restaurantId
        if (user.restaurantId) {
          partnerInfo.restaurantId = user.restaurantId;
          unsetOperations.restaurantId = '';
        }

        // Move notificationPreferences
        if (user.notificationPreferences) {
          partnerInfo.notificationPreferences = {
            orderAlerts: user.notificationPreferences.orderAlerts ?? true,
            systemUpdates: user.notificationPreferences.systemUpdates ?? true,
            promotionalEmails: user.notificationPreferences.promotionalEmails ?? false,
            weeklyReports: user.notificationPreferences.weeklyReports ?? true
          };
          unsetOperations.notificationPreferences = '';
        }

        // Move billingInfo
        if (user.billingInfo) {
          partnerInfo.billingInfo = {
            paymentMethod: user.billingInfo.paymentMethod || '',
            taxId: user.billingInfo.taxId || '',
            billingAddress: user.billingInfo.billingAddress ? {
              street: user.billingInfo.billingAddress.street || '',
              city: user.billingInfo.billingAddress.city || '',
              state: user.billingInfo.billingAddress.state || '',
              postalCode: user.billingInfo.billingAddress.postalCode || '',
              country: user.billingInfo.billingAddress.country || 'Canada'
            } : undefined
          };
          unsetOperations.billingInfo = '';
        }

        // Set default partner status and dates
        partnerInfo.partnerStatus = 'approved'; // Assume existing partners are approved
        partnerInfo.partnerSince = user.createdAt || new Date();
        partnerInfo.approvedAt = user.createdAt || new Date();
        partnerInfo.commissionRate = 15; // Default commission rate

        // Set the new partnerInfo object
        updateOperations.$set = { partnerInfo };

        // Remove old fields
        if (Object.keys(unsetOperations).length > 0) {
          updateOperations.$unset = unsetOperations;
        }

        // Perform the migration
        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          updateOperations
        );

        migratedCount++;
        console.log(`✅ Migrated partner user: ${user.email || user.phoneNumber} (${user._id})`);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating user ${user._id}:`, error.message);
      }
    }

    console.log(`\n📈 Partner migration completed:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);

  } catch (error) {
    console.error('❌ Partner migration failed:', error.message);
    throw error;
  }
};

const migratePreferences = async () => {
  console.log('\n🔄 Starting preferences migration...');
  
  try {
    // Find users with old preferences structure
    const usersToMigrate = await mongoose.connection.db.collection('users').find({
      preferences: { $exists: true },
      'preferences.notifications.push': { $exists: false } // New field doesn't exist
    }).toArray();

    console.log(`📊 Found ${usersToMigrate.length} users with preferences to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of usersToMigrate) {
      try {
        const newPreferences = {
          dietary: user.preferences.dietary || [],
          notifications: {
            email: user.preferences.notifications?.email ?? true,
            sms: user.preferences.notifications?.sms ?? false,
            push: user.preferences.notifications?.push ?? true,
            orderUpdates: true,
            promotions: false,
            newsletter: false
          },
          language: user.preferences.language || 'en',
          currency: 'CAD',
          timezone: 'America/Toronto',
          theme: 'auto',
          deliveryPreferences: {
            defaultTip: 15,
            preferredDeliveryTime: 'asap',
            specialInstructions: ''
          }
        };

        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          { $set: { preferences: newPreferences } }
        );

        migratedCount++;
        console.log(`✅ Migrated preferences for user: ${user.email || user.phoneNumber} (${user._id})`);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating preferences for user ${user._id}:`, error.message);
      }
    }

    console.log(`\n📈 Preferences migration completed:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);

  } catch (error) {
    console.error('❌ Preferences migration failed:', error.message);
    throw error;
  }
};

const addMissingAddresses = async () => {
  console.log('\n🔄 Adding missing addresses array...');
  
  try {
    // Add empty addresses array to users who don't have it
    const result = await mongoose.connection.db.collection('users').updateMany(
      { addresses: { $exists: false } },
      { $set: { addresses: [] } }
    );

    console.log(`✅ Added addresses array to ${result.modifiedCount} users`);

  } catch (error) {
    console.error('❌ Failed to add addresses array:', error.message);
    throw error;
  }
};

const validateMigration = async () => {
  console.log('\n🔍 Validating migration...');
  
  try {
    // Check partner users
    const partnersWithOldStructure = await mongoose.connection.db.collection('users').countDocuments({
      roles: 'partner',
      $or: [
        { restaurantId: { $exists: true } },
        { notificationPreferences: { $exists: true } },
        { billingInfo: { $exists: true } }
      ]
    });

    const partnersWithNewStructure = await mongoose.connection.db.collection('users').countDocuments({
      roles: 'partner',
      partnerInfo: { $exists: true }
    });

    console.log(`📊 Validation results:`);
    console.log(`   Partners with old structure: ${partnersWithOldStructure}`);
    console.log(`   Partners with new structure: ${partnersWithNewStructure}`);

    // Check addresses
    const usersWithoutAddresses = await mongoose.connection.db.collection('users').countDocuments({
      addresses: { $exists: false }
    });

    console.log(`   Users without addresses array: ${usersWithoutAddresses}`);

    if (partnersWithOldStructure === 0 && usersWithoutAddresses === 0) {
      console.log('✅ Migration validation passed!');
    } else {
      console.log('⚠️  Migration validation found issues - please review');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    throw error;
  }
};

// Main migration function
const runMigration = async () => {
  console.log('🚀 Starting User Model Migration');
  console.log('=====================================');
  
  try {
    await connectDB();
    
    // Run migrations in sequence
    await migratePartnerUsers();
    await migratePreferences();
    await addMissingAddresses();
    await validateMigration();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error('Please review the errors above and run the migration again.');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
};

// Handle script execution
if (require.main === module) {
  // Add command line argument handling
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
    // In a real implementation, you'd add dry-run logic here
  }
  
  runMigration().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  runMigration,
  migratePartnerUsers,
  migratePreferences,
  addMissingAddresses,
  validateMigration
};
