'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { addDocument, updateDocument, getDocuments } from '@/lib/firebase/firebaseUtils';
import {
  BookmarkIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  ShareIcon,
  StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkIconSolid,
  HeartIcon as HeartIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  EyeIcon as EyeIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { UserInteraction } from '../types/content';
import { Tooltip } from './Tooltip';

interface ContentInteractionsProps {
  contentId: string;
  initialInteraction?: UserInteraction;
  onRatingChange?: (rating: number) => void;
}

export default function ContentInteractions({
  contentId,
  initialInteraction,
  onRatingChange
}: ContentInteractionsProps) {
  const { user } = useAuth();
  const [interaction, setInteraction] = useState<UserInteraction | null>(
    initialInteraction || null
  );
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (user && !interaction) {
      loadUserInteraction();
    }
  }, [user, contentId]);

  const loadUserInteraction = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const interactions = await getDocuments(`users/${user.uid}/interactions`);
      const existingInteraction = interactions.find(
        (i: any) => i.contentId === contentId
      ) as UserInteraction | undefined;
      
      if (existingInteraction) {
        setInteraction(existingInteraction);
      }
    } catch (error) {
      console.error('Error loading interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateInteraction = async (updates: Partial<UserInteraction>) => {
    if (!user) return;

    setIsLoading(true);
    const newInteraction = {
      ...(interaction || {
        userId: user.uid,
        contentId,
        bookmarked: false,
        liked: false,
        inList: false,
        viewed: false,
        viewCount: 0,
        rating: 0,
        timestamp: Date.now()
      }),
      ...updates,
      timestamp: Date.now()
    } as UserInteraction;

    try {
      if (!interaction) {
        await addDocument(`users/${user.uid}/interactions`, newInteraction);
      } else {
        await updateDocument(
          `users/${user.uid}/interactions`,
          interaction.contentId,
          newInteraction
        );
      }
      setInteraction(newInteraction);
      
      // Update view count if the update includes a view
      if ('viewCount' in updates) {
        setViewCount(newInteraction.viewCount || 0);
      }
    } catch (error) {
      console.error('Error updating interaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = (rating: number) => {
    updateInteraction({ rating });
    if (onRatingChange) {
      onRatingChange(rating);
    }
  };

  const handleView = () => {
    const newViewCount = (interaction?.viewCount || 0) + 1;
    updateInteraction({ viewed: true, viewCount: newViewCount });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this content',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 items-center animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-8 h-8 bg-gray-200 rounded-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <Tooltip content={interaction?.bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}>
        <button
          onClick={() => updateInteraction({ bookmarked: !interaction?.bookmarked })}
          className={`p-2 transition-colors duration-200 ${
            interaction?.bookmarked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
          }`}
          disabled={isLoading}
        >
          {interaction?.bookmarked ? (
            <BookmarkIconSolid className="w-5 h-5" />
          ) : (
            <BookmarkIcon className="w-5 h-5" />
          )}
        </button>
      </Tooltip>
      
      <Tooltip content={interaction?.liked ? "Unlike" : "Like"}>
        <button
          onClick={() => updateInteraction({ liked: !interaction?.liked })}
          className={`p-2 transition-colors duration-200 ${
            interaction?.liked ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
          }`}
          disabled={isLoading}
        >
          {interaction?.liked ? (
            <HeartIconSolid className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
        </button>
      </Tooltip>
      
      <Tooltip content={interaction?.inList ? "Remove from list" : "Add to list"}>
        <button
          onClick={() => updateInteraction({ inList: !interaction?.inList })}
          className={`p-2 transition-colors duration-200 ${
            interaction?.inList ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
          }`}
          disabled={isLoading}
        >
          {interaction?.inList ? (
            <ClipboardDocumentListIconSolid className="w-5 h-5" />
          ) : (
            <ClipboardDocumentListIcon className="w-5 h-5" />
          )}
        </button>
      </Tooltip>
      
      <Tooltip content={`Viewed ${interaction?.viewCount || 0} times`}>
        <button
          onClick={handleView}
          className={`p-2 transition-colors duration-200 ${
            interaction?.viewed ? 'text-purple-600' : 'text-gray-500 hover:text-gray-900'
          }`}
          disabled={isLoading}
        >
          {interaction?.viewed ? (
            <EyeIconSolid className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
          {interaction?.viewCount > 0 && (
            <span className="ml-1 text-xs">{interaction.viewCount}</span>
          )}
        </button>
      </Tooltip>
      
      <Tooltip content="Share">
        <button
          onClick={handleShare}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors duration-200"
          disabled={isLoading}
        >
          <ShareIcon className="w-5 h-5" />
        </button>
      </Tooltip>
      
      <div className="ml-auto flex">
        {[...Array(10)].map((_, i) => (
          <Tooltip key={i} content={`Rate ${i + 1} stars`}>
            <button
              className="focus:outline-none transition-colors duration-200"
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRating(i + 1)}
              disabled={isLoading}
            >
              {i < (hoverRating || interaction?.rating || 0) ? (
                <StarIconSolid className="w-5 h-5 text-yellow-400" />
              ) : (
                <StarIconOutline className="w-5 h-5 text-gray-300 hover:text-yellow-400" />
              )}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
} 