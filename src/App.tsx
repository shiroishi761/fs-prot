import React, { useState, useEffect } from 'react';
import { SearchFilters, Case } from './types/case';
import { searchCases } from './utils/search';
import { mockCases as initialMockCases } from './data/mockCases';
import { useFavorites } from './hooks/useFavorites';
import { useSearch } from './hooks/useSearch';
import { useCaseNavigation } from './hooks/useCaseNavigation';
import { createBasicInfoFromCase, generateCaseId, updateCaseTags } from './utils/caseUtils';
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
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // UI state
  const [currentView, setCurrentView] = useState<ViewMode>('search');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCaseCollector, setShowCaseCollector] = useState(false);
  const [showCaseReviewEdit, setShowCaseReviewEdit] = useState(false);
  
  // Case data state
  const [mockCases, setMockCases] = useState<Case[]>(initialMockCases);
  const [myPageFilters, setMyPageFilters] = useState<SearchFilters>({});
  
  // Chat state
  const [caseBasicInfo, setCaseBasicInfo] = useState<any>(null);
  const [aiGeneratedData, setAiGeneratedData] = useState<Partial<Case> | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatConversationHistory, setChatConversationHistory] = useState<any[]>([]);
  
  // Custom hooks
  const { favorites, toggleFavorite } = useFavorites();
  const {
    filters,
    searchResults,
    loading,
    hasSearched,
    updateSearchResults,
    handleSearch,
    handleFiltersChange,
    handleRemoveFilter
  } = useSearch(mockCases, favorites);
  // Get current results based on view
  const currentResults = React.useMemo(() => {
    if (currentView === 'list') {
      return searchCases(mockCases, myPageFilters, new Set());
    }
    return searchResults;
  }, [currentView, mockCases, myPageFilters, searchResults]);

  const {
    selectedCase,
    selectedCaseIndex,
    handleCaseSelect,
    handleCaseNavigate,
    handleCaseDetailClose
  } = useCaseNavigation(currentResults);


  // Initialize search results when mockCases or favorites change
  useEffect(() => {
    updateSearchResults();
  }, [updateSearchResults]);


  // Handle new case collection
  const handleCaseCollected = (newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCaseWithId: Case = {
      ...newCase,
      id: generateCaseId(),
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
    
    // Re-run search to include new case
    updateSearchResults();
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
        tags: updateCaseTags(caseData.orderStatus || existingCase.orderStatus)
      };
      
      updatedCases = mockCases.map(c => c.id === existingCase.id ? updatedCase : c);
      setMockCases(updatedCases);
    } else {
      // Create new case
      const newCaseWithId: Case = {
        ...caseData,
        id: generateCaseId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        title: caseData.title || '',
        industry: caseData.industry || '',
        region: caseData.region || '',
        challenges: caseData.challenges || [],
        needs: caseData.needs || [],
        proposals: caseData.proposals || [],
        results: caseData.results || [],
        tags: updateCaseTags(caseData.orderStatus || 'in_progress'),
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
    
    // Re-run search to include updated cases
    updateSearchResults();
  };

  // Handle edit case
  const handleEditCase = (caseId: string) => {
    const caseToEdit = mockCases.find(c => c.id === caseId);
    if (caseToEdit) {
      const basicInfo = createBasicInfoFromCase(caseToEdit);
      
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
      if (favorites.has(caseId)) {
        toggleFavorite(caseId);
      }
      
      // Close detail modal if this case was selected
      if (selectedCase?.id === caseId) {
        handleCaseDetailClose();
      }
    }
  };

  // Handle continue case (resume AI interview)
  const handleContinueCase = (caseId: string) => {
    const caseToResume = mockCases.find(c => c.id === caseId);
    if (caseToResume) {
      const basicInfo = createBasicInfoFromCase(caseToResume);
      
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
      // サイドバーのフォーカスを事例追加に遷移
      setCurrentView('add');
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
              title={!sidebarOpen ? '事例履歴' : ''}
            >
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                📄
              </div>
              <span className={`transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 sr-only'
              }`}>
                事例履歴
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
                onToggleFavorite={toggleFavorite}
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
                searchResults={currentResults}
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
          hasNext={selectedCaseIndex < currentResults.length - 1}
          isFavorite={currentView === 'search' ? favorites.has(selectedCase.id) : undefined}
          onToggleFavorite={currentView === 'search' ? toggleFavorite : undefined}
        />
      )}




    </div>
  );
}

export default App;
