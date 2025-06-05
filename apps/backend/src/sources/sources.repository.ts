import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Source, Prisma } from '@database';

@Injectable()
export class SourcesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Source[]> {
    return this.prisma.source.findMany({
      where: { isActive: true },
      include: { contentItems: true },
    });
  }

  async findById(id: string): Promise<Source | null> {
    return this.prisma.source.findUnique({
      where: { id },
      include: { contentItems: true },
    });
  }

  async create(data: Prisma.SourceCreateInput): Promise<Source> {
    return this.prisma.source.create({ data });
  }

  async update(id: string, data: Prisma.SourceUpdateInput): Promise<Source> {
    return this.prisma.source.update({
      where: { id },
      data,
    });
  }

  async updateLastChecked(id: string): Promise<Source> {
    return this.prisma.source.update({
      where: { id },
      data: { lastChecked: new Date() },
    });
  }

  async delete(id: string): Promise<Source> {
    return this.prisma.source.delete({ where: { id } });
  }
}
