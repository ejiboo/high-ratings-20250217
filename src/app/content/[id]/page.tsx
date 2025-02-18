'use client';

import { useState, useEffect } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { ContentItem } from '../../types/content';
import ContentInteractions from '../../components/ContentInteractions';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ContentDetailPageProps {
  params: {
    id: string;
  };
}

export default function ContentDetailPage({ params }: ContentDetailPageProps) {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(`/api/content/${params.id}`);
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
      setLoading(false);
    }

    fetchContent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-500">Content not found</div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Leaderboard
      </Link>

      {/* Content Header */}
      <div className="flex gap-8 mb-8">
        <img
          src={content.imageUrl}
          alt={content.title}
          className="w-48 h-64 object-cover rounded-lg bg-gray-100 flex-shrink-0"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
          <div className="flex gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
              {content.rating.toFixed(1)}
            </span>
            <span>{new Date(content.releaseDate).getFullYear()}</span>
            {content.duration && <span>{content.duration}</span>}
            {content.rating_mpaa && <span>{content.rating_mpaa}</span>}
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {content.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content Description */}
      <div className="prose max-w-none mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="text-gray-600">{content.description}</p>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <dl className="space-y-2">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-700">Release Date:</dt>
              <dd className="text-gray-600">
                {new Date(content.releaseDate).toLocaleDateString()}
              </dd>
            </div>
            {content.duration && (
              <div className="flex gap-2">
                <dt className="font-medium text-gray-700">Duration:</dt>
                <dd className="text-gray-600">{content.duration}</dd>
              </div>
            )}
            {content.rating_mpaa && (
              <div className="flex gap-2">
                <dt className="font-medium text-gray-700">Rating:</dt>
                <dd className="text-gray-600">{content.rating_mpaa}</dd>
              </div>
            )}
          </dl>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Rankings</h2>
          <dl className="space-y-2">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-700">Current Rank:</dt>
              <dd className="text-gray-600">#{content.rank}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-700">Rating:</dt>
              <dd className="text-gray-600">{content.rating.toFixed(1)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Interactions */}
      <div className="border-t border-gray-200 pt-8">
        <ContentInteractions
          contentId={content.id}
          initialInteraction={content.userInteractions}
          onRatingChange={(rating) => {
            setContent(content ? { ...content, userRating: rating } : null);
          }}
        />
      </div>
    </main>
  );
} 