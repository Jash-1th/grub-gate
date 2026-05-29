export const emptyNutritionTotals = () => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
});

export const toNutritionNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const roundNutritionTotals = (totals) => ({
  calories: Math.round(totals.calories),
  protein: Math.round(totals.protein * 10) / 10,
  carbs: Math.round(totals.carbs * 10) / 10,
  fat: Math.round(totals.fat * 10) / 10
});

export const addNutritionFromItem = (totals, item = {}) => {
  const nutritionInfo = item.nutritionInfo || item.nutritionalInfo || {};
  const quantity = toNutritionNumber(item.quantity) || 1;
  totals.calories += toNutritionNumber(nutritionInfo.calories) * quantity;
  totals.protein += toNutritionNumber(nutritionInfo.protein) * quantity;
  totals.carbs += toNutritionNumber(nutritionInfo.carbs) * quantity;
  totals.fat += toNutritionNumber(nutritionInfo.fat) * quantity;
  return totals;
};

export const calculateNutritionTotalsFromItems = (items = []) => {
  const totals = emptyNutritionTotals();
  items.forEach(item => addNutritionFromItem(totals, item));
  return roundNutritionTotals(totals);
};

export const calculateNutritionTotalsFromWeeklyPlans = (weeklyPlans = {}) => {
  const totals = emptyNutritionTotals();
  Object.values(weeklyPlans || {}).forEach(week => {
    Object.values(week || {}).forEach(day => {
      [...(day?.lunch || []), ...(day?.dinner || [])].forEach(item => addNutritionFromItem(totals, item));
    });
  });
  return roundNutritionTotals(totals);
};

export const hasNutritionTotals = (totals = {}) => (
  toNutritionNumber(totals.calories) > 0 ||
  toNutritionNumber(totals.protein) > 0 ||
  toNutritionNumber(totals.carbs) > 0 ||
  toNutritionNumber(totals.fat) > 0
);
