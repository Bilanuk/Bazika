import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { ProcessingStatus } from '@database';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sourceId = searchParams.get('sourceId');
    const search = searchParams.get('search');
    
    // Parse filter parameters
    const qualityFilter = searchParams.get('quality');
    const processingStatusFilter = searchParams.get('processingStatus');
    const notificationSentFilter = searchParams.get('notificationSent');
    const sourceNameFilter = searchParams.get('sourceName');
    const serialTitleFilter = searchParams.get('serialTitle');
    const episodeNumberFilter = searchParams.get('episodeNumber');

    // Build where clause
    const where: any = {};

    // Source filter
    if (sourceId) {
      where.sourceId = sourceId;
    }

    // Quality filter
    if (qualityFilter) {
      const qualities = qualityFilter.split(',');
      where.quality = {
        in: qualities
      };
    }

    // Source name filter (for multi-source filtering)
    if (sourceNameFilter) {
      const sourceNames = sourceNameFilter.split(',');
      where.source = {
        name: {
          in: sourceNames
        }
      };
    }

    // Processing status filter
    if (processingStatusFilter) {
      const statuses = processingStatusFilter.split(',') as ProcessingStatus[];
      where.processingStatus = {
        in: statuses
      };
    }

    // Notification sent filter
    if (notificationSentFilter) {
      const notificationValues = notificationSentFilter.split(',').map(val => val === 'true');
      if (notificationValues.length === 1) {
        where.notificationSent = notificationValues[0];
      } else if (notificationValues.length > 1) {
        where.notificationSent = {
          in: notificationValues
        };
      }
    }

    // Serial title filter
    if (serialTitleFilter) {
      const serialTitles = serialTitleFilter.split(',');
      where.serial = {
        title: {
          in: serialTitles
        }
      };
    }

    // Episode number filter
    if (episodeNumberFilter) {
      const episodeNumbers = episodeNumberFilter.split(',').map(num => parseInt(num)).filter(num => !isNaN(num));
      if (episodeNumbers.length > 0) {
        where.episode = {
          episodeNumber: {
            in: episodeNumbers
          }
        };
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          serial: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    console.log('Content items query where clause:', JSON.stringify(where, null, 2));

    // Get total count for pagination
    const totalCount = await prisma.contentItem.count({ where });

    // Get filtered content items
    const contentItems = await prisma.contentItem.findMany({
      where,
      include: { 
        source: true,
        serial: true,
        episode: true
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset
    });

    return NextResponse.json({ 
      contentItems,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
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