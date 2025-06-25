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
import MyPageFilter from './components/MyPageFilter';
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
  const [myPageFilters, setMyPageFilters] = useState<SearchFilters>({});

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

  // Initialize with all cases (published only for search page)
  useEffect(() => {
    const searchFilters = { publicationStatus: 'published' as const };
    const initialResults = searchCases(mockCases, searchFilters, favorites);
    setSearchResults(initialResults);
  }, [mockCases, favorites]);

  // Handle search
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Add publicationStatus filter for search page to show only published cases
    const searchFilters = { ...filters, publicationStatus: 'published' as const };
    const results = searchCases(mockCases, searchFilters, favorites);
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
        // Add publicationStatus filter for search page to show only published cases
        const searchFilters = { ...newFilters, publicationStatus: 'published' as const };
        const results = searchCases(mockCases, searchFilters, favorites);
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
    
    // Perform search with updated filters (add publicationStatus for search page)
    const searchFilters = { ...newFilters, publicationStatus: 'published' as const };
    const results = searchCases(mockCases, searchFilters, favorites);
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
    
    // Close chat and go to My Cases page
    setShowCaseCollector(false);
    setCurrentView('list');
    
    // Clear chat state
    setChatMessages([]);
    setChatConversationHistory([]);
    setCaseBasicInfo(null);
    
    // Re-run search to include new case (only published cases for search page)
    const searchFilters = { ...filters, publicationStatus: 'published' as const };
    const results = searchCases([newCaseWithId, ...mockCases], searchFilters, favorites);
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
    // If we're editing an existing case (not from chat), go back to My Cases
    if (aiGeneratedData?.id && !showCaseCollector) {
      setShowCaseReviewEdit(false);
      setCurrentView('list');
      setAiGeneratedData(null);
      setCaseBasicInfo(null);
    } else {
      // Otherwise, go back to chat
      setShowCaseReviewEdit(false);
      setShowCaseCollector(true);
    }
  };

  // Handle save from review/edit screen
  const handleSave = (caseData: Partial<Case>) => {
    // Check if we're editing an existing case
    const existingCase = aiGeneratedData?.id ? mockCases.find(c => c.id === aiGeneratedData.id) : null;
    let updatedCases: Case[];
    
    if (existingCase) {
      // Update existing case
      const updatedCase: Case = {
        ...existingCase,
        ...caseData,
        updatedAt: new Date(),
        title: caseData.title || existingCase.title,
        industry: caseData.industry || existingCase.industry,
        region: caseData.region || existingCase.region,
        challenges: caseData.challenges || existingCase.challenges || [],
        needs: caseData.needs || existingCase.needs || [],
        proposals: caseData.proposals || existingCase.proposals || [],
        results: caseData.results || existingCase.results || [],
        // Update orderStatus and tags based on the selected status
        orderStatus: caseData.orderStatus || existingCase.orderStatus,
        tags: caseData.orderStatus === 'won' ? ['受注'] : caseData.orderStatus === 'lost' ? ['失注'] : existingCase.tags || ['進行中']
      };
      
      updatedCases = mockCases.map(c => c.id === existingCase.id ? updatedCase : c);
      setMockCases(updatedCases);
    } else {
      // Create new case
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
        tags: caseData.orderStatus === 'won' ? ['受注'] : caseData.orderStatus === 'lost' ? ['失注'] : ['進行中'],
        orderStatus: caseData.orderStatus || 'in_progress'
      } as Case;
      
      updatedCases = [newCaseWithId, ...mockCases];
      setMockCases(updatedCases);
    }
    
    setShowCaseReviewEdit(false);
    
    // Always go to search page to show the added case in the main list
    setCurrentView('search');
    
    // Clear edit state
    setAiGeneratedData(null);
    setCaseBasicInfo(null);
    
    // If we were editing an existing case and changed orderStatus, reset MyPage filters
    if (existingCase && existingCase.orderStatus === 'in_progress' && caseData.orderStatus !== 'in_progress') {
      setMyPageFilters({});
    }
    
    // Re-run search to include updated cases (use the immediately updated cases, only published cases for search page)
    const searchFilters = { ...filters, publicationStatus: 'published' as const };
    const results = searchCases(updatedCases, searchFilters, favorites);
    setSearchResults(results);
  };

  // Handle edit case
  const handleEditCase = (caseId: string) => {
    const caseToEdit = mockCases.find(c => c.id === caseId);
    if (caseToEdit) {
      // Create basic info from the case data
      const basicInfo = {
        companyName: caseToEdit.companyName || '',
        industry: caseToEdit.industries || [caseToEdit.industry],
        mainIndustry: caseToEdit.industry,
        region: caseToEdit.region,
        prefecture: caseToEdit.prefecture || '',
        city: caseToEdit.city || '',
        companySize: caseToEdit.companySize
      };
      
      setCaseBasicInfo(basicInfo);
      setAiGeneratedData(caseToEdit);
      setShowCaseReviewEdit(true);
    }
  };

  // Handle delete case
  const handleDeleteCase = (caseId: string) => {
    if (window.confirm('この事例を削除してもよろしいですか？')) {
      setMockCases(prev => prev.filter(c => c.id !== caseId));
      
      // Remove from favorites if exists
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(caseId);
        return newFavorites;
      });
      
      // Close detail modal if this case was selected
      if (selectedCase?.id === caseId) {
        setSelectedCase(null);
        setSelectedCaseIndex(-1);
      }
    }
  };

  // Handle continue case (resume AI interview)
  const handleContinueCase = (caseId: string) => {
    const caseToResume = mockCases.find(c => c.id === caseId);
    if (caseToResume) {
      // Create basic info from the case data
      const basicInfo = {
        companyName: caseToResume.companyName || '',
        industry: caseToResume.industries || [caseToResume.industry],
        mainIndustry: caseToResume.industry,
        region: caseToResume.region,
        prefecture: caseToResume.prefecture || '',
        city: caseToResume.city || '',
        companySize: caseToResume.companySize
      };
      
      // Create initial messages based on current case content
      const initialMessages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: `こんにちは！${caseToResume.companyName}との商談の続きを行いましょう。

現在の進捗状況：
・課題: ${caseToResume.challenges?.[0] || '整理中'}
・ニーズ: ${caseToResume.needs?.[0] || '整理中'}
・提案: ${caseToResume.proposals?.[0] || '整理中'}

さらに詳しい情報や追加の課題・提案などがあれば教えてください。`,
          timestamp: new Date()
        }
      ];
      
      setCaseBasicInfo(basicInfo);
      setAiGeneratedData(caseToResume); // Set the existing case data to ensure it's recognized as an edit
      setChatMessages(initialMessages);
      setChatConversationHistory([]);
      setShowCaseCollector(true);
    }
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
              title={!sidebarOpen ? 'マイ事例' : ''}
            >
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                📄
              </div>
              <span className={`transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 sr-only'
              }`}>
                マイ事例
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
                showFavorite={true}
              />
            </div>
          </>
        )}

        {currentView === 'list' && !showCaseCollector && !showCaseReviewEdit && (
          <>
            {/* List Section */}
            <div className="mb-4">
              <div className="mb-6 text-center">
              </div>

              <MyPageFilter
                filters={myPageFilters}
                onFiltersChange={setMyPageFilters}
              />
              
              <CaseList
                searchResults={searchCases(mockCases, myPageFilters, new Set())}
                loading={false}
                onCaseSelect={handleCaseSelect}
                showFavorite={false}
                showTags={false}
                itemsPerPage={9}
                showActions={true}
                onEdit={handleEditCase}
                onDelete={handleDeleteCase}
                onContinue={handleContinueCase}
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
            existingCaseData={aiGeneratedData || undefined}
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
