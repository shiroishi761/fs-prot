import React, { useState, useEffect, useCallback } from 'react';
import { SearchFilters, INDUSTRIES, REGIONS, COMMON_TAGS } from '../types/case';
import { generateSearchSuggestions } from '../utils/search';
import { mockCases } from '../data/mockCases';

interface SearchBoxProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  filters,
  onFiltersChange,
  onSearch
}) => {
  const [query, setQuery] = useState(filters.query || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);

  // Generate search suggestions
  const updateSuggestions = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length > 0) {
      const newSuggestions = generateSearchSuggestions(mockCases, searchQuery, 8);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // Handle query change
  const handleQueryChange = (value: string) => {
    setQuery(value);
    updateSuggestions(value);
    onFiltersChange({ ...filters, query: value });
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    handleFilterChange('tags', newTags);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onFiltersChange({ ...filters, query: suggestion });
    onSearch();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setQuery('');
    setSelectedTags([]);
    setSuggestions([]);
    setShowSuggestions(false);
    onFiltersChange({});
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch();
  };

  // Handle input blur with delay to allow suggestion clicks
  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  useEffect(() => {
    setQuery(filters.query || '');
    setSelectedTags(filters.tags || []);
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            キーワード検索
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="事例を検索..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => updateSuggestions(query)}
              onBlur={handleInputBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Industry Filter */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              業界
            </label>
            <select
              id="industry"
              value={filters.industry || ''}
              onChange={(e) => handleFilterChange('industry', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">すべての業界</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              地域
            </label>
            <select
              id="region"
              value={filters.region || ''}
              onChange={(e) => handleFilterChange('region', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">すべての地域</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Company Size Filter */}
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
              企業規模
            </label>
            <select
              id="companySize"
              value={filters.companySize || ''}
              onChange={(e) => handleFilterChange('companySize', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">すべての規模</option>
              <option value="small">小規模（〜50名）</option>
              <option value="medium">中規模（50-300名）</option>
              <option value="large">大規模（300名〜）</option>
            </select>
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タグ
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            フィルターをクリア
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            検索
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBox;