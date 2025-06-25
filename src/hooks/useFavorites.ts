import { useState, useEffect } from 'react';

/**
 * お気に入り機能を管理するカスタムフック
 * ローカルストレージとの同期も自動で行う
 */
export const useFavorites = () => {
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

  /**
   * お気に入り状態をトグルする
   * @param caseId - 対象のケースID
   */
  const toggleFavorite = (caseId: string) => {
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

  return {
    favorites,
    toggleFavorite
  };
};