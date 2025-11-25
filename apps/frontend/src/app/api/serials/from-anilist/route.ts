import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const GET_ANIME_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description
    coverImage {
      extraLarge
      large
      medium
    }
    bannerImage
    averageScore
  }
}
`;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { anilistId } = body;

    if (!anilistId) {
      return NextResponse.json({ error: 'anilistId is required' }, { status: 400 });
    }

    // Check if already exists
    const existing = await prisma.serial.findFirst({
      where: { anilistId },
    });

    if (existing) {
      return NextResponse.json({ serial: existing, created: false });
    }

    // Fetch from AniList
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: GET_ANIME_QUERY,
        variables: { id: anilistId },
      }),
    });

    if (!response.ok) {
      throw new Error('AniList API request failed');
    }

    const data = await response.json();
    const anime = data.data?.Media;

    if (!anime) {
      return NextResponse.json({ error: 'Anime not found on AniList' }, { status: 404 });
    }

    // Create Serial
    const title = anime.title.english || anime.title.romaji || anime.title.native;
    
    const serial = await prisma.serial.create({
      data: {
        title: title,
        description: anime.description || '',
        anilistId: anime.id,
        rating: anime.averageScore ? anime.averageScore / 20 : 0, // Convert 100 to 5
        imageUrl: anime.coverImage.large || anime.coverImage.medium || '',
        coverImage: anime.coverImage.extraLarge || anime.coverImage.large,
        bannerImage: anime.bannerImage,
        titleRomaji: anime.title.romaji,
        titleEnglish: anime.title.english,
        titleNative: anime.title.native,
        anilistDescription: anime.description,
        lastAnilistSync: new Date(),
      }
    });

    return NextResponse.json({ serial, created: true });
  } catch (error) {
    console.error('Error creating serial from AniList:', error);
    
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    return NextResponse.json({ error: 'Failed to create serial' }, { status: 500 });
  }
}

