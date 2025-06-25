import { useState, useCallback } from 'react';
import { SearchFilters, SearchResult, Case } from '../types/case';
import { searchCases } from '../utils/search';

/**
 * 検索機能を管理するカスタムフック
 */
export const useSearch = (cases: Case[], favorites: Set<string>) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * 検索結果を更新する（公開済み事例のみ）
   */
  const updateSearchResults = useCallback((newFilters?: SearchFilters) => {
    const searchFilters = { ...(newFilters || filters), publicationStatus: 'published' as const };
    const results = searchCases(cases, searchFilters, favorites);
    setSearchResults(results);
  }, [filters, cases, favorites]);

  /**
   * 検索を実行する
   */
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    updateSearchResults();
    setLoading(false);
  };

  /**
   * フィルターを変更する
   */
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Auto-search when filters change (except for query)
    const filtersChanged = Object.keys(newFilters).some(key => {
      if (key === 'query') return false;
      return newFilters[key as keyof SearchFilters] !== filters[key as keyof SearchFilters];
    });
    
    if (filtersChanged) {
      // Perform search automatically when non-query filters change
      setTimeout(() => {
        updateSearchResults(newFilters);
        setHasSearched(true);
      }, 100);
    }
  };

  /**
   * 個別フィルターを削除する
   */
  const handleRemoveFilter = (filterType: keyof SearchFilters, value?: string) => {
    const newFilters = { ...filters };
    
    if (filterType === 'tags' && value) {
      // Remove specific tag
      const updatedTags = filters.tags?.filter(tag => tag !== value) || [];
      newFilters.tags = updatedTags.length > 0 ? updatedTags : undefined;
    } else if (filterType === 'industries' && value) {
      // Remove specific industry
      const updatedIndustries = filters.industries?.filter(industry => industry !== value) || [];
      newFilters.industries = updatedIndustries.length > 0 ? updatedIndustries : undefined;
    } else if (filterType === 'regions' && value) {
      // Remove specific region
      const updatedRegions = filters.regions?.filter(region => region !== value) || [];
      newFilters.regions = updatedRegions.length > 0 ? updatedRegions : undefined;
    } else if (filterType === 'city') {
      // Remove city but keep prefecture and region
      newFilters.city = undefined;
    } else if (filterType === 'prefecture') {
      // Remove prefecture and city but keep region
      newFilters.prefecture = undefined;
      newFilters.city = undefined;
    } else if (filterType === 'region') {
      // Remove all location filters
      newFilters.region = undefined;
      newFilters.prefecture = undefined;
      newFilters.city = undefined;
    } else {
      // Remove the entire filter
      newFilters[filterType] = undefined;
    }
    
    setFilters(newFilters);
    updateSearchResults(newFilters);
    setHasSearched(true);
  };

  return {
    filters,
    searchResults,
    loading,
    hasSearched,
    updateSearchResults,
    handleSearch,
    handleFiltersChange,
    handleRemoveFilter
  };
};