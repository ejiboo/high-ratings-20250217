import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { ContentItem } from '../types/content';
import ContentInteractions from './ContentInteractions';
import Link from 'next/link';

interface LeaderboardItemProps {
  item: ContentItem;
  onRatingChange: (rating: number) => void;
}

export default function LeaderboardItem({ item, onRatingChange }: LeaderboardItemProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Information Section */}
      <Link href={`/content/${item.id}`}>
        <div className="p-6 h-[200px] hover:bg-gray-50 transition-colors">
          <div className="flex gap-4 h-full">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-24 h-32 object-cover rounded bg-gray-100 flex-shrink-0"
            />
            <div className="flex-1 overflow-hidden">
              <h2 className="text-xl font-bold mb-2 text-gray-900">
                {item.rank}. {item.title}
              </h2>
              <div className="flex gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <StarIconSolid className="w-4 h-4 text-yellow-400" />
                  {item.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  {new Date(item.releaseDate).getFullYear()}
                </span>
                {item.duration && (
                  <span className="flex items-center gap-1">{item.duration}</span>
                )}
                {item.rating_mpaa && (
                  <span className="flex items-center gap-1">{item.rating_mpaa}</span>
                )}
              </div>
              <div className="flex gap-2 mb-2 flex-wrap">
                {item.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Interaction Section */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <ContentInteractions
          contentId={item.id}
          initialInteraction={item.userInteractions}
          onRatingChange={onRatingChange}
        />
      </div>
    </div>
  );
} 