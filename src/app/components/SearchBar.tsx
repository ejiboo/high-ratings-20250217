import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  noResults: boolean;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  loading,
  noResults,
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {searchQuery && noResults && !loading && (
        <p className="mt-2 text-sm text-gray-500">
          No results found for &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  );
} 