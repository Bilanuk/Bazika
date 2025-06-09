import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serialId = searchParams.get('serialId');
    const episodeSearch = searchParams.get('episodeSearch');

    // Get unique serials that have content items
    const uniqueSerials = await prisma.serial.findMany({
      where: {
        contentItems: {
          some: {}
        }
      },
      select: {
        id: true,
        title: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    // Get unique episodes that have content items
    let episodeWhere: any = {
      contentItems: {
        some: {}
      }
    };

    // Filter by serial if provided
    if (serialId) {
      episodeWhere.serialId = serialId;
    }

    // Add search filter for episodes
    if (episodeSearch) {
      episodeWhere.OR = [
        {
          title: {
            contains: episodeSearch,
            mode: 'insensitive'
          }
        },
        {
          episodeNumber: {
            equals: parseInt(episodeSearch) || undefined
          }
        }
      ];
    }

    const uniqueEpisodes = await prisma.episode.findMany({
      where: episodeWhere,
      select: {
        id: true,
        episodeNumber: true,
        title: true,
        serialId: true,
        serial: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: [
        { serial: { title: 'asc' } },
        { episodeNumber: 'asc' }
      ]
    });

    // Get unique sources that have content items
    const uniqueSources = await prisma.source.findMany({
      where: {
        contentItems: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      serials: uniqueSerials,
      episodes: uniqueEpisodes,
      sources: uniqueSources
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
} 