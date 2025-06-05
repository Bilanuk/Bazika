import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      include: { 
        contentItems: {
          take: 5,
          orderBy: { publishedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    
    // Handle auth errors
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
} 