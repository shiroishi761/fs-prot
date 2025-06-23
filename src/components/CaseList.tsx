import React, { useState } from 'react';
import { SearchResult } from '../types/case';
import CaseCard from './CaseCard';

interface CaseListProps {
  searchResults: SearchResult[];
  loading: boolean;
  onCaseSelect: (caseId: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (caseId: string) => void;
}

const CaseList: React.FC<CaseListProps> = ({ 
  searchResults, 
  loading, 
  onCaseSelect,
  favorites,
  onToggleFavorite
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate pagination
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = searchResults.slice(startIndex, endIndex);

  // Reset to first page when search results change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex space-x-4 mb-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-18"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          該当する事例が見つかりませんでした
        </h3>
        <p className="text-gray-500 mb-6">
          検索条件を変更して再度お試しください
        </p>
        <div className="text-sm text-gray-400">
          <p>ヒント:</p>
          <ul className="mt-2 space-y-1">
            <li>• より一般的なキーワードを使用してみる</li>
            <li>• フィルター条件を緩和してみる</li>
            <li>• 類似の業界や地域で検索してみる</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with results count and view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          
          {/* Search status */}
          {searchResults.some(result => result.relevanceScore < 1.0) && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              関連度順で表示
            </div>
          )}
        </div>

      </div>

      {/* Results grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {currentResults.map((result) => (
          <CaseCard
            key={result.case.id}
            searchResult={result}
            onClick={() => onCaseSelect(result.case.id)}
            isFavorite={favorites.has(result.case.id)}
            onToggleFavorite={() => onToggleFavorite(result.case.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            前へ
          </button>
          
          {/* Page numbers */}
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage = 
                page === 1 || 
                page === totalPages || 
                Math.abs(page - currentPage) <= 1;
              
              if (!showPage && page === 2 && currentPage > 4) {
                return <span key={page} className="px-2 text-gray-400">...</span>;
              }
              if (!showPage && page === totalPages - 1 && currentPage < totalPages - 3) {
                return <span key={page} className="px-2 text-gray-400">...</span>;
              }
              if (!showPage) {
                return null;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            次へ
          </button>
        </div>
      )}

      {/* Results summary */}
      {searchResults.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-200">
          全{searchResults.length}件中 {startIndex + 1}-{Math.min(endIndex, searchResults.length)}件を表示
          {searchResults.some(result => result.relevanceScore < 1.0) && (
            <div className="mt-2">
              関連度の高い順に並んでいます
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseList;