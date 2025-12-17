import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parseAnimeTitle } from '@/lib/anime-parser';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { serialId, saveMapping, mappingTitle } = body;

    if (!serialId) {
      return NextResponse.json({ error: 'serialId is required' }, { status: 400 });
    }

    // 1. Get the content item first to know its source
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: params.id },
    });

    if (!contentItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }

    // 2. Parse episode number from title
    const parsed = parseAnimeTitle(contentItem.title);
    let episodeId: string | null = null;

    if (parsed?.episodeNumber) {
      // Find or create Episode
      let episode = await prisma.episode.findFirst({
        where: {
          serialId,
          episodeNumber: parsed.episodeNumber,
        },
      });

      if (!episode) {
        // Create new episode
        episode = await prisma.episode.create({
          data: {
            serialId,
            episodeNumber: parsed.episodeNumber,
            title: `Episode ${parsed.episodeNumber}`,
          },
        });
        console.log(`Created new episode ${parsed.episodeNumber} for serial ${serialId}`);
      }

      episodeId = episode.id;
    }

    // 3. Update content item with serial and episode
    const updatedItem = await prisma.contentItem.update({
      where: { id: params.id },
      data: { 
        serialId,
        episodeId,
      },
    });

    // 4. Auto-match other orphans with similar parsed series name
    let matchedCount = 0;
    if (parsed?.seriesName) {
      try {
        // Get all orphans from the same source
        const allOrphans = await prisma.contentItem.findMany({
          where: {
            serialId: null,
            sourceId: contentItem.sourceId,
          },
        });

        console.log(`Checking ${allOrphans.length} orphans from source ${contentItem.sourceId}`);

        // Filter orphans with matching series name
        for (const orphan of allOrphans) {
          const orphanParsed = parseAnimeTitle(orphan.title);
          
          if (!orphanParsed?.seriesName) continue;

          // Normalize series names for comparison (lowercase, remove special chars)
          const normalizedCurrent = parsed.seriesName.toLowerCase().replace(/[^\w\s]/g, '');
          const normalizedOrphan = orphanParsed.seriesName.toLowerCase().replace(/[^\w\s]/g, '');

          // Check if series names match
          if (normalizedCurrent === normalizedOrphan) {
            let orphanEpisodeId: string | null = null;

            if (orphanParsed.episodeNumber) {
              let episode = await prisma.episode.findFirst({
                where: {
                  serialId,
                  episodeNumber: orphanParsed.episodeNumber,
                },
              });

              if (!episode) {
                episode = await prisma.episode.create({
                  data: {
                    serialId,
                    episodeNumber: orphanParsed.episodeNumber,
                    title: `Episode ${orphanParsed.episodeNumber}`,
                  },
                });
              }

              orphanEpisodeId = episode.id;
            }

            await prisma.contentItem.update({
              where: { id: orphan.id },
              data: {
                serialId,
                episodeId: orphanEpisodeId,
              },
            });

            matchedCount++;
            console.log(`Auto-matched: ${orphan.title}`);
          }
        }
        
        console.log(`Auto-matched ${matchedCount} other items with series name "${parsed.seriesName}"`);
      } catch (e) {
        console.warn('Failed to auto-match orphans:', e);
      }
    }

    // 5. Create mapping if requested
    let mapping = null;
    
    if (saveMapping && mappingTitle) {
      try {
        mapping = await prisma.sourceTitleMapping.upsert({
          where: {
            sourceId_rawTitle: {
              sourceId: contentItem.sourceId,
              rawTitle: mappingTitle,
            },
          },
          update: { serialId },
          create: {
            rawTitle: mappingTitle,
            serialId,
            sourceId: contentItem.sourceId,
          },
        });

        console.log(`Created mapping: "${mappingTitle}" -> ${serialId}`);
      } catch (e) {
        console.warn('Failed to save mapping:', e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      item: updatedItem,
      mapping,
      autoMatchedCount: matchedCount,
    });
  } catch (error) {
    console.error('Error matching content item:', error);
    
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to match content item' }, { status: 500 });
  }
}

