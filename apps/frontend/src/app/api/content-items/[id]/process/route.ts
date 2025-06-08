import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import prisma from '@/lib/prisma';

// Redis connection will be created per request to avoid connection issues

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let redis: Redis | null = null;
  
  try {
    const contentItemId = params.id;

    // Create Redis connection
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    // Create video processing queue
    const videoProcessingQueue = new Queue('video-processing', {
      connection: redis,
    });

    // Find the content item with episode information
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        episode: true,
      },
    });

    console.log('Content item found:', {
      id: contentItem?.id,
      downloadedFileName: contentItem?.downloadedFileName,
      processingStatus: contentItem?.processingStatus,
      hasEpisode: !!contentItem?.episode,
    });

    if (!contentItem) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      );
    }

    if (!contentItem.episode) {
      return NextResponse.json(
        { error: 'Content item is not associated with an episode' },
        { status: 400 }
      );
    }

    if (
      contentItem.processingStatus !== 'DOWNLOAD_COMPLETED' &&
      contentItem.processingStatus !== 'PROCESSING_FAILED'
    ) {
      return NextResponse.json(
        { error: 'Content item must be downloaded before processing' },
        { status: 400 }
      );
    }

    // Find the video file name from the database and clean it
    const videoFileName = contentItem.downloadedFileName?.trim();
    console.log('Video filename from DB:', videoFileName);

    if (!videoFileName) {
      return NextResponse.json(
        { error: 'No video file found for this content item' },
        { status: 400 }
      );
    }

    // Queue the video processing job
    await videoProcessingQueue.add(
      'process-video',
      {
        contentItemId,
        episodeId: contentItem.episode.id,
        inputFileName: videoFileName,
      },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      }
    );

    // Update status to PROCESSING_QUEUED
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: { processingStatus: 'PROCESSING_QUEUED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Video processing queued successfully',
      contentItemId,
    });
  } catch (error) {
    console.error('Error queuing video processing:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Make sure to close Redis connection
    if (redis) {
      try {
        await redis.quit();
      } catch (redisError) {
        console.error('Error closing Redis connection:', redisError);
      }
    }
  }
} 