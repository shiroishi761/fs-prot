import { useState } from 'react';
import { Case, SearchResult } from '../types/case';

/**
 * ケース詳細モーダルのナビゲーション機能を管理するカスタムフック
 */
export const useCaseNavigation = (searchResults: SearchResult[]) => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(-1);

  /**
   * ケースを選択する
   */
  const handleCaseSelect = (caseId: string) => {
    // Find the case in search results
    const resultIndex = searchResults.findIndex(result => result.case.id === caseId);
    if (resultIndex !== -1) {
      const caseData = searchResults[resultIndex].case;
      setSelectedCase(caseData);
      setSelectedCaseIndex(resultIndex);
    }
  };

  /**
   * ケースナビゲーション（前/次）
   */
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

  /**
   * ケース詳細を閉じる
   */
  const handleCaseDetailClose = () => {
    setSelectedCase(null);
    setSelectedCaseIndex(-1);
  };

  return {
    selectedCase,
    selectedCaseIndex,
    handleCaseSelect,
    handleCaseNavigate,
    handleCaseDetailClose
  };
};