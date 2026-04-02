require('dotenv').config();
const connectDB = require('../src/config/database');
const Restaurant = require('../src/models/Restaurant');
require('../src/models/Review');
require('../src/models/PublicRestaurantReview');

const run = async () => {
  await connectDB();

  const restaurants = await Restaurant.find({});
  console.log(`Found ${restaurants.length} restaurants`);

  let updated = 0;
  for (const r of restaurants) {
    const before = { rating: r.rating, reviewCount: r.reviewCount };
    await r.updateRating();
    const after = { rating: r.rating, reviewCount: r.reviewCount };

    if (before.rating !== after.rating || before.reviewCount !== after.reviewCount) {
      updated += 1;
      console.log(`${r.name}: ${before.rating} (${before.reviewCount}) -> ${after.rating} (${after.reviewCount})`);
    }
  }

  console.log(`Done. Updated ${updated} restaurants.`);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
