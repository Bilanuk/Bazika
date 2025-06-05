import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentItem, Prisma } from '@database';

@Injectable()
export class ContentItemsRepository {
  constructor(private prisma: PrismaService) {}

  async findByGuid(guid: string): Promise<ContentItem | null> {
    return this.prisma.contentItem.findUnique({
      where: { guid },
      include: { source: true },
    });
  }

  async findUnnotified(): Promise<ContentItem[]> {
    return this.prisma.contentItem.findMany({
      where: { notificationSent: false },
      include: { source: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async create(data: Prisma.ContentItemCreateInput): Promise<ContentItem> {
    return this.prisma.contentItem.create({
      data,
      include: { source: true },
    });
  }

  async markAsNotified(id: string): Promise<ContentItem> {
    return this.prisma.contentItem.update({
      where: { id },
      data: { notificationSent: true },
    });
  }

  async findRecent(limit: number = 10): Promise<ContentItem[]> {
    return this.prisma.contentItem.findMany({
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: { source: true },
    });
  }

  async findBySourceId(sourceId: string): Promise<ContentItem[]> {
    return this.prisma.contentItem.findMany({
      where: { sourceId },
      orderBy: { publishedAt: 'desc' },
      include: { source: true },
    });
  }
}
