import React, { useState, useEffect, useCallback } from 'react';
import { SearchFilters, INDUSTRIES, REGIONS, COMMON_TAGS, AREA_HIERARCHY } from '../types/case';
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
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(filters.industries || (filters.industry ? [filters.industry] : []));
  const [selectedRegion, setSelectedRegion] = useState(filters.region || '');
  const [selectedPrefecture, setSelectedPrefecture] = useState(filters.prefecture || '');
  const [selectedCity, setSelectedCity] = useState(filters.city || '');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showPrefecturePopup, setShowPrefecturePopup] = useState(false);
  const [showCityPopup, setShowCityPopup] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string>('');
  const [hoveredPrefecture, setHoveredPrefecture] = useState<string>('');
  const [popupTimeouts, setPopupTimeouts] = useState<{[key: string]: NodeJS.Timeout}>({});
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCompanySizeDropdown, setShowCompanySizeDropdown] = useState(false);

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

  // Helper function to find region and prefecture for a city
  const findLocationHierarchy = (cityName: string) => {
    for (const [region, prefectures] of Object.entries(AREA_HIERARCHY)) {
      for (const [prefecture, cities] of Object.entries(prefectures)) {
        if (cities.includes(cityName)) {
          return { region, prefecture };
        }
      }
    }
    return null;
  };

  // Handle location selection
  const handleLocationSelect = (type: 'region' | 'prefecture' | 'city', value: string) => {
    if (type === 'region') {
      setSelectedRegion(value);
      setSelectedPrefecture('');
      setSelectedCity('');
      const newFilters = { 
        ...filters, 
        region: value || undefined,
        prefecture: undefined,
        city: undefined
      };
      onFiltersChange(newFilters);
      setShowLocationDropdown(false);
      setShowPrefecturePopup(false);
      setShowCityPopup(false);
      setHoveredRegion('');
      setHoveredPrefecture('');
    } else if (type === 'prefecture') {
      // Find the corresponding region for this prefecture
      const hierarchy = Object.entries(AREA_HIERARCHY).find(([region, prefectures]) => 
        Object.keys(prefectures).includes(value)
      );
      if (hierarchy) {
        setSelectedRegion(hierarchy[0]);
      }
      setSelectedPrefecture(value);
      setSelectedCity('');
      const newFilters = { 
        ...filters,
        region: hierarchy?.[0] || filters.region,
        prefecture: value || undefined,
        city: undefined
      };
      onFiltersChange(newFilters);
      setShowLocationDropdown(false);
      setShowPrefecturePopup(false);
      setShowCityPopup(false);
      setHoveredRegion('');
      setHoveredPrefecture('');
    } else if (type === 'city') {
      // Find the corresponding region and prefecture for this city
      const hierarchy = findLocationHierarchy(value);
      if (hierarchy) {
        setSelectedRegion(hierarchy.region);
        setSelectedPrefecture(hierarchy.prefecture);
      }
      setSelectedCity(value);
      const newFilters = { 
        ...filters,
        region: hierarchy?.region || filters.region,
        prefecture: hierarchy?.prefecture || filters.prefecture,
        city: value || undefined
      };
      onFiltersChange(newFilters);
      setShowLocationDropdown(false);
      setShowPrefecturePopup(false);
      setShowCityPopup(false);
      setHoveredRegion('');
      setHoveredPrefecture('');
    }
  };

  // Get display text for location selector
  const getLocationDisplayText = () => {
    if (selectedCity) {
      return `${selectedRegion} > ${selectedPrefecture} > ${selectedCity}`;
    } else if (selectedPrefecture) {
      return `${selectedRegion} > ${selectedPrefecture}`;
    } else if (selectedRegion) {
      return selectedRegion;
    }
    return 'すべての地域';
  };

  // Helper functions for popup management
  const clearPopupTimeout = (key: string) => {
    if (popupTimeouts[key]) {
      clearTimeout(popupTimeouts[key]);
      setPopupTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[key];
        return newTimeouts;
      });
    }
  };


  // Handle industry selection
  const handleIndustryToggle = (industry: string) => {
    const newSelectedIndustries = selectedIndustries.includes(industry)
      ? selectedIndustries.filter(i => i !== industry)
      : [...selectedIndustries, industry];
    
    setSelectedIndustries(newSelectedIndustries);
    handleFilterChange('industries', newSelectedIndustries.length > 0 ? newSelectedIndustries : undefined);
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
    setSelectedIndustries([]);
    setSelectedRegion('');
    setSelectedPrefecture('');
    setSelectedCity('');
    setSuggestions([]);
    setShowSuggestions(false);
    setShowLocationDropdown(false);
    setShowPrefecturePopup(false);
    setShowCityPopup(false);
    setShowIndustryDropdown(false);
    setShowCompanySizeDropdown(false);
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
    setSelectedIndustries(filters.industries || (filters.industry ? [filters.industry] : []));
    setSelectedRegion(filters.region || '');
    setSelectedPrefecture(filters.prefecture || '');
    setSelectedCity(filters.city || '');
  }, [filters]);


  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(popupTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [popupTimeouts]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside location dropdown
      if (!target.closest('.location-filter')) {
        setShowLocationDropdown(false);
        setShowPrefecturePopup(false);
        setShowCityPopup(false);
        setHoveredRegion('');
        setHoveredPrefecture('');
      }
      
      // Check if click is outside industry dropdown
      if (!target.closest('.industry-filter')) {
        setShowIndustryDropdown(false);
      }
      
      // Check if click is outside company size dropdown
      if (!target.closest('.company-size-filter')) {
        setShowCompanySizeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get available prefectures based on hovered or selected region
  const getAvailablePrefectures = () => {
    const region = hoveredRegion || selectedRegion;
    if (!region || !AREA_HIERARCHY[region as keyof typeof AREA_HIERARCHY]) {
      return [];
    }
    return Object.keys(AREA_HIERARCHY[region as keyof typeof AREA_HIERARCHY]);
  };

  // Get available cities based on hovered or selected prefecture
  const getAvailableCities = () => {
    const region = hoveredRegion || selectedRegion;
    const prefecture = hoveredPrefecture || selectedPrefecture;
    if (!region || !prefecture) {
      return [];
    }
    const regionData = AREA_HIERARCHY[region as keyof typeof AREA_HIERARCHY];
    return regionData[prefecture as keyof typeof regionData] || [];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 mb-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input */}
        <div className="relative">
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Location Filter */}
          <div className="relative location-filter">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              地域
            </label>
            <button
              type="button"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex justify-between items-center"
            >
            <span className={selectedRegion ? 'text-gray-900' : 'text-gray-500'}>
              {getLocationDisplayText()}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Location Dropdown */}
          {showLocationDropdown && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-300 rounded-md shadow-lg z-50">
              <div className="overflow-visible">
                <button
                  type="button"
                  onClick={() => handleLocationSelect('region', '')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-500"
                >
                  すべての地域
                </button>
                {REGIONS.map((region) => (
                  <div 
                    key={region} 
                    className="relative"
                    onMouseEnter={() => {
                      clearPopupTimeout('prefecture');
                      setHoveredRegion(region);
                      setShowPrefecturePopup(true);
                    }}
                    onMouseLeave={() => {
                      // タイムアウトによる自動クローズを無効化
                      // 他のエリアをクリックした時のみ閉じる
                    }}
                  >
                    <div className="relative">
                      <button
                        type="button"
                        data-region={region}
                        onClick={() => handleLocationSelect('region', region)}
                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 flex justify-between items-center ${
                          selectedRegion === region ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        <span>{region}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Prefecture Popup */}
                    {showPrefecturePopup && hoveredRegion === region && (
                      <div 
                        className="prefecture-popup absolute left-full top-0 ml-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-[9999] overflow-visible"
                        onMouseEnter={() => {
                          clearPopupTimeout('prefecture');
                          clearPopupTimeout('city');
                          setShowPrefecturePopup(true);
                          setHoveredRegion(region);
                        }}
                        onMouseLeave={() => {
                          // タイムアウトによる自動クローズを無効化
                        }}
                      >
                        <div className="overflow-visible">
                          {getAvailablePrefectures().map((prefecture) => (
                            <div key={prefecture} className="relative overflow-visible">
                              <div
                                onMouseEnter={() => {
                                  clearPopupTimeout('city');
                                  setHoveredPrefecture(prefecture);
                                  setShowCityPopup(true);
                                }}
                                onMouseLeave={() => {
                                  // タイムアウトによる自動クローズを無効化
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleLocationSelect('prefecture', prefecture)}
                                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 flex justify-between items-center ${
                                    selectedPrefecture === prefecture ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                                  }`}
                                >
                                  <span>{prefecture}</span>
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>

                              {/* City Popup */}
                              {showCityPopup && hoveredPrefecture === prefecture && (
                                <div 
                                  className="city-popup absolute left-full top-0 ml-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-[9999] overflow-visible"
                                  onMouseEnter={() => {
                                    clearPopupTimeout('city');
                                    clearPopupTimeout('prefecture');
                                    setShowCityPopup(true);
                                    setHoveredPrefecture(prefecture);
                                  }}
                                  onMouseLeave={() => {
                                    // タイムアウトによる自動クローズを無効化
                                  }}
                                >
                                  <div className="overflow-visible">
                                    {getAvailableCities().map((city) => (
                                      <button
                                        key={city}
                                        type="button"
                                        onClick={() => handleLocationSelect('city', city)}
                                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 ${
                                          selectedCity === city ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                                        }`}
                                      >
                                        {city}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* Industry Filter */}
          <div className="relative industry-filter">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              業種
            </label>
            <button
              type="button"
              onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex justify-between items-center"
            >
              <span className={selectedIndustries.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                {selectedIndustries.length > 0 
                  ? `${selectedIndustries.length}件選択中`
                  : 'すべての業種'}
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Industry Dropdown */}
            {showIndustryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndustries([]);
                      handleFilterChange('industries', undefined);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    すべて解除
                  </button>
                </div>
                {INDUSTRIES.map((industry) => (
                  <label
                    key={industry}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIndustries.includes(industry)}
                      onChange={() => handleIndustryToggle(industry)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">{industry}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Company Size Filter */}
          <div className="relative company-size-filter">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              企業規模
            </label>
            <button
              type="button"
              onClick={() => setShowCompanySizeDropdown(!showCompanySizeDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex justify-between items-center"
            >
              <span className={filters.companySize ? 'text-gray-900' : 'text-gray-500'}>
                {filters.companySize === 'small' && '小規模（〜50名）'}
                {filters.companySize === 'medium' && '中規模（50-300名）'}
                {filters.companySize === 'large' && '大規模（300名〜）'}
                {!filters.companySize && 'すべての規模'}
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Company Size Dropdown */}
            {showCompanySizeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => {
                    handleFilterChange('companySize', undefined);
                    setShowCompanySizeDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-500"
                >
                  すべての規模
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFilterChange('companySize', 'small');
                    setShowCompanySizeDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 ${
                    filters.companySize === 'small' ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  小規模（〜50名）
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFilterChange('companySize', 'medium');
                    setShowCompanySizeDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 ${
                    filters.companySize === 'medium' ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  中規模（50-300名）
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFilterChange('companySize', 'large');
                    setShowCompanySizeDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 ${
                    filters.companySize === 'large' ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  大規模（300名〜）
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Tags Section */}
        <div>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
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

        {/* Favorites and Clear Filter Row */}
        <div className="flex justify-between items-center">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.favorites || false}
              onChange={(e) => handleFilterChange('favorites', e.target.checked || undefined)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>お気に入りのみ表示</span>
          </label>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            フィルターをクリア
          </button>
        </div>

        {/* Search Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-medium transition-colors"
          >
            検索
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBox;