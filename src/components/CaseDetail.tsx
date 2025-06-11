import React, { useEffect, useState } from 'react';
import { Case } from '../types/case';
import { getRelatedCases } from '../utils/search';
import { mockCases } from '../data/mockCases';

interface CaseDetailProps {
  case: Case | null;
  onClose: () => void;
  onCaseSelect: (caseId: string) => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ 
  case: caseData, 
  onClose, 
  onCaseSelect 
}) => {
  const [relatedCases, setRelatedCases] = useState<Case[]>([]);

  useEffect(() => {
    if (caseData) {
      const related = getRelatedCases(caseData, mockCases, 5);
      setRelatedCases(related);
    }
  }, [caseData]);

  // Get company size label
  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '小規模（〜50名）';
      case 'medium': return '中規模（50-300名）';
      case 'large': return '大規模（300名〜）';
      default: return size;
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  if (!caseData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 pr-4">
            {caseData.title}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <div className="text-sm text-gray-500">業界</div>
                <div className="font-medium">{caseData.industry}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="text-sm text-gray-500">地域</div>
                <div className="font-medium">{caseData.region}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <div className="text-sm text-gray-500">企業規模</div>
                <div className="font-medium">{getCompanySizeLabel(caseData.companySize)}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-2">関連タグ</h3>
            <div className="flex flex-wrap gap-2">
              {caseData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Main content sections */}
          <div className="space-y-8">
            {/* Challenge */}
            <section>
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">課題</h2>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {caseData.challenge}
                </p>
              </div>
            </section>

            {/* Proposal */}
            <section>
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">ご提案</h2>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {caseData.proposal}
                </p>
              </div>
            </section>

            {/* Result */}
            <section>
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">効果・結果</h2>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {caseData.result}
                </p>
              </div>
            </section>
          </div>

          {/* Related cases */}
          {relatedCases.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                関連する事例
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedCases.map((relatedCase) => (
                  <div
                    key={relatedCase.id}
                    onClick={() => onCaseSelect(relatedCase.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {relatedCase.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>{relatedCase.industry}</span>
                      <span className="mx-2">•</span>
                      <span>{relatedCase.region}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {relatedCase.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {relatedCase.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{relatedCase.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer with meta information */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex justify-between items-center">
              <div>
                作成日: {caseData.createdAt.toLocaleDateString('ja-JP')}
              </div>
              <div>
                更新日: {caseData.updatedAt.toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        </div>

        {/* Back to list button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;