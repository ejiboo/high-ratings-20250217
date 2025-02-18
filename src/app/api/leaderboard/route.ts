import { NextResponse } from 'next/server';
import { ContentType, TimeRange, ContentItem, LeaderboardResponse } from '@/app/types/content';
import { getTopTracks } from '@/app/lib/spotify';

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

const fetchOptions = {
  headers: {
    'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

async function fetchGenres(type: 'movie' | 'tv') {
  const response = await fetch(
    `${TMDB_BASE_URL}/genre/${type}/list`,
    fetchOptions
  );
  const data = await response.json();
  return data.genres.reduce((acc: { [key: number]: string }, genre: { id: number, name: string }) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {});
}

async function fetchMovies(timeRange: TimeRange): Promise<ContentItem[]> {
  const today = new Date();
  let startDate = new Date();
  
  // Calculate date range based on timeRange
  switch (timeRange) {
    case '1w':
      startDate.setDate(today.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case '1y':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    case 'all':
      startDate = new Date(1900, 0, 1);
      break;
  }

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];

  console.log('Fetching movies with params:', {
    timeRange,
    startDate: startDateStr,
    endDate: endDateStr
  });

  // Fetch multiple pages
  const pagePromises = Array.from({ length: 5 }, (_, i) => {
    const url = `${TMDB_BASE_URL}/discover/movie?` +
      `language=en-US&sort_by=vote_average.desc&` +
      `page=${i + 1}&` +
      `vote_count.gte=1000&` +
      `primary_release_date.gte=${startDateStr}&` +
      `primary_release_date.lte=${endDateStr}`;
    
    return fetch(url, fetchOptions)
      .then(res => {
        if (!res.ok) {
          throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .catch(error => {
        console.error(`Error fetching page ${i + 1}:`, error);
        return { results: [] }; // Return empty results on error
      });
  });

  const pages = await Promise.all(pagePromises);
  const genresMap = await fetchGenres('movie');

  // Log the results count
  const totalResults = pages.reduce((sum, page) => sum + (page.results?.length || 0), 0);
  console.log(`Found ${totalResults} movies total across ${pages.length} pages`);
  
  // Combine and sort all results
  const allMovies = pages
    .flatMap(page => page.results || [])
    .filter(movie => movie) // Filter out any null/undefined results
    .sort((a, b) => b.vote_average - a.vote_average)
    .map((movie: any, index: number) => ({
      id: movie.id.toString(),
      rank: index + 1,
      title: movie.title,
      imageUrl: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image',
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      releaseDate: movie.release_date,
      genres: movie.genre_ids?.map((id: number) => genresMap[id]) || [],
      description: movie.overview || '',
      rating_mpaa: '', 
      duration: '',
    }));

  console.log(`Returning ${allMovies.length} processed movies`);
  return allMovies;
}

async function fetchTVShows(timeRange: TimeRange): Promise<ContentItem[]> {
  const today = new Date();
  let startDate = new Date();
  
  // Calculate date range based on timeRange
  switch (timeRange) {
    case '1w':
      startDate.setDate(today.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case '1y':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    case 'all':
      startDate = new Date(1900, 0, 1);
      break;
  }

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];

  // Fetch multiple pages
  const pages = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      fetch(
        `${TMDB_BASE_URL}/discover/tv?` +
        `language=en-US&sort_by=vote_average.desc&` +
        `page=${i + 1}&` +
        `vote_count.gte=1000&` +
        `first_air_date.gte=${startDateStr}&` +
        `first_air_date.lte=${endDateStr}`,
        fetchOptions
      ).then(res => res.json())
    )
  );

  const genresMap = await fetchGenres('tv');
  
  // Combine and sort all results
  const allShows = pages
    .flatMap(page => page.results)
    .sort((a, b) => b.vote_average - a.vote_average)
    .map((show: any, index: number) => ({
      id: show.id.toString(),
      rank: index + 1,
      title: show.name,
      imageUrl: show.poster_path 
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image',
      rating: show.vote_average,
      voteCount: show.vote_count,
      releaseDate: show.first_air_date,
      genres: show.genre_ids.map((id: number) => genresMap[id]),
      description: show.overview,
      duration: `${show.episode_run_time?.[0] || ''} min`,
    }));

  return allShows;
}

async function fetchBooks(timeRange: TimeRange): Promise<ContentItem[]> {
  const today = new Date();
  let startDate = new Date();
  
  // Calculate date range based on timeRange
  switch (timeRange) {
    case '1w':
      startDate.setDate(today.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case '1y':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    case 'all':
      startDate = new Date(1900, 0, 1);
      break;
  }

  // Fetch multiple queries to get a better variety of books
  const queries = [
    'subject:fiction&orderBy=newest',
    'subject:literature&orderBy=relevance',
    'subject:mystery&orderBy=newest'
  ];

  const booksPromises = queries.map(async (query) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?` +
        `q=${query}&` +
        `startIndex=0&maxResults=20&` +
        `key=${GOOGLE_BOOKS_API_KEY}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch books for query ${query}:`, response.statusText);
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error(`Error fetching books for query ${query}:`, error);
      return [];
    }
  });

  const allBooksResults = await Promise.all(booksPromises);
  const allBooks = allBooksResults.flat();
  
  // Filter and transform the results
  return allBooks
    .filter((book: any) => {
      if (!book?.volumeInfo) return false;
      const publishedDate = book.volumeInfo.publishedDate;
      return (
        publishedDate && 
        new Date(publishedDate) >= startDate &&
        book.volumeInfo.imageLinks?.thumbnail &&
        book.volumeInfo.description &&
        book.volumeInfo.averageRating
      );
    })
    .sort((a: any, b: any) => {
      // Sort by rating first, then by number of ratings
      const ratingDiff = (b.volumeInfo.averageRating || 0) - (a.volumeInfo.averageRating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.volumeInfo.ratingsCount || 0) - (a.volumeInfo.ratingsCount || 0);
    })
    .map((book: any, index: number) => ({
      id: book.id,
      rank: index + 1,
      title: book.volumeInfo.title,
      imageUrl: book.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || 'https://via.placeholder.com/500x750?text=No+Image',
      rating: book.volumeInfo.averageRating || 4,
      releaseDate: book.volumeInfo.publishedDate,
      genres: book.volumeInfo.categories || [],
      description: book.volumeInfo.description || '',
      authors: book.volumeInfo.authors || [],
      pageCount: book.volumeInfo.pageCount,
      publisher: book.volumeInfo.publisher,
      ratingsCount: book.volumeInfo.ratingsCount,
    }));
}

async function fetchMusic(timeRange: TimeRange): Promise<ContentItem[]> {
  // Get top tracks from Spotify
  const tracks = await getTopTracks(50);
  
  // Filter by time range if needed
  const startDate = new Date();
  switch (timeRange) {
    case '1w':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'all':
      return tracks;
  }
  
  return tracks.filter((track: ContentItem) => new Date(track.releaseDate) >= startDate);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as ContentType || 'movie';
  const timeRange = searchParams.get('timeRange') as TimeRange || '1w';
  const count = parseInt(searchParams.get('count') || '10');

  console.log('Leaderboard API called with params:', { category, timeRange, count });

  let items: ContentItem[] = [];

  try {
    switch (category) {
      case 'movie':
        items = await fetchMovies(timeRange);
        break;
      case 'tv':
        items = await fetchTVShows(timeRange);
        break;
      case 'music':
        items = await fetchMusic(timeRange);
        break;
      case 'book':
        items = await fetchBooks(timeRange);
        break;
      default:
        throw new Error('Invalid category');
    }

    if (!items || items.length === 0) {
      console.warn('No items found for category:', category);
      return NextResponse.json(
        { error: 'No content found for the specified criteria' },
        { status: 404 }
      );
    }

    const response: LeaderboardResponse = {
      items: items.slice(0, count),
      totalCount: items.length,
      category,
      timeRange,
    };

    console.log(`Returning ${response.items.length} items out of ${response.totalCount} total`);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 