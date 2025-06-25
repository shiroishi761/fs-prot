import React, { useState, useEffect } from 'react';
import { SearchFilters, SearchResult, Case } from './types/case';
import { searchCases } from './utils/search';
import { mockCases as initialMockCases } from './data/mockCases';
import SearchBox from './components/SearchBox';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import { CaseCollector } from './components/CaseCollector';
import { CaseAddForm } from './components/CaseAddForm';
import { CaseReviewEdit } from './components/CaseReviewEdit';
import Login from './components/Login';
import SearchConditionTags from './components/SearchConditionTags';
import './App.css';

type ViewMode = 'search' | 'list' | 'add';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('search');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCaseCollector, setShowCaseCollector] = useState(false);
  const [showCaseReviewEdit, setShowCaseReviewEdit] = useState(false);
  const [caseBasicInfo, setCaseBasicInfo] = useState<any>(null);
  const [aiGeneratedData, setAiGeneratedData] = useState<Partial<Case> | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatConversationHistory, setChatConversationHistory] = useState<any[]>([]);
  console.log('Basic info:', caseBasicInfo); // デバッグ用
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
      // Find the index in current search results
      const index = searchResults.findIndex(result => result.case.id === caseId);
      setSelectedCase(caseData);
      setSelectedCaseIndex(index);
    }
  };

  // Handle case navigation
  const handleCaseNavigate = (direction: 'prev' | 'next') => {
    if (selectedCaseIndex === -1) return;
    
    const newIndex = direction === 'prev' 
      ? selectedCaseIndex - 1 
      : selectedCaseIndex + 1;
    
    if (newIndex >= 0 && newIndex < searchResults.length) {
      const newCase = searchResults[newIndex].case;
      setSelectedCase(newCase);
      setSelectedCaseIndex(newIndex);
    }
  };

  // Handle case detail close
  const handleCaseDetailClose = () => {
    setSelectedCase(null);
    setSelectedCaseIndex(-1);
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

  // Handle removing individual filters
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
    
    // Perform search with updated filters
    const results = searchCases(mockCases, newFilters, favorites);
    setSearchResults(results);
    setHasSearched(true);
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


  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Handle navigation
  const handleNavigation = (view: ViewMode) => {
    // チャット画面や確認・編集画面が開いている場合はそれらをクローズ
    setShowCaseCollector(false);
    setShowCaseReviewEdit(false);
    // 会話履歴もクリア
    setChatMessages([]);
    setChatConversationHistory([]);
    setCurrentView(view);
    setSidebarOpen(false);
  };

  // Start AI interview with basic info
  const handleStartInterview = (basicInfo: any) => {
    setCaseBasicInfo(basicInfo);
    setShowCaseCollector(true);
  };

  // Handle review/edit flow from AI hearing
  const handleReviewEdit = (aiData: Partial<Case>, messages: any[], conversationHistory: any[]) => {
    setAiGeneratedData(aiData);
    setChatMessages(messages);
    setChatConversationHistory(conversationHistory);
    setShowCaseCollector(false);
    setShowCaseReviewEdit(true);
  };

  // Handle back to chat from review/edit screen
  const handleBackToChat = () => {
    setShowCaseReviewEdit(false);
    setShowCaseCollector(true);
  };

  // Handle save from review/edit screen
  const handleSave = (caseData: Partial<Case>) => {
    const newCaseWithId: Case = {
      ...caseData,
      id: `case-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: caseData.title || '',
      industry: caseData.industry || '',
      region: caseData.region || '',
      challenges: caseData.challenges || [],
      needs: caseData.needs || [],
      proposals: caseData.proposals || [],
      results: caseData.results || [],
      tags: [],
      orderStatus: 'in_progress'
    } as Case;
    
    setMockCases(prev => [newCaseWithId, ...prev]);
    setShowCaseReviewEdit(false);
    setCurrentView('search');
    
    // Re-run search to include new case
    const results = searchCases([newCaseWithId, ...mockCases], filters, favorites);
    setSearchResults(results);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ease-in-out z-40 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-end p-4 border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => handleNavigation('search')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'search'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={!sidebarOpen ? '事例検索' : ''}
            >
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                🔍
              </div>
              <span className={`transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 sr-only'
              }`}>
                事例検索
              </span>
            </button>
            
            <button
              onClick={() => handleNavigation('list')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={!sidebarOpen ? '事例一覧' : ''}
            >
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                📄
              </div>
              <span className={`transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 sr-only'
              }`}>
                事例一覧
              </span>
            </button>
            
            <button
              onClick={() => handleNavigation('add')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'add'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={!sidebarOpen ? '事例追加' : ''}
            >
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                ➕
              </div>
              <span className={`transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 sr-only'
              }`}>
                事例追加
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="w-full max-w-7xl mx-auto px-4 py-10 my-6">
        {currentView === 'search' && !showCaseCollector && !showCaseReviewEdit && (
          <>
            {/* Search Section */}
            <div className="mb-2">
              <SearchBox
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
              />
            </div>

            {/* Results Section */}
            <div className="mb-4">
              {hasSearched && (
                <SearchConditionTags
                  filters={filters}
                  onRemoveFilter={handleRemoveFilter}
                />
              )}
              
              <CaseList
                searchResults={searchResults}
                loading={loading}
                onCaseSelect={handleCaseSelect}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </>
        )}

        {currentView === 'list' && !showCaseCollector && !showCaseReviewEdit && (
          <>
            {/* List Section */}
            <div className="mb-4">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  事例一覧
                </h2>
                <p className="text-gray-600">
                  登録されている全ての事例を表示します
                </p>
              </div>
              
              <CaseList
                searchResults={searchCases(mockCases, {}, favorites)}
                loading={false}
                onCaseSelect={handleCaseSelect}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </>
        )}

        {currentView === 'add' && !showCaseCollector && !showCaseReviewEdit && (
          <CaseAddForm
            onStartInterview={handleStartInterview}
            onClose={() => setCurrentView('search')}
          />
        )}

        {showCaseCollector && !showCaseReviewEdit && (
          <CaseCollector
            onCaseCollected={handleCaseCollected}
            onReviewEdit={handleReviewEdit}
            onClose={() => {
              setShowCaseCollector(false);
              setCurrentView('search');
            }}
            basicInfo={caseBasicInfo}
            savedMessages={chatMessages}
            savedConversationHistory={chatConversationHistory}
          />
        )}

        {showCaseReviewEdit && !showCaseCollector && caseBasicInfo && aiGeneratedData && (
          <CaseReviewEdit
            basicInfo={caseBasicInfo}
            aiGeneratedData={aiGeneratedData}
            onSave={handleSave}
            onBackToChat={handleBackToChat}
          />
        )}
        </div>
      </main>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetail
          case={selectedCase}
          onClose={handleCaseDetailClose}
          onNavigate={handleCaseNavigate}
          hasPrev={selectedCaseIndex > 0}
          hasNext={selectedCaseIndex < searchResults.length - 1}
        />
      )}




    </div>
  );
}

export default App;
