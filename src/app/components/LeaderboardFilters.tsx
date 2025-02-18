import { ContentType, TimeRange } from '../types/content';

interface LeaderboardFiltersProps {
  category: ContentType;
  setCategory: (category: ContentType) => void;
  timeRange: TimeRange;
  setTimeRange: (timeRange: TimeRange) => void;
  count: number;
  setCount: (count: number) => void;
}

export default function LeaderboardFilters({
  category,
  setCategory,
  timeRange,
  setTimeRange,
  count,
  setCount,
}: LeaderboardFiltersProps) {
  return (
    <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
      {/* Categories */}
      <div className="flex p-2 bg-gray-50">
        {(['movie', 'tv', 'music', 'book'] as ContentType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setCategory(tab)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              category === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'movie' && 'Movies'}
            {tab === 'tv' && 'TV Shows'}
            {tab === 'music' && 'Music'}
            {tab === 'book' && 'Books'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex border-t border-gray-200">
        {/* Count Filters */}
        <div className="flex p-2 gap-2 border-r border-gray-200">
          {[10, 25, 50, 100].map((num) => (
            <button
              key={num}
              onClick={() => setCount(num)}
              className={`px-4 py-1 rounded-lg text-sm transition-colors ${
                count === num
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Top {num}
            </button>
          ))}
        </div>
        
        {/* Time Range Filters */}
        <div className="flex p-2 gap-2">
          {[
            { value: '1w', label: '1 Week' },
            { value: '1m', label: '1 Month' },
            { value: '1y', label: '1 Year' },
            { value: 'all', label: 'All-time' }
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setTimeRange(period.value as TimeRange)}
              className={`px-4 py-1 rounded-lg text-sm transition-colors ${
                timeRange === period.value
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 