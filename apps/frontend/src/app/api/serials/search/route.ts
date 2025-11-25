import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json({ serials: [] });
    }

    const serials = await prisma.serial.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { titleRomaji: { contains: query, mode: 'insensitive' } },
          { titleEnglish: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ serials });
  } catch (error) {
    console.error('Error searching serials:', error);
    
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to search serials' }, { status: 500 });
  }
}



