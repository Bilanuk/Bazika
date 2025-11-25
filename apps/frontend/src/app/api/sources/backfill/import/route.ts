import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parseAnimeTitle } from '@/lib/anime-parser';

interface ImportRequest {
  serialId: string;
  sourceId: string;
  items: Array<{
    title: string;
    link: string;
    pubDate?: string;
    infoHash?: string;
    description?: string;
  }>;
}

/**
 * Import selected items from backfill results
 * POST /api/sources/backfill/import
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body: ImportRequest = await request.json();
    const { serialId, sourceId, items } = body;

    if (!serialId || !sourceId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'serialId, sourceId, and items are required' },
        { status: 400 }
      );
    }

    console.log(`Importing ${items.length} items for serial ${serialId}`);

    const imported = [];
    const errors = [];

    for (const item of items) {
      try {
        const parsed = parseAnimeTitle(item.title);
        
        if (!parsed) {
          errors.push({ title: item.title, error: 'Failed to parse title' });
          continue;
        }

        // Find or create episode
        let episode = null;
        if (parsed.episodeNumber) {
          episode = await prisma.episode.findFirst({
            where: {
              serialId,
              episodeNumber: parsed.episodeNumber,
            },
          });

          if (!episode) {
            episode = await prisma.episode.create({
              data: {
                serialId,
                episodeNumber: parsed.episodeNumber,
                title: `Episode ${parsed.episodeNumber}`,
              },
            });
            console.log(`Created episode ${parsed.episodeNumber}`);
          }
        }

        // Check if item already exists by guid or infoHash
        const guid = item.link || item.infoHash || `${sourceId}-${item.title}`;
        
        const existingItem = await prisma.contentItem.findFirst({
          where: {
            OR: [
              { guid },
              item.infoHash ? { infoHash: item.infoHash.toLowerCase() } : {}
            ]
          }
        });

        if (existingItem) {
          console.log(`Item already exists: ${item.title}`);
          // Optional: update serialId/episodeId if missing
          if (!existingItem.serialId || !existingItem.episodeId) {
             await prisma.contentItem.update({
               where: { id: existingItem.id },
               data: {
                 serialId: serialId,
                 episodeId: episode?.id || existingItem.episodeId
               }
             });
             imported.push({
                id: existingItem.id,
                title: existingItem.title,
                episodeNumber: parsed.episodeNumber,
                status: 'updated'
             });
          }
          continue;
        }

        // Create content item
        const contentItem = await prisma.contentItem.create({
          data: {
            title: item.title,
            url: item.link, // Map link to url
            guid: guid,     // Required unique field
            description: item.description || '',
            sourceId,
            serialId,
            episodeId: episode?.id,
            infoHash: item.infoHash?.toLowerCase(),
            quality: parsed.quality,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            processingStatus: 'NONE',
          },
        });

        imported.push({
          id: contentItem.id,
          title: contentItem.title,
          episodeNumber: parsed.episodeNumber,
        });

        console.log(`✅ Imported: ${item.title}`);
      } catch (error) {
        console.error(`Failed to import item: ${item.title}`, error);
        errors.push({
          title: item.title,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      errors: errors.length > 0 ? errors : undefined,
      items: imported,
    });
  } catch (error) {
    console.error('Error importing items:', error);

    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to import items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

