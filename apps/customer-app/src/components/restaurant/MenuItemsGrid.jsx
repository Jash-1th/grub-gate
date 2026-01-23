import React from 'react';
import { useTranslation } from 'react-i18next';
import FoodItemCard from './FoodItemCard';

const MenuItemsGrid = ({
  items,
  userType,
  selectedDay,
  selectedMealType,
  restaurantName,
  onItemClick,
  onAddToPlan,
  onRemoveFromPlan,
  isItemInPlan,
  getItemPlanEntries,
  title,
  subtitle,
  emptyStateMessage,
  showProBadges = false,
  isFromMenuSelection = false,
  isMealPlanningEnabled = true,
  compact = false,
  gridClassName,
  week = 0 // Add week parameter for week-aware meal plan checks
}) => {
  const { t } = useTranslation();
  const isPro = userType === 'pro';

  const headerClassName = compact
    ? 'flex items-start justify-between mb-3 gap-3'
    : 'flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0';

  const gridClasses =
    gridClassName ||
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';

  if (!items || items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-gray-600">
          {emptyStateMessage || t('restaurantDetail.noMenuItemsAvailable')}
        </p>
      </div>
    );
  }

  return (
    <div data-menu-items-section={`${userType}`}>
      {/* Header */}
      <div className={headerClassName}>
        <div className="flex items-center">
          <div className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-full flex items-center justify-center mr-3 ${
            isPro ? 'bg-purple-100' : 'bg-green-100'
          }`}>
            <span className={`${compact ? 'text-base' : 'text-lg'} ${isPro ? 'text-purple-600' : 'text-green-600'}`}>
              {isPro && selectedMealType === 'dinner' ? '🌙' : '🍽️'}
            </span>
          </div>
          <div>
            <h3 className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-semibold text-gray-900`}>
              {title || t('restaurantDetail.menuItems')}
            </h3>
            <span className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'} text-gray-500`}>
              ({items.length} {t('restaurantDetail.itemsAvailable')})
            </span>
          </div>
        </div>
        {subtitle && (
          <div className="flex-shrink-0">
            <div className={`${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1 text-xs sm:text-sm'} rounded-full font-medium ${
              isPro 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {subtitle}
            </div>
          </div>
        )}
      </div>

      {/* Items Grid - Modern responsive layout */}
      <div className={gridClasses} data-items-section>
        {items.map((item) => (
          <div 
            key={`${item.id}-${selectedMealType}`} 
            className="relative h-full"
          >
            <FoodItemCard
              item={item}
              onAddToPlan={onAddToPlan ? () => onAddToPlan(item) : () => onItemClick(item)}
              onRemoveFromPlan={onRemoveFromPlan}
              onItemClick={onItemClick}
              selectedDay={selectedDay}
              selectedMealType={selectedMealType}
              restaurantName={restaurantName}
              showClickHint={true}
              hideAddButton={!isMealPlanningEnabled}
              isInPlan={isItemInPlan ? isItemInPlan(item.id) : false}
              planEntries={getItemPlanEntries ? getItemPlanEntries(item.id) : []}
              isMealPlanningEnabled={isMealPlanningEnabled}
              isFromWeeklyMenu={isFromMenuSelection}
              week={week}
            />
            
            {/* Pro Enhancement - Match Badge */}
            {showProBadges && isPro && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                Match: {selectedMealType === 'lunch' ? '92%' : '88%'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItemsGrid;
