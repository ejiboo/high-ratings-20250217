import { NextResponse } from 'next/server';

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = searchParams.get('maxResults') || '10';
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${GOOGLE_BOOKS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Books API');
    }

    const data = await response.json();
    
    // Transform the data to match our needs
    const books = data.items?.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      description: item.volumeInfo.description,
      publishedDate: item.volumeInfo.publishedDate,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories || [],
      averageRating: item.volumeInfo.averageRating,
      ratingsCount: item.volumeInfo.ratingsCount,
      imageLinks: item.volumeInfo.imageLinks || {},
      language: item.volumeInfo.language,
      previewLink: item.volumeInfo.previewLink,
    })) || [];

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
} 