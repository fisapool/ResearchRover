import React, { useState, useEffect } from 'react';
import { Note, Highlight } from '../lib/types';

interface EnhancedSearchProps {
  notes: Note[];
  onSearch: (results: SearchResults) => void;
}

interface SearchResults {
  notes: Note[];
  highlights: Highlight[];
  relatedPapers: RelatedPaper[];
}

interface RelatedPaper {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  relevanceScore: number;
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({ notes, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'semantic' | 'exact'>('semantic');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    tags: [] as string[],
    folders: [] as string[],
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // This is a placeholder for the actual API call
      // You would need to implement the actual search functionality
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          type: searchType,
          filters,
        }),
      });

      const results = await response.json();
      onSearch(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, highlights, and papers..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Type
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'semantic' | 'exact')}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="semantic">Semantic Search</option>
              <option value="exact">Exact Match</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            {searchType === 'semantic'
              ? 'Search using natural language to find related content.'
              : 'Search for exact matches in your notes and highlights.'}
          </p>
        </div>
      </div>
    </div>
  );
}; 