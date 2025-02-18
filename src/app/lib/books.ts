export interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  categories: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  language?: string;
  previewLink?: string;
}

export async function searchBooks(query: string, maxResults: number = 10): Promise<Book[]> {
  try {
    const response = await fetch(`/api/books?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    return data.books;
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

export async function getBookById(bookId: string): Promise<Book | null> {
  try {
    const response = await fetch(`/api/books?q=id:${bookId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }

    const data = await response.json();
    return data.books[0] || null;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
} 