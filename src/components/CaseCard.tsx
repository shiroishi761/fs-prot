import React from 'react';
import { SearchResult } from '../types/case';

interface CaseCardProps {
  searchResult: SearchResult;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ searchResult, onClick, isFavorite, onToggleFavorite }) => {
  const { case: caseData, relevanceScore, matchedFields, highlights } = searchResult;

  // Get company size label
  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '小規模（〜50名）';
      case 'medium': return '中規模（50-300名）';
      case 'large': return '大規模（300名〜）';
      default: return size;
    }
  };

  // Highlight matched keywords in text
  const highlightText = (text: string, fieldName: string) => {
    if (!highlights || !highlights[fieldName as keyof typeof highlights]) {
      return text;
    }
    
    const highlightedText = highlights[fieldName as keyof typeof highlights];
    if (highlightedText && highlightedText !== text) {
      return highlightedText;
    }
    
    return text;
  };

  // Get relevance score color
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Truncate text to specified length
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 p-6"
    >
      {/* Header with title, favorite button, and relevance score */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-3 leading-tight">
          {matchedFields.includes('title') ? (
            <span dangerouslySetInnerHTML={{ 
              __html: highlightText(caseData.title, 'title') 
            }} />
          ) : (
            caseData.title
          )}
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-1 rounded-full transition-colors ${
              isFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500'
            }`}
            title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            <svg 
              className="w-5 h-5" 
              fill={isFavorite ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>

          {/* Relevance score */}
          {relevanceScore < 1.0 && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(relevanceScore)}`}>
              {Math.round(relevanceScore * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Meta information */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {caseData.industry}
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {caseData.region}
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {getCompanySizeLabel(caseData.companySize)}
        </div>
      </div>

      {/* Challenge snippet */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">課題</h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          {matchedFields.includes('challenge') ? (
            <span dangerouslySetInnerHTML={{ 
              __html: truncateText(highlightText(caseData.challenge, 'challenge')) 
            }} />
          ) : (
            truncateText(caseData.challenge)
          )}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {caseData.tags.slice(0, 4).map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              matchedFields.includes('tags') 
                ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tag}
          </span>
        ))}
        {caseData.tags.length > 4 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            +{caseData.tags.length - 4}
          </span>
        )}
      </div>

      {/* Matched fields indicator */}
      {matchedFields.length > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            マッチ: {matchedFields.join(', ')}
          </div>
          
          <div className="text-xs text-gray-400">
            {caseData.createdAt.toLocaleDateString('ja-JP')}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseCard;