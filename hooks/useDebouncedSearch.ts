"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface DebouncedSearchOptions {
  debounceMs?: number;
  minLength?: number;
  onSearch?: (query: string) => void;
  onClear?: () => void;
}

export interface DebouncedSearchReturn {
  query: string;
  debouncedQuery: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  isSearching: boolean;
  isPending: boolean;
}

/**
 * Custom hook for debounced search functionality
 * Provides search state management with debouncing and loading indicators
 */
export function useDebouncedSearch(
  initialQuery: string = '',
  options: DebouncedSearchOptions = {}
): DebouncedSearchReturn {
  const {
    debounceMs = 300,
    minLength = 0,
    onSearch,
    onClear,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, debounceMs);

  // Check if search is pending (user typed but debounce hasn't fired yet)
  const isPending = query !== debouncedQuery;
  
  // Check if actively searching (debounced query meets criteria)
  const isSearching = debouncedQuery.length >= minLength && debouncedQuery.trim() !== '';

  // Handle debounced search execution
  useEffect(() => {
    if (debouncedQuery.length >= minLength && onSearch) {
      onSearch(debouncedQuery);
    } else if (debouncedQuery.length === 0 && onClear) {
      onClear();
    }
  }, [debouncedQuery, minLength, onSearch, onClear]);

  // Clear query function
  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    debouncedQuery,
    setQuery,
    clearQuery,
    isSearching,
    isPending,
  };
}
