import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { UserRoles } from '@/types/user-roles';
import prisma from '@/lib/prisma';

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
    const body = await request.json();
    const { anilistId } = body;

    // Validate AniList ID
    if (!anilistId || typeof anilistId !== 'number' || anilistId <= 0) {
      return NextResponse.json(
        { error: 'Valid AniList ID is required' },
        { status: 400 }
      );
    }

    // Check if serial exists
    const serial = await prisma.serial.findUnique({
      where: { id: serialId },
      select: { id: true, title: true },
    });

    if (!serial) {
      return NextResponse.json({ error: 'Serial not found' }, { status: 404 });
    }

    // Update the serial with the new AniList ID
    const updatedSerial = await prisma.serial.update({
      where: { id: serialId },
      data: {
        anilistId: anilistId,
        lastAnilistSync: null, // Reset sync timestamp since ID changed
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AniList ID updated successfully',
      data: {
        serialId: updatedSerial.id,
        anilistId: updatedSerial.anilistId,
      },
    });
  } catch (error) {
    console.error('Error updating AniList ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 