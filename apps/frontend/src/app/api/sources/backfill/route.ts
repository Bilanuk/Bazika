import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    console.log('Checking admin authentication...');
    await requireAdmin();
    console.log('Admin authentication successful');
    
    const body = await request.json();
    const { sourceIds, startPage = 1, endPage = 10, throttleMs = 2000 } = body;

    console.log('Backfill request body:', { sourceIds, startPage, endPage, throttleMs });

    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return NextResponse.json(
        { error: 'Source IDs are required' },
        { status: 400 }
      );
    }

    if (startPage < 1 || endPage < startPage) {
      return NextResponse.json(
        { error: 'Invalid page range' },
        { status: 400 }
      );
    }

    if (endPage - startPage > 50) {
      return NextResponse.json(
        { error: 'Page range too large (maximum 50 pages)' },
        { status: 400 }
      );
    }

    // Determine backend URL
    let backendUrl: string;
    if (process.env.NEXT_PUBLIC_API_URL) {
      // Production: remove /graphql from the GraphQL URL to get REST API base
      backendUrl = process.env.NEXT_PUBLIC_API_URL.replace('/graphql', '');
    } else {
      // Development: use localhost:4001 directly
      backendUrl = 'http://localhost:4001';
    }
    
    const fullUrl = `${backendUrl}/content-monitoring/backfill`;
    console.log('Proxying backfill request to:', fullUrl);

    // Call backend API
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceIds,
        startPage,
        endPage,
        throttleMs,
      }),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Failed to start backfill' };
      }
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to start backfill' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Backfill response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in backfill API:', error);
    
    // Handle auth errors
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      console.error('Authentication error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start backfill' },
      { status: 500 }
    );
  }
} 