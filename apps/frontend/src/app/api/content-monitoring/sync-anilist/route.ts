import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    // Determine backend URL - for REST API, we need the base URL without /graphql
    let backendUrl: string;
    if (process.env.NEXT_PUBLIC_API_URL) {
      // Production: remove /graphql from the GraphQL URL to get REST API base
      backendUrl = process.env.NEXT_PUBLIC_API_URL.replace('/graphql', '');
    } else {
      // Development: use localhost:4001 directly
      backendUrl = 'http://localhost:4001';
    }
    
    const fullUrl = `${backendUrl}/content-monitoring/sync-anilist?limit=${limit}`;
    
    console.log('Proxying AniList sync request to:', fullUrl);

    // Forward the request to the backend
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Failed to sync with AniList' };
      }
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to sync with AniList' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('AniList sync response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('AniList sync error:', error);
    
    // Handle auth errors specifically
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 