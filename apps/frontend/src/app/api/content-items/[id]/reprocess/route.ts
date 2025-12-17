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
        { error: 'episodeId is required' },
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

    // Create Redis connection
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    // Delete existing video analysis
    await prisma.videoAnalysis.deleteMany({
      where: { episodeId },
    });

    // Check if we should skip download (if file already exists)
    const skipDownload = !!contentItem.downloadedFileName;

    if (skipDownload && contentItem.downloadedFileName) {
      // If we have a downloaded file, go straight to video processing
      const videoProcessingQueue = new Queue('video-processing', {
        connection: redis,
      });

      // Update status to PROCESSING_QUEUED
      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: { processingStatus: 'PROCESSING_QUEUED' },
      });

      // Queue video processing
      await videoProcessingQueue.add(
        'process-video',
        {
          contentItemId,
          episodeId,
          videoFileName: contentItem.downloadedFileName,
        },
        {
          attempts: 1,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        }
      );
    } else {
      // Reset status and start from download
      const downloadQueue = new Queue('torrent-download', { connection: redis });

      // Update status to DOWNLOAD_QUEUED
      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          processingStatus: 'DOWNLOAD_QUEUED',
          downloadedFileName: null,
        },
      });

      // Queue the download job
      await downloadQueue.add(
        'download-torrent',
        {
          contentItemId,
          torrentUrl: contentItem.url,
          infoHash: contentItem.infoHash,
        },
        {
          attempts: 1,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        }
      );
    }

    // Close Redis connection
    await redis.quit();

    return NextResponse.json({
      success: true,
      message: 'Reprocessing started',
      contentItemId,
    });
  } catch (error) {
    console.error('Error reprocessing item:', error);

    // Handle auth errors
    if (
      error instanceof Error &&
      (error.message === 'Unauthorized' ||
        error.message === 'Admin access required')
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to start reprocessing' },
      { status: 500 }
    );
  }
}

