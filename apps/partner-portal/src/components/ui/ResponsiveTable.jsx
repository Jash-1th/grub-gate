import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { Card, CardContent } from '@grub-gate/ui';

/**
 * ResponsiveTable Component
 * Automatically switches between table and card layout based on screen size
 * SSR-safe with proper responsive handling
 */
const ResponsiveTable = ({ 
  columns, 
  data, 
  onRowClick,
  className = '',
  cardClassName = '',
  tableClassName = '',
  emptyState = null,
  loading = false,
  loadingRows = 3
}) => {
  const { isMobile, isTablet, isClient } = useResponsive();
  const showMobileLayout = isClient && (isMobile || isTablet);

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: loadingRows }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return emptyState || (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Mobile/Tablet Card Layout
  if (showMobileLayout) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((row, index) => (
          <Card 
            key={row.id || index} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${cardClassName}`}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                {columns.map((column) => {
                  if (column.hideOnMobile) return null;
                  
                  const value = column.accessor ? row[column.accessor] : column.cell?.(row);
                  
                  return (
                    <div key={column.key || column.header} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600 min-w-0 flex-1">
                        {column.header}:
                      </span>
                      <div className="text-sm text-gray-900 text-right min-w-0 flex-1 ml-2">
                        {column.cell ? column.cell(row) : value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop Table Layout
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className={`w-full ${tableClassName}`}>
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.key || column.header}
                    className={`text-left py-4 px-6 font-semibold text-gray-900 ${column.headerClassName || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr 
                  key={row.id || index}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key || column.header}
                      className={`py-4 px-6 ${column.cellClassName || ''}`}
                    >
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponsiveTable;
