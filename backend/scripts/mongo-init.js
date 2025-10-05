// FILE: scripts/mongo-init.js
// MongoDB initialization script for Docker

// Switch to grubgate database
db = db.getSiblingDB('grubgate');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'firstName', 'lastName', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        role: {
          enum: ['customer', 'partner', 'admin']
        }
      }
    }
  }
});

db.createCollection('restaurants', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'owner', 'address', 'contactInfo'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1
        },
        isActive: {
          bsonType: 'bool'
        }
      }
    }
  }
});

db.createCollection('menuitems', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'restaurant', 'price', 'category'],
      properties: {
        price: {
          bsonType: 'number',
          minimum: 0
        },
        isAvailable: {
          bsonType: 'bool'
        }
      }
    }
  }
});

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['customer', 'restaurant', 'items', 'totalAmount'],
      properties: {
        status: {
          enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
        },
        totalAmount: {
          bsonType: 'number',
          minimum: 0
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 });
db.users.createIndex({ role: 1 });

db.restaurants.createIndex({ owner: 1 });
db.restaurants.createIndex({ 'address.city': 1 });
db.restaurants.createIndex({ cuisineType: 1 });
db.restaurants.createIndex({ isActive: 1 });

db.menuitems.createIndex({ restaurant: 1 });
db.menuitems.createIndex({ category: 1 });
db.menuitems.createIndex({ isAvailable: 1 });

db.orders.createIndex({ customer: 1 });
db.orders.createIndex({ restaurant: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

print('✅ GrubGate database initialized successfully!');
