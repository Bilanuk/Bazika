import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parseAnimeTitle } from '@/lib/anime-parser';

/**
 * Migration endpoint to fix content items that have serialId but no episodeId
 * This happens when items were matched before we added episode linking logic
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    // Find all items with serial but no episode
    const itemsToFix = await prisma.contentItem.findMany({
      where: {
        serialId: { not: null },
        episodeId: null,
      },
      include: {
        serial: true,
      },
    });

    console.log(`Found ${itemsToFix.length} items to fix`);

    let fixedCount = 0;
    let createdEpisodesCount = 0;
    const errors: string[] = [];

    for (const item of itemsToFix) {
      try {
        // Parse episode number from title
        const parsed = parseAnimeTitle(item.title);

        if (!parsed?.episodeNumber) {
          console.warn(`Could not parse episode number from: ${item.title}`);
          errors.push(`Could not parse: ${item.title}`);
          continue;
        }

        // Find or create episode
        let episode = await prisma.episode.findFirst({
          where: {
            serialId: item.serialId!,
            episodeNumber: parsed.episodeNumber,
          },
        });

        if (!episode) {
          episode = await prisma.episode.create({
            data: {
              serialId: item.serialId!,
              episodeNumber: parsed.episodeNumber,
              title: `Episode ${parsed.episodeNumber}`,
            },
          });
          createdEpisodesCount++;
          console.log(`Created episode ${parsed.episodeNumber} for serial ${item.serial?.title}`);
        }

        // Update content item
        await prisma.contentItem.update({
          where: { id: item.id },
          data: { episodeId: episode.id },
        });

        fixedCount++;
      } catch (error) {
        console.error(`Error fixing item ${item.id}:`, error);
        errors.push(`Error fixing ${item.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalItems: itemsToFix.length,
      fixedCount,
      createdEpisodesCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error fixing episodes:', error);

    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to fix episodes' }, { status: 500 });
  }
}

