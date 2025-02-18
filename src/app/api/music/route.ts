import { NextResponse } from 'next/server';
import { searchTracks, getTrackById, getTopTracks } from '@/app/lib/spotify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const trackId = searchParams.get('trackId');
    const getTop = searchParams.get('top') === 'true';
    const limit = Number(searchParams.get('limit')) || 10;

    if (trackId) {
      const track = await getTrackById(trackId);
      return NextResponse.json({ track });
    }

    if (getTop) {
      const tracks = await getTopTracks(limit);
      return NextResponse.json({ tracks });
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required for search' },
        { status: 400 }
      );
    }

    const tracks = await searchTracks(query, limit);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error with music API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch music data' },
      { status: 500 }
    );
  }
} 