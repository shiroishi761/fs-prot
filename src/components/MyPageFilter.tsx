import React from 'react';
import { SearchFilters } from '../types/case';

interface MyPageFilterProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const MyPageFilter: React.FC<MyPageFilterProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div>
        {/* Publication Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            公開ステータス
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="publicationStatus"
                value=""
                checked={!filters.publicationStatus}
                onChange={() => handleFilterChange('publicationStatus', undefined)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>すべて表示</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="publicationStatus"
                value="published"
                checked={filters.publicationStatus === 'published'}
                onChange={() => handleFilterChange('publicationStatus', 'published')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>公開済み</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="publicationStatus"
                value="unpublished"
                checked={filters.publicationStatus === 'unpublished'}
                onChange={() => handleFilterChange('publicationStatus', 'unpublished')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>非公開</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPageFilter;