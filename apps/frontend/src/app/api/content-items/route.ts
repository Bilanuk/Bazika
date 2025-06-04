import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const sourceId = searchParams.get('sourceId');

    const where = sourceId ? { sourceId } : {};

    const contentItems = await prisma.contentItem.findMany({
      where,
      include: { source: true },
      orderBy: { publishedAt: 'desc' },
      take: limit
    });

    return NextResponse.json({ contentItems });
  } catch (error) {
    console.error('Error fetching content items:', error);
    
    // Handle auth errors
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch content items' },
      { status: 500 }
    );
  }
} 