import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

enum SourceType {
  RSS = 'RSS',
  API = 'API',
  SCRAPER = 'SCRAPER',
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      include: { 
        contentItems: {
          take: 5,
          orderBy: { publishedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    
    // Handle auth errors
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    const body = await request.json();
    const { name, type, url, isActive = true } = body;

    // Validate required fields
    if (!name || !type || !url) {
      return NextResponse.json(
        { error: 'Name, type, and URL are required' },
        { status: 400 }
      );
    }

    // Validate source type
    if (!Object.values(SourceType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid source type' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if source with same URL already exists
    const existingSource = await prisma.source.findFirst({
      where: { url },
    });

    if (existingSource) {
      return NextResponse.json(
        { error: 'A source with this URL already exists' },
        { status: 409 }
      );
    }

    // Create the new source
    const newSource = await prisma.source.create({
      data: {
        name: name.trim(),
        type,
        url: url.trim(),
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Source created successfully',
      source: newSource,
    });
  } catch (error) {
    console.error('Error creating source:', error);
    
    // Handle auth errors
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
} 