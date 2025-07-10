import React from 'react';
import { SearchFilters } from '../types/case';

interface SearchConditionTagsProps {
  filters: SearchFilters;
  onRemoveFilter: (filterType: keyof SearchFilters, value?: string) => void;
}

const SearchConditionTags: React.FC<SearchConditionTagsProps> = ({
  filters,
  onRemoveFilter
}) => {
  // Check if there are any active filters
  const hasActiveFilters = !!(
    filters.query ||
    filters.industry ||
    filters.region ||
    (filters.industries && filters.industries.length > 0) ||
    (filters.regions && filters.regions.length > 0) ||
    filters.prefecture ||
    filters.city ||
    (filters.tags && filters.tags.length > 0) ||
    filters.favorites ||
    filters.publicationStatus
  );

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-4">
      <span>検索条件:</span>
      
      {/* Query tag */}
      {filters.query && (
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
          <span>"{filters.query}"</span>
          <button
            onClick={() => onRemoveFilter('query')}
            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            title="検索キーワードを削除"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Industry tags */}
      {filters.industries && filters.industries.map((industry) => (
        <div key={industry} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
          <span>{industry}</span>
          <button
            onClick={() => onRemoveFilter('industries', industry)}
            className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
            title={`業種「${industry}」を削除`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* Legacy industry tag for backward compatibility */}
      {filters.industry && !filters.industries && (
        <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
          <span>{filters.industry}</span>
          <button
            onClick={() => onRemoveFilter('industry')}
            className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
            title="業種フィルターを削除"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Region tags */}
      {filters.regions && filters.regions.map((region) => (
        <div key={region} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
          <span>{region}</span>
          <button
            onClick={() => onRemoveFilter('regions', region)}
            className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
            title={`地域「${region}」を削除`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* Legacy location tag for backward compatibility */}
      {(filters.region || filters.prefecture || filters.city) && !filters.regions && (
        <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
          <span>
            {[filters.region, filters.prefecture, filters.city].filter(Boolean).join(' > ')}
          </span>
          <button
            onClick={() => onRemoveFilter('region')}
            className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
            title="地域フィルターを削除"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Individual tag filters */}
      {filters.tags && filters.tags.map((tag) => (
        <div key={tag} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center gap-2">
          <span>{tag}</span>
          <button
            onClick={() => onRemoveFilter('tags', tag)}
            className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
            title={`タグ「${tag}」を削除`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* Favorites tag */}
      {filters.favorites && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-2">
          <span>お気に入りのみ</span>
          <button
            onClick={() => onRemoveFilter('favorites')}
            className="hover:bg-yellow-200 rounded-full p-0.5 transition-colors"
            title="お気に入りフィルターを削除"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Publication Status tag */}
      {filters.publicationStatus && (
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2">
          <span>
            {filters.publicationStatus === 'published' && '公開済み'}
            {filters.publicationStatus === 'unpublished' && '非公開'}
          </span>
          <button
            onClick={() => onRemoveFilter('publicationStatus')}
            className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
            title="公開ステータスフィルターを削除"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchConditionTags;