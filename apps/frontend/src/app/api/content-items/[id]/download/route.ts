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

    // Check if the content item has a torrent URL
    if (!contentItem.url) {
      return NextResponse.json(
        { error: 'Content item has no torrent URL' },
        { status: 400 }
      );
    }

    // Validate that the URL looks like a torrent (magnet link or .torrent file)
    const isMagnetLink = contentItem.url.startsWith('magnet:');
    const isTorrentFile = contentItem.url.endsWith('.torrent');
    
    if (!isMagnetLink && !isTorrentFile) {
      return NextResponse.json(
        { error: 'Content item URL is not a valid torrent URL' },
        { status: 400 }
      );
    }

    // Create Redis connection and queue
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    const downloadQueue = new Queue('torrent-download', { connection: redis });

    // Update status to DOWNLOAD_QUEUED
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { processingStatus: 'DOWNLOAD_QUEUED' },
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

    // Close Redis connection
    await redis.quit();

    return NextResponse.json({
      success: true,
      message: 'Download queued successfully',
      contentItemId,
    });
  } catch (error) {
    console.error('Error queuing download:', error);

    // Handle auth errors
    if (
      error instanceof Error &&
      (error.message === 'Unauthorized' ||
        error.message === 'Admin access required')
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to queue download' },
      { status: 500 }
    );
  }
}
