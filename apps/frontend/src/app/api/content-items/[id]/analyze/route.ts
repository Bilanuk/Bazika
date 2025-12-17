import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    await requireAdmin();

    const contentItemId = params.id;
    const body = await request.json();
    const { episodeId } = body;

    if (!episodeId) {
      return NextResponse.json(
        { error: 'Episode ID is required' },
        { status: 400 }
      );
    }

    // Find the content item
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
    });

    if (!contentItem) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      );
    }

    if (!contentItem.downloadedFileName) {
      return NextResponse.json(
        { error: 'No downloaded file recorded. Try using "Reprocess" to download again.' },
        { status: 400 }
      );
    }

    // Create Redis connection and queue
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    const analysisQueue = new Queue('video-analysis', { connection: redis });

    // Queue the analysis job
    await analysisQueue.add(
      'analyze',
      {
        contentItemId,
        episodeId,
        inputFileName: contentItem.downloadedFileName,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      }
    );

    // Close Redis connection
    await redis.quit();

    return NextResponse.json({
      success: true,
      message: 'Analysis queued',
      contentItemId,
    });
  } catch (error) {
    console.error('Error queuing analysis:', error);

    // Handle auth errors
    if (
      error instanceof Error &&
      (error.message === 'Unauthorized' ||
        error.message === 'Admin access required')
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to queue analysis' },
      { status: 500 }
    );
  }
}








