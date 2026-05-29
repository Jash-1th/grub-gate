const emptyNutritionTotals = () => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
});

const toNutritionNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundNutritionTotals = (totals) => ({
  calories: Math.round(totals.calories),
  protein: Math.round(totals.protein * 10) / 10,
  carbs: Math.round(totals.carbs * 10) / 10,
  fat: Math.round(totals.fat * 10) / 10
});

const addNutritionFromItem = (totals, item = {}) => {
  const nutritionInfo = item.nutritionInfo || item.nutritionalInfo || {};
  const quantity = toNutritionNumber(item.quantity) || 1;
  totals.calories += toNutritionNumber(nutritionInfo.calories) * quantity;
  totals.protein += toNutritionNumber(nutritionInfo.protein) * quantity;
  totals.carbs += toNutritionNumber(nutritionInfo.carbs) * quantity;
  totals.fat += toNutritionNumber(nutritionInfo.fat) * quantity;
  return totals;
};

const calculateNutritionTotalsFromItems = (items = []) => {
  const totals = emptyNutritionTotals();
  items.forEach(item => addNutritionFromItem(totals, item));
  return roundNutritionTotals(totals);
};

const calculateNutritionTotalsFromWeeklyPlans = (weeklyPlans = {}) => {
  const totals = emptyNutritionTotals();
  Object.values(weeklyPlans || {}).forEach(week => {
    Object.values(week || {}).forEach(day => {
      [...(day?.lunch || []), ...(day?.dinner || [])].forEach(item => addNutritionFromItem(totals, item));
    });
  });
  return roundNutritionTotals(totals);
};

const calculateNutritionTotalsFromSubscriptionWeeks = (weeks = []) => {
  const totals = emptyNutritionTotals();
  weeks.forEach(week => {
    Object.values(week?.meals || {}).forEach(dayMeals => {
      [...(dayMeals?.lunch || []), ...(dayMeals?.dinner || [])].forEach(item => addNutritionFromItem(totals, item));
    });
  });
  return roundNutritionTotals(totals);
};

module.exports = {
  emptyNutritionTotals,
  toNutritionNumber,
  roundNutritionTotals,
  addNutritionFromItem,
  calculateNutritionTotalsFromItems,
  calculateNutritionTotalsFromWeeklyPlans,
  calculateNutritionTotalsFromSubscriptionWeeks
};
