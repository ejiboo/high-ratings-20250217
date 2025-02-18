export type ContentType = 'movie' | 'tv' | 'music' | 'book';
export type TimeRange = '1w' | '1m' | '1y' | 'all';
export type ContentCount = 10 | 25 | 50 | 100;

export interface UserInteraction {
  userId: string;
  contentId: string;
  bookmarked: boolean;
  liked: boolean;
  inList: boolean;
  viewed: boolean;
  viewCount: number;
  rating: number;
  timestamp: number;
}

export interface ContentItem {
  id: string;
  rank: number;
  title: string;
  imageUrl: string;
  rating: number;
  releaseDate: string;
  duration?: string;
  rating_mpaa?: string;
  genres: string[];
  description: string;
  userRating?: number;
  userInteractions?: UserInteraction;
  streamingLinks?: string[];
}

export interface LeaderboardResponse {
  items: ContentItem[];
  totalCount: number;
  category: ContentType;
  timeRange: TimeRange;
} 