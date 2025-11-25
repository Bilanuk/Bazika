import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
      }
      description
      averageScore
    }
  }
}
`;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { search: query },
      }),
    });

    if (!response.ok) {
      throw new Error('AniList API request failed');
    }

    const data = await response.json();
    const results = data.data?.Page?.media || [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching AniList:', error);
    
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to search AniList' }, { status: 500 });
  }
}



