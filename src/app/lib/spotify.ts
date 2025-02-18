import { Buffer } from 'buffer';
import { ContentItem } from '../types/content';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
  }[];
  album: {
    id: string;
    name: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);
  return accessToken;
}

export async function searchTracks(query: string, limit: number = 10) {
  const token = await getAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data.tracks.items.map(transformTrackData);
}

export async function getTrackById(id: string) {
  const token = await getAccessToken();
  const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return transformTrackData(data);
}

export async function getTopTracks(limit: number = 10): Promise<ContentItem[]> {
  const token = await getAccessToken();
  
  // Get new releases instead of playlist
  const response = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?limit=${limit}&country=US`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to fetch new releases:', await response.text());
    return [];
  }

  const data = await response.json();
  
  // Get detailed track information for each album's most popular track
  const albumIds = data.albums.items.map((album: any) => album.id);
  const tracksPromises = albumIds.map(async (albumId: string) => {
    const albumResponse = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!albumResponse.ok) return null;
    
    const albumData = await albumResponse.json();
    const track = albumData.items[0];
    if (!track) return null;
    
    // Get the full track details
    const trackResponse = await fetch(
      `https://api.spotify.com/v1/tracks/${track.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!trackResponse.ok) return null;
    
    return trackResponse.json();
  });

  const tracks = await Promise.all(tracksPromises);
  return tracks
    .filter((track): track is SpotifyTrack => track !== null)
    .map(transformTrackData)
    .filter((track): track is ContentItem => track !== null);
}

function transformTrackData(track: SpotifyTrack): ContentItem | null {
  if (!track) return null;
  
  return {
    id: track.id,
    rank: 0, // This will be updated when filtered/sorted in the leaderboard
    title: track.name,
    imageUrl: track.album?.images?.[0]?.url || '',
    rating: track.popularity / 20, // Convert 0-100 popularity to 0-5 rating
    releaseDate: track.album?.release_date || '',
    duration: msToMinutesAndSeconds(track.duration_ms),
    genres: track.artists?.map((artist) => artist.name) || [],
    description: `By ${track.artists?.map((a) => a.name).join(', ')} • ${track.album?.name}`,
    streamingLinks: [track.external_urls?.spotify || ''],
  };
}

function msToMinutesAndSeconds(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
} 