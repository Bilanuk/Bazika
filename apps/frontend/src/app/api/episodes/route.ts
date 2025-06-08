import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');

    const [episodes, totalCount] = await Promise.all([
      prisma.episode.findMany({
        include: {
          serial: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.episode.count(),
    ]);

    return NextResponse.json({
      episodes,
      totalCount,
      hasMore: skip + take < totalCount,
    });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
} 