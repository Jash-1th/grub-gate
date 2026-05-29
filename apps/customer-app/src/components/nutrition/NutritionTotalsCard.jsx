import React from 'react';
import { hasNutritionTotals } from '../../utils/nutritionTotals';

const NutritionTotalsCard = ({ totals, title = 'Nutrition Totals', subtitle = 'All planned meals combined', compact = false }) => {
  if (!hasNutritionTotals(totals)) return null;

  const stats = [
    { label: 'Calories', value: Math.round(totals.calories || 0), suffix: '', className: 'bg-blue-50 text-blue-700' },
    { label: 'Protein', value: totals.protein || 0, suffix: 'g', className: 'bg-green-50 text-green-700' },
    { label: 'Carbs', value: totals.carbs || 0, suffix: 'g', className: 'bg-yellow-50 text-yellow-700' },
    { label: 'Fat', value: totals.fat || 0, suffix: 'g', className: 'bg-purple-50 text-purple-700' }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="mb-4">
        <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-gray-900`}>{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className={`rounded-xl p-3 ${stat.className}`}>
            <div className="text-xs font-semibold opacity-80">{stat.label}</div>
            <div className="mt-1 text-lg font-bold">
              {stat.value}{stat.suffix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionTotalsCard;
