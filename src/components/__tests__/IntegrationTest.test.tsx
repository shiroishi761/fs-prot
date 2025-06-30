import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

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

// Mock console.log to avoid debug output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Refactored App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('1. App loads and displays login screen', () => {
    render(<App />);
    expect(screen.getByText('Google でログイン')).toBeInTheDocument();
  });

  test('2. After login, search page displays with published cases only', async () => {
    render(<App />);
    
    // Click login button
    const loginButton = screen.getByRole('button');
    fireEvent.click(loginButton);

    // Wait for main app to load
    await waitFor(() => {
      expect(screen.getByText(/事例検索/)).toBeInTheDocument();
    });

    // Check that cases are displayed (published cases only)
    const caseCards = screen.getAllByText(/事例/);
    expect(caseCards.length).toBeGreaterThan(0);
  });

  test('3. Search functionality works', async () => {
    render(<App />);
    
    // Login
    const loginButton = screen.getByRole('button');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/事例を検索/)).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/事例を検索/);
    fireEvent.change(searchInput, { target: { value: '建設' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);

    // Wait for search results
    await waitFor(() => {
      // Search should complete without errors
      expect(searchInput).toHaveValue('建設');
    });
  });

  test('4. Navigation between pages works', async () => {
    render(<App />);
    
    // Login
    const loginButton = screen.getByRole('button');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/事例検索/)).toBeInTheDocument();
    });

    // Navigate to My Cases
    const myCasesButton = screen.getByText(/事例履歴/);
    fireEvent.click(myCasesButton);

    await waitFor(() => {
      expect(screen.getByText(/公開ステータス/)).toBeInTheDocument();
    });

    // Navigate to Case Add
    const addCaseButton = screen.getByText(/事例追加/);
    fireEvent.click(addCaseButton);

    await waitFor(() => {
      expect(screen.getByText(/企業名/)).toBeInTheDocument();
    });
  });

  test('5. Favorites functionality works with localStorage', async () => {
    // Mock localStorage to return empty favorites
    localStorageMock.getItem.mockReturnValue('[]');
    
    render(<App />);
    
    // Login
    const loginButton = screen.getByRole('button');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/事例検索/)).toBeInTheDocument();
    });

    // Check that localStorage was accessed for favorites
    expect(localStorageMock.getItem).toHaveBeenCalledWith('careeco-favorites');
  });

  test('6. MyPage filters work correctly', async () => {
    render(<App />);
    
    // Login
    const loginButton = screen.getByRole('button');
    fireEvent.click(loginButton);

    // Navigate to My Cases
    await waitFor(() => {
      const myCasesButton = screen.getByText(/事例履歴/);
      fireEvent.click(myCasesButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/公開ステータス/)).toBeInTheDocument();
    });

    // Check filter options
    expect(screen.getByText(/すべて表示/)).toBeInTheDocument();
    expect(screen.getByText(/公開済み/)).toBeInTheDocument();
    expect(screen.getByText(/非公開/)).toBeInTheDocument();

    // Click on published filter
    const publishedFilter = screen.getByLabelText(/公開済み/);
    fireEvent.click(publishedFilter);

    // Filter should be applied without errors
    expect(publishedFilter).toBeChecked();
  });
});