/**
 * Search Bar Component with Autocomplete and Debounce
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions?: Product[];
  loading?: boolean;
}

export default function SearchBar({ onSearch, suggestions = [], loading = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query);
        setShowSuggestions(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  useEffect(() => {
    // Close suggestions on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="Поиск товаров..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query || searchHistory.length > 0) && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Поиск...</div>
          ) : (
            <>
              {/* Top 5 Search Results */}
              {suggestions.length > 0 && (
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Результаты
                  </div>
                  {suggestions.slice(0, 5).map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={product.image_urls[0] || '/placeholder.png'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">₸{product.price}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && !query && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    История поиска
                  </div>
                  {searchHistory.map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(historyItem);
                        handleSearch(historyItem);
                      }}
                      className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{historyItem}</span>
                    </button>
                  ))}
                </div>
              )}

              {query && suggestions.length === 0 && !loading && (
                <div className="p-4 text-center text-gray-500">
                  Ничего не найдено
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
