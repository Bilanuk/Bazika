import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { UserRoles } from '@/types/user-roles';
import prisma from '@/lib/prisma';

interface AniListAnime {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
  };
  bannerImage: string;
  averageScore: number;
  genres: string[];
  status: string;
  episodes: number;
}

async function fetchAniListData(
  anilistId: number
): Promise<AniListAnime | null> {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
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
        genres
        status
        episodes
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id: anilistId },
      }),
    });

    const data = await response.json();
    return data.data?.Media || null;
  } catch (error) {
    console.error('Error fetching AniList data:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRoles.ADMIN) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const serialId = params.id;

    // Find the serial and check if it has an AniList ID
    const serial = await prisma.serial.findUnique({
      where: { id: serialId },
      select: {
        id: true,
        title: true,
        anilistId: true,
      },
    });

    if (!serial) {
      return NextResponse.json({ error: 'Serial not found' }, { status: 404 });
    }

    if (!serial.anilistId) {
      return NextResponse.json(
        { error: 'Serial does not have an AniList ID' },
        { status: 400 }
      );
    }

    // Fetch data from AniList
    const anilistData = await fetchAniListData(serial.anilistId);
    if (!anilistData) {
      return NextResponse.json(
        { error: 'Failed to fetch data from AniList' },
        { status: 500 }
      );
    }

    // Update the serial with new data
    const updatedSerial = await prisma.serial.update({
      where: { id: serialId },
      data: {
        title: anilistData.title.english || anilistData.title.romaji,
        titleRomaji: anilistData.title.romaji,
        titleEnglish: anilistData.title.english,
        titleNative: anilistData.title.native,
        description: anilistData.description?.replace(/<[^>]*>/g, '') || '', // Remove HTML tags
        anilistDescription: anilistData.description,
        rating: anilistData.averageScore ? anilistData.averageScore / 20 : 0, // Convert from 0-100 to 0-5
        imageUrl:
          anilistData.coverImage.extraLarge ||
          anilistData.coverImage.large ||
          anilistData.coverImage.medium,
        coverImage: anilistData.coverImage.large,
        bannerImage: anilistData.bannerImage,
        lastAnilistSync: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully refetched data from AniList',
      data: {
        title: updatedSerial.title,
        description: updatedSerial.description,
        rating: updatedSerial.rating,
        imageUrl: updatedSerial.imageUrl,
        bannerImage: updatedSerial.bannerImage,
        lastSync: updatedSerial.lastAnilistSync,
      },
    });
  } catch (error) {
    console.error('Error refetching AniList data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
