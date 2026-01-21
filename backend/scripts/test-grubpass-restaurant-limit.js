const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

const NORMAL_IDENTIFIER = process.env.NORMAL_IDENTIFIER;
const NORMAL_PASSWORD = process.env.NORMAL_PASSWORD;
const GRUBPASS_IDENTIFIER = process.env.GRUBPASS_IDENTIFIER;
const GRUBPASS_PASSWORD = process.env.GRUBPASS_PASSWORD;

const assertEnv = () => {
  const missing = [];
  if (!NORMAL_IDENTIFIER) missing.push('NORMAL_IDENTIFIER');
  if (!NORMAL_PASSWORD) missing.push('NORMAL_PASSWORD');
  if (!GRUBPASS_IDENTIFIER) missing.push('GRUBPASS_IDENTIFIER');
  if (!GRUBPASS_PASSWORD) missing.push('GRUBPASS_PASSWORD');

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
};

const login = async ({ identifier, password }) => {
  const res = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
    identifier,
    password
  });

  const accessToken = res?.data?.data?.accessToken;
  if (!accessToken) {
    throw new Error(`Login succeeded but accessToken missing. Response keys: ${Object.keys(res?.data?.data || {}).join(', ')}`);
  }

  return {
    accessToken,
    user: res?.data?.data?.user
  };
};

const getRestaurants = async () => {
  const res = await axios.get(`${API_BASE_URL}/api/v1/restaurants`, {
    params: { limit: 10, page: 1 }
  });

  const restaurants = res?.data?.data;
  if (!Array.isArray(restaurants) || restaurants.length < 3) {
    throw new Error(`Expected at least 3 restaurants from API, got: ${Array.isArray(restaurants) ? restaurants.length : typeof restaurants}`);
  }

  return restaurants.slice(0, 3).map((r) => ({
    id: (r._id || r.id || '').toString(),
    name: r.name
  }));
};

const getSelectedRestaurants = async (accessToken) => {
  const res = await axios.get(`${API_BASE_URL}/api/v1/meal-plans/selected-restaurants`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res?.data?.data?.selectedRestaurants || [];
};

const clearSelectedRestaurants = async (accessToken) => {
  const selected = await getSelectedRestaurants(accessToken);
  if (!selected.length) return;

  for (const r of selected) {
    const restaurantId = (r.restaurantId || r._id || r.id || '').toString();
    if (!restaurantId) continue;

    await axios.delete(`${API_BASE_URL}/api/v1/meal-plans/selected-restaurants/${restaurantId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }
};

const addSelectedRestaurant = async (accessToken, restaurant) => {
  return axios.post(
    `${API_BASE_URL}/api/v1/meal-plans/selected-restaurants`,
    { restaurant },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

const runScenario = async ({ label, accessToken, expectThirdToFail }, restaurants) => {
  console.log(`\n=== Scenario: ${label} ===`);

  await clearSelectedRestaurants(accessToken);

  const results = [];
  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    try {
      const res = await addSelectedRestaurant(accessToken, restaurant);
      const selectedCount = res?.data?.data?.selectedRestaurants?.length;
      results.push({ index: i + 1, ok: true, selectedCount });
      console.log(`Add #${i + 1}: OK (selected count: ${selectedCount ?? 'unknown'})`);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message;
      results.push({ index: i + 1, ok: false, status, message });
      console.log(`Add #${i + 1}: FAIL (status: ${status ?? 'unknown'}) - ${message}`);
    }
  }

  const third = results[2];
  if (!third) throw new Error('Internal: missing 3rd add result');

  if (expectThirdToFail) {
    if (third.ok) {
      throw new Error(`[${label}] Expected 3rd restaurant to FAIL, but it SUCCEEDED.`);
    }
    if (third.status !== 400) {
      throw new Error(`[${label}] Expected 3rd restaurant to fail with 400, got ${third.status}`);
    }
  } else {
    if (!third.ok) {
      throw new Error(`[${label}] Expected 3rd restaurant to SUCCEED, but it FAILED (status ${third.status}).`);
    }
  }

  console.log(`Result: PASS (${label})`);
};

(async () => {
  try {
    assertEnv();

    console.log(`API_BASE_URL: ${API_BASE_URL}`);

    const [normalAuth, grubPassAuth, restaurants] = await Promise.all([
      login({ identifier: NORMAL_IDENTIFIER, password: NORMAL_PASSWORD }),
      login({ identifier: GRUBPASS_IDENTIFIER, password: GRUBPASS_PASSWORD }),
      getRestaurants()
    ]);

    console.log(`Normal user id: ${normalAuth.user?._id || 'unknown'}`);
    console.log(`Grub Pass user id: ${grubPassAuth.user?._id || 'unknown'}`);

    console.log('\nUsing restaurants:');
    restaurants.forEach((r, idx) => console.log(`#${idx + 1} ${r.id} - ${r.name}`));

    await runScenario(
      { label: 'Normal user (should FAIL on 3rd)', accessToken: normalAuth.accessToken, expectThirdToFail: true },
      restaurants
    );

    await runScenario(
      { label: 'Grub Pass user (should ALLOW 3rd+)', accessToken: grubPassAuth.accessToken, expectThirdToFail: false },
      restaurants
    );

    console.log('\nALL TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error('\nTEST FAILED');
    console.error(err?.stack || err?.message || err);
    process.exit(1);
  }
})();
