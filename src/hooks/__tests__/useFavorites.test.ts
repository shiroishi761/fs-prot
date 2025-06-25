import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../useFavorites';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useFavorites hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with empty favorites when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useFavorites());
    
    expect(result.current.favorites.size).toBe(0);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('careeco-favorites');
  });

  test('loads favorites from localStorage on initialization', () => {
    const savedFavorites = ['case-1', 'case-2'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFavorites));
    
    const { result } = renderHook(() => useFavorites());
    
    expect(result.current.favorites.size).toBe(2);
    expect(result.current.favorites.has('case-1')).toBe(true);
    expect(result.current.favorites.has('case-2')).toBe(true);
  });

  test('handles corrupted localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useFavorites());
    
    expect(result.current.favorites.size).toBe(0);
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('toggleFavorite adds new favorite', () => {
    localStorageMock.getItem.mockReturnValue('[]');
    
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.toggleFavorite('case-1');
    });
    
    expect(result.current.favorites.has('case-1')).toBe(true);
    expect(result.current.favorites.size).toBe(1);
  });

  test('toggleFavorite removes existing favorite', () => {
    localStorageMock.getItem.mockReturnValue('["case-1"]');
    
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.toggleFavorite('case-1');
    });
    
    expect(result.current.favorites.has('case-1')).toBe(false);
    expect(result.current.favorites.size).toBe(0);
  });

  test('saves favorites to localStorage when favorites change', () => {
    localStorageMock.getItem.mockReturnValue('[]');
    
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.toggleFavorite('case-1');
    });
    
    // Should be called twice: once for initial load, once after toggle
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'careeco-favorites',
      JSON.stringify(['case-1'])
    );
  });
});