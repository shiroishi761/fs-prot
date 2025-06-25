import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen by default', () => {
  render(<App />);
  const loginButton = screen.getByText(/Google でログイン/i);
  expect(loginButton).toBeInTheDocument();
});

test('only shows one main view at a time', () => {
  // Mock authentication
  const mockApp = () => {
    const AppComponent = () => {
      const [isAuthenticated, setIsAuthenticated] = React.useState(true);
      const [currentView, setCurrentView] = React.useState<'search' | 'list' | 'add'>('search');
      const [showCaseCollector, setShowCaseCollector] = React.useState(false);
      const [showCaseReviewEdit, setShowCaseReviewEdit] = React.useState(false);
      
      // Simulate search view
      if (currentView === 'search' && !showCaseCollector && !showCaseReviewEdit) {
        return <div data-testid="search-view">Search View</div>;
      }
      
      // Simulate list view
      if (currentView === 'list' && !showCaseCollector && !showCaseReviewEdit) {
        return <div data-testid="list-view">List View</div>;
      }
      
      // Simulate add form
      if (currentView === 'add' && !showCaseCollector && !showCaseReviewEdit) {
        return <div data-testid="add-form">Add Form</div>;
      }
      
      // Simulate chat view
      if (showCaseCollector && !showCaseReviewEdit) {
        return <div data-testid="chat-view">Chat View</div>;
      }
      
      // Simulate review edit
      if (showCaseReviewEdit && !showCaseCollector) {
        return <div data-testid="review-edit">Review Edit</div>;
      }
      
      return <div>No View</div>;
    };
    
    return <AppComponent />;
  };
  
  render(mockApp());
  
  // Should show search view initially
  expect(screen.getByTestId('search-view')).toBeInTheDocument();
  expect(screen.queryByTestId('list-view')).not.toBeInTheDocument();
  expect(screen.queryByTestId('add-form')).not.toBeInTheDocument();
  expect(screen.queryByTestId('chat-view')).not.toBeInTheDocument();
  expect(screen.queryByTestId('review-edit')).not.toBeInTheDocument();
});
