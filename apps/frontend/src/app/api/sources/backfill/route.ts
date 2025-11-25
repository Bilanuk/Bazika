import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Parser from 'rss-parser';
import { parseAnimeTitle } from '@/lib/anime-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['nyaa:seeders', 'seeders'],
      ['nyaa:leechers', 'leechers'],
      ['nyaa:downloads', 'downloads'],
      ['nyaa:infoHash', 'infoHash'],
      ['nyaa:categoryId', 'categoryId'],
      ['nyaa:category', 'category'],
      ['nyaa:size', 'size'],
      ['nyaa:comments', 'comments'],
      ['nyaa:trusted', 'trusted'],
      ['nyaa:remake', 'remake'],
    ],
  },
});

interface BackfillRequest {
  serialId: string;
  sourceId: string;
}

/**
 * Backfill endpoint to fetch old episodes for a specific serial from a specific source
 * POST /api/sources/backfill
 * Body: { serialId, sourceId }
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body: BackfillRequest = await request.json();
    const { serialId, sourceId } = body;

    if (!serialId || !sourceId) {
      return NextResponse.json(
        { error: 'serialId and sourceId are required' },
        { status: 400 }
      );
    }

    // 1. Get serial and source info
    const serial = await prisma.serial.findUnique({
      where: { id: serialId },
      include: {
        contentItems: {
          where: { sourceId },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!serial) {
      return NextResponse.json({ error: 'Serial not found' }, { status: 404 });
    }

    const source = await prisma.source.findUnique({
      where: { id: sourceId },
    });

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    // 2. Get search query from existing content item
    let searchQuery = serial.title;
    
    if (serial.contentItems.length > 0) {
      const parsed = parseAnimeTitle(serial.contentItems[0].title);
      if (parsed?.seriesName) {
        searchQuery = parsed.seriesName;
      }
    }

    console.log(`Backfill: Searching for "${searchQuery}" on ${source.name}`);

    // 3. Build RSS URL with search query
    // For Nyaa: https://nyaa.si/?page=rss&q=search+query
    // For user-specific: https://nyaa.si/?page=rss&u=erai-raws&q=one+punch+man
    let rssUrl = source.url;
    
    // Extract username from RSS URL if present (e.g., erai-raws)
    const userMatch = source.url.match(/[?&]u=([^&]+)/);
    const username = userMatch ? userMatch[1] : null;

    if (source.url.includes('nyaa.si')) {
      const baseUrl = 'https://nyaa.si/?page=rss';
      const params = new URLSearchParams();
      
      if (username) {
        params.set('u', username);
      }
      params.set('q', searchQuery);
      
      rssUrl = `${baseUrl}&${params.toString()}`;
    }

    console.log(`Fetching RSS: ${rssUrl}`);

    // 4. Fetch and parse RSS
    const feed = await parser.parseURL(rssUrl);

    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items found in RSS feed',
        items: [],
      });
    }

    // 5. Filter items that match the serial
    const matchedItems = [];
    const existingHashes = new Set(
      (await prisma.contentItem.findMany({
        where: { sourceId, serialId },
        select: { infoHash: true },
      })).map(item => item.infoHash?.toLowerCase())
    );

    for (const item of feed.items) {
      const parsed = parseAnimeTitle(item.title || '');
      
      if (!parsed) continue;

      // Check if series name matches
      const normalizedParsed = parsed.seriesName.toLowerCase().replace(/[^\w\s]/g, '');
      const normalizedSearch = searchQuery.toLowerCase().replace(/[^\w\s]/g, '');
      
      if (!normalizedParsed.includes(normalizedSearch) && !normalizedSearch.includes(normalizedParsed)) {
        continue;
      }

      // Extract info hash from link or guid
      const infoHash = (item as any).infoHash || 
                       item.link?.split('/').pop()?.replace('.torrent', '') ||
                       item.guid?.split('/').pop();

      // Check if exists
      const exists = infoHash && existingHashes.has(infoHash.toLowerCase());

      matchedItems.push({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        episodeNumber: parsed.episodeNumber,
        quality: parsed.quality,
        infoHash,
        description: item.contentSnippet || item.content,
        exists: !!exists,
      });
    }

    console.log(`Found ${matchedItems.length} items (including existing)`);

    return NextResponse.json({
      success: true,
      serial: {
        id: serial.id,
        title: serial.title,
      },
      source: {
        id: source.id,
        name: source.name,
      },
      searchQuery,
      rssUrl,
      items: matchedItems,
      totalFound: feed.items.length,
      newItems: matchedItems.filter(i => !i.exists).length,
    });
  } catch (error) {
    console.error('Error during backfill:', error);

    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to backfill', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
