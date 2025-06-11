import React, { useState, useEffect } from 'react';
import { SearchFilters, SearchResult, Case } from './types/case';
import { searchCases } from './utils/search';
import { mockCases as initialMockCases } from './data/mockCases';
import SearchBox from './components/SearchBox';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import { CaseCollector } from './components/CaseCollector';
import './App.css';

function App() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCaseCollector, setShowCaseCollector] = useState(false);
  const [mockCases, setMockCases] = useState<Case[]>(initialMockCases);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('careeco-favorites');
    if (savedFavorites) {
      try {
        const favoritesArray = JSON.parse(savedFavorites);
        setFavorites(new Set(favoritesArray));
      } catch (error) {
        console.error('Failed to load favorites from localStorage:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('careeco-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Initialize with all cases
  useEffect(() => {
    const initialResults = searchCases(mockCases, {}, favorites);
    setSearchResults(initialResults);
  }, [mockCases, favorites]);

  // Handle search
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results = searchCases(mockCases, filters, favorites);
    setSearchResults(results);
    setLoading(false);
  };

  // Handle case selection
  const handleCaseSelect = (caseId: string) => {
    const caseData = mockCases.find(c => c.id === caseId);
    if (caseData) {
      setSelectedCase(caseData);
    }
  };

  // Handle case detail close
  const handleCaseDetailClose = () => {
    setSelectedCase(null);
  };

  // Handle filter changes (with automatic search for certain filters)
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
        const results = searchCases(mockCases, newFilters, favorites);
        setSearchResults(results);
        setHasSearched(true);
      }, 100);
    }
  };

  // Handle new case collection
  const handleCaseCollected = (newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCaseWithId: Case = {
      ...newCase,
      id: `case-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setMockCases(prev => [newCaseWithId, ...prev]);
    
    // Re-run search to include new case
    const results = searchCases([newCaseWithId, ...mockCases], filters, favorites);
    setSearchResults(results);
  };

  // Handle favorite toggle
  const handleToggleFavorite = (caseId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(caseId)) {
        newFavorites.delete(caseId);
      } else {
        newFavorites.add(caseId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  CAREECO
                </h1>
                <p className="text-sm text-gray-500">
                  営業支援システム
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCaseCollector(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                事例を追加
              </button>
              <div className="text-sm text-gray-500">
                登録事例数: {mockCases.length}件
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              事例検索
            </h2>
            <p className="text-gray-600 text-sm">
              キーワードやフィルターを使って、関連する事例を見つけましょう
            </p>
          </div>
          
          <SearchBox
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
          />
        </div>

        {/* Results Section */}
        <div className="mb-8">
          {hasSearched && (
            <div className="mb-4">
              {Object.keys(filters).length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>検索条件:</span>
                  {filters.query && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      "{filters.query}"
                    </span>
                  )}
                  {filters.industry && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {filters.industry}
                    </span>
                  )}
                  {filters.region && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {filters.region}
                    </span>
                  )}
                  {filters.companySize && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {filters.companySize === 'small' && '小規模'}
                      {filters.companySize === 'medium' && '中規模'}
                      {filters.companySize === 'large' && '大規模'}
                    </span>
                  )}
                  {filters.tags && filters.tags.length > 0 && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      タグ: {filters.tags.length}件
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          
          <CaseList
            searchResults={searchResults}
            loading={loading}
            onCaseSelect={handleCaseSelect}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </main>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetail
          case={selectedCase}
          onClose={handleCaseDetailClose}
          onCaseSelect={handleCaseSelect}
        />
      )}

      {/* Case Collector Modal */}
      {showCaseCollector && (
        <CaseCollector
          onCaseCollected={handleCaseCollected}
          onClose={() => setShowCaseCollector(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 CAREECO. All rights reserved.</p>
            <p className="mt-1">
              建設業界向け営業支援システム
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
