'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { ContentType, TimeRange, ContentItem } from './types/content';
import LeaderboardItem from './components/LeaderboardItem';
import LeaderboardFilters from './components/LeaderboardFilters';
import SearchBar from './components/SearchBar';
import debounce from 'lodash/debounce';

export default function Home() {
  const [category, setCategory] = useState<ContentType>('movie');
  const [timeRange, setTimeRange] = useState<TimeRange>('1w');
  const [count, setCount] = useState<number>(10);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter items based on search query
  const filterItems = useMemo(() => {
    return debounce((query: string) => {
      if (!query.trim()) {
        setItems(allItems);
        return;
      }

      const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const filtered = allItems.filter(item => {
        const searchableText = {
          title: item.title.toLowerCase(),
          description: item.description.toLowerCase(),
          genres: item.genres.join(' ').toLowerCase(),
          rating: item.rating.toString(),
          year: new Date(item.releaseDate).getFullYear().toString(),
          mpaa: (item.rating_mpaa || '').toLowerCase()
        };

        // Match if ALL search terms are found in ANY of the searchable fields
        return searchTerms.every(term => 
          Object.values(searchableText).some(field => field.includes(term))
        );
      });

      setItems(filtered);
    }, 300);
  }, [allItems]);

  // Fetch data when filters change
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching data with params:', { category, timeRange, count });
        const response = await fetch(
          `/api/leaderboard?category=${category}&timeRange=${timeRange}&count=${Math.max(count, 100)}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', {
          itemCount: data.items.length,
          totalCount: data.totalCount
        });
        
        if (!data.items || !Array.isArray(data.items)) {
          throw new Error('Invalid data format received from API');
        }

        setAllItems(data.items);
        setItems(data.items.slice(0, count));
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
        setItems([]);
        setAllItems([]);
      }
      setLoading(false);
    }

    fetchData();
  }, [category, timeRange, count]);

  // Handle search input changes
  useEffect(() => {
    filterItems(searchQuery);
    return () => filterItems.cancel();
  }, [searchQuery, filterItems]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Highratings.com</h1>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Filters Card */}
            <LeaderboardFilters
              category={category}
              setCategory={setCategory}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              count={count}
              setCount={setCount}
            />

            {/* Search */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={loading}
              noResults={items.length === 0 && !error}
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Content List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : error ? null : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No results found for the current filters
                </div>
              ) : (
                items.map((item) => (
                  <LeaderboardItem
                    key={item.id}
                    item={item}
                    onRatingChange={(rating) => {
                      setItems(items.map(i => 
                        i.id === item.id 
                          ? { ...i, userRating: rating }
                          : i
                      ));
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-4">
            {/* Advertisement */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Advertisement</h2>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                Ad Placeholder
              </div>
            </div>

            {/* User Dashboard */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">User Dashboard</h2>
              <button className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Sign In / Register
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
