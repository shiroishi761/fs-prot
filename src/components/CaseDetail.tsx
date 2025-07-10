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
  // State for active tab
  const [activeTab, setActiveTab] = useState<'basic' | 'neck'>('basic');



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

  // Get neck type label
  const getNeckTypeLabel = (type?: string) => {
    switch (type) {
      case '価格': return '価格ネック';
      case 'タイミング': return 'タイミングネック';
      case '権限': return '権限ネック';
      case '競合': return '競合ネック';
      case '信頼': return '信頼ネック';
      case 'その他': return 'その他のネック';
      default: return '';
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between rounded-t-lg">
          <div className="pr-4">
            {caseData.companyName && (
              <h1 className="text-lg font-semibold text-gray-900">{caseData.companyName}</h1>
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

        {/* Meta information */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
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
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              課題
            </button>
            <button
              onClick={() => setActiveTab('neck')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'neck'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ネック
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'basic' ? (
            /* Challenge Tab */
            <div className="p-6">
              {/* Main content sections */}
              <div className="space-y-6">
                {/* Challenge-Need-Proposal Flow */}
                {(() => {
                  // Show only the first set of challenge-need-proposal
                  const challenge = caseData.challenges?.[0] || caseData.challenge || null;
                  const challengeSummary = caseData.challengeSummaries?.[0] || caseData.challengeSummary || null;
                  const need = caseData.needs?.[0] || null;
                  const proposal = (caseData.orderStatus === 'won') ? 
                    (caseData.proposals?.[0] || caseData.proposal || null) : null;

                  // Only show if we have at least one piece of content
                  if (!challenge && !need && !proposal) {
                    return null;
                  }

                  // Create single item array for consistent rendering
                  const items = [{ challenge, challengeSummary, need, proposal, index: 0 }];

                  return items.map(({ challenge, challengeSummary, need, proposal, index }) => {
                    // Find matching tag from case tags (e.g., 季節変動対策, 利益率改善, etc.)
                    const matchingTag = caseData.tags.find(tag => 
                      ['季節変動対策', '利益率改善', '業務効率化', '取引先分散', '人材不足解決'].includes(tag)
                    );
                    
                    return (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        {/* Header with Tag */}
                        {matchingTag && (
                          <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 rounded-t-lg">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <h3 className="text-sm font-semibold text-blue-700">{matchingTag}</h3>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-4 space-y-4">
                          {/* Challenge */}
                          {challenge && (
                            <div>
                              <div className="flex items-center mb-2">
                                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2">
                                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                </div>
                                <h4 className="text-sm font-medium text-gray-700">課題</h4>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed pl-7">{challenge}</p>
                            </div>
                          )}

                          {/* Divider */}
                          {challenge && need && (
                            <hr className="border-gray-200" />
                          )}

                          {/* Need */}
                          {need && (
                            <div>
                              <div className="flex items-center mb-2">
                                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <h4 className="text-sm font-medium text-gray-700">ニーズ</h4>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed pl-7">{need}</p>
                            </div>
                          )}

                          {/* Divider */}
                          {need && proposal && (
                            <hr className="border-gray-200" />
                          )}

                          {/* Proposal */}
                          {proposal && (
                            <div>
                              <div className="flex items-center mb-2">
                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                </div>
                                <h4 className="text-sm font-medium text-gray-700">提案</h4>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed pl-7">{proposal}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            /* Neck Tab */
            <div className="p-6">
              {caseData.neckType || caseData.customerStatement || caseData.action ? (
                <div className="space-y-6">
                  {/* Combined Neck Card */}
                  {(caseData.neckType || caseData.customerStatement || caseData.action) && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      {/* Header with Neck Type */}
                      {caseData.neckType && (
                        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 rounded-t-lg">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L8.732 4.5C7.232 2 5.536 2 4.732 3.5L2.82 16.5c-.616 1.5.192 3 1.732 3z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-yellow-700">{getNeckTypeLabel(caseData.neckType)}</h3>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 space-y-4">
                        {/* Customer Statement */}
                        {caseData.customerStatement && (
                          <div>
                            <div className="flex items-center mb-2">
                              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2">
                                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <h4 className="text-sm font-medium text-gray-700">顧客の声</h4>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed pl-7">「{caseData.customerStatement}」</p>
                          </div>
                        )}

                        {/* Divider */}
                        {caseData.customerStatement && caseData.action && (
                          <hr className="border-gray-200" />
                        )}

                        {/* Action Taken */}
                        {caseData.action && (
                          <div>
                            <div className="flex items-center mb-2">
                              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <h4 className="text-sm font-medium text-gray-700">実施した対策</h4>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed pl-7">{caseData.action}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">ネック情報はまだ登録されていません</p>
                </div>
              )}
            </div>
          )}
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