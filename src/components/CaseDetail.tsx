import React, { useEffect, useState } from 'react';
import { Case } from '../types/case';

interface CaseDetailProps {
  case: Case | null;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (caseId: string) => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ 
  case: caseData, 
  onClose,
  onNavigate,
  hasPrev = false,
  hasNext = false,
  isFavorite = false,
  onToggleFavorite
}) => {
  // State for expanding sections
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Toggle section expansion
  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
    });
  };

  // Generate summary for header using challenge summary or fallback to challenge content
  const generateSummary = (challenge?: string | null, challengeSummary?: string | null) => {
    // Prefer challenge summary if available
    if (challengeSummary) {
      return challengeSummary;
    }
    // Fallback to truncated challenge content
    if (challenge) {
      return challenge.substring(0, 100) + (challenge.length > 100 ? '...' : '');
    }
    return '';
  };

  // Get company size label
  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '小規模（〜50名）';
      case 'medium': return '中規模（50-300名）';
      case 'large': return '大規模（300名〜）';
      default: return size;
    }
  };

  // Format industries for display
  const formatIndustries = (caseData: Case) => {
    const industries = caseData.industries || [caseData.industry];
    
    if (industries.length === 1) {
      return industries[0];
    } else if (industries.length === 2) {
      return `${industries[0]} ・ ${industries[1]}`;
    } else {
      return `${industries[0]} 他${industries.length - 1}業種`;
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Reset expanded sections when case changes
  useEffect(() => {
    if (caseData) {
      // Calculate the number of sections and expand all by default
      const challengesCount = caseData.challenges?.length || (caseData.challenge ? 1 : 0);
      const needsCount = caseData.needs?.length || 0;
      const proposalsCount = (caseData.orderStatus === 'won') ? 
        (caseData.proposals?.length || (caseData.proposal ? 1 : 0)) : 0;
      const maxSets = Math.max(challengesCount, needsCount, proposalsCount);
      
      // Create set with all section indices to expand all sections by default
      const allSections = new Set(Array.from({ length: maxSets }, (_, i) => i));
      setExpandedSections(allSections);
    }
  }, [caseData]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onNavigate) {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' && hasNext && onNavigate) {
        onNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, hasPrev, hasNext]);

  if (!caseData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between rounded-t-lg">
          <div className="pr-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {caseData.title}
            </h1>
            {caseData.companyName && (
              <p className="text-sm text-gray-600 mt-1">{caseData.companyName}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* Favorite button */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(caseData.id)}
                className={`transition-colors ${
                  isFavorite 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
                title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              >
                <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
            {/* Close button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Meta information - Fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <div className="text-xs text-gray-500">メイン業種</div>
                <div className="text-sm font-medium" title={caseData.industries?.join(', ') || caseData.industry}>
                  {formatIndustries(caseData)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500">地域</div>
                <div className="text-sm font-medium">{[caseData.region, caseData.prefecture, caseData.city].filter(Boolean).join(' > ')}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <div className="text-xs text-gray-500">企業規模</div>
                <div className="text-sm font-medium">{getCompanySizeLabel(caseData.companySize)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Main content sections */}
          <div className="space-y-6">
            {/* Challenge-Need-Proposal Flow */}
            {(() => {
              // Determine the actual number of sets based on available data
              const challengesCount = caseData.challenges?.length || (caseData.challenge ? 1 : 0);
              const needsCount = caseData.needs?.length || 0;
              const proposalsCount = (caseData.orderStatus === 'won') ? 
                (caseData.proposals?.length || (caseData.proposal ? 1 : 0)) : 0;

              // Create sets based on the maximum available data, but ensure we have meaningful content
              const items = [];
              const maxSets = Math.max(challengesCount, needsCount, proposalsCount);
              
              for (let i = 0; i < maxSets; i++) {
                const challenge = caseData.challenges?.[i] || (i === 0 ? caseData.challenge : null);
                const challengeSummary = caseData.challengeSummaries?.[i] || (i === 0 ? caseData.challengeSummary : null);
                const need = caseData.needs?.[i] || null;
                const proposal = (caseData.orderStatus === 'won') ? 
                  (caseData.proposals?.[i] || (i === 0 ? caseData.proposal : null)) : null;

                // Only add sets that have at least one piece of content
                if (challenge || need || proposal) {
                  items.push({ challenge, challengeSummary, need, proposal, index: i });
                }
              }

              // If we have more than 3 items, we might want to limit or group them differently
              // For now, we'll show all available sets

              return items.map(({ challenge, challengeSummary, need, proposal, index }) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {/* Flow Header with Summary and Toggle */}
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full bg-gray-50 px-4 py-3 border-b border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <p className="text-base text-gray-800 leading-relaxed font-medium">
                          {generateSummary(challenge, challengeSummary)}
                        </p>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.has(index) ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedSections.has(index) && (
                    <div className="p-4 space-y-4">
                      {/* Title */}
                      {challengeSummary && (
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-700 mb-2">タイトル</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{challengeSummary}</p>
                          </div>
                        </div>
                      )}

                      {/* Challenge */}
                      {challenge && (
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-700 mb-2">課題</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{challenge}</p>
                          </div>
                        </div>
                      )}

                      {/* Need */}
                      {need && (
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-purple-700 mb-2">ニーズ</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{need}</p>
                          </div>
                        </div>
                      )}

                      {/* Proposal */}
                      {proposal && (
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-700 mb-2">提案</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{proposal}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Footer with navigation and meta information - Fixed */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 text-sm text-gray-500 rounded-b-lg">
          <div className="relative flex items-center justify-center">
            {/* Navigation buttons - center */}
            <div className="flex items-center">
              {onNavigate && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('prev')}
                    disabled={!hasPrev}
                    className={`p-2 rounded-md transition-colors ${
                      hasPrev
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    title="前の事例 (←)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onNavigate('next')}
                    disabled={!hasNext}
                    className={`p-2 rounded-md transition-colors ${
                      hasNext
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    title="次の事例 (→)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* Creation date - absolute positioned on right */}
            <div className="absolute right-0">
              作成日: {caseData.createdAt.toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CaseDetail;