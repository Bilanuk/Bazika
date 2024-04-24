import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Serial } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class SerialsRepository {
  constructor(private prisma: PrismaService) {}

  async createSerial(params: {
    data: Prisma.SerialCreateInput;
  }): Promise<Serial> {
    const { data } = params;
    return this.prisma.serial.create({ data });
  }

  public async getSerial(params: {
    where?: Prisma.SerialWhereUniqueInput;
  }): Promise<Serial> {
    const { where } = params;
    return this.prisma.serial.findUnique({ where });
  }

  public async getSerials(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.SerialWhereUniqueInput;
      where?: Prisma.SerialWhereInput;
      orderBy?: Prisma.SerialOrderByWithRelationInput;
    } = {},
  ): Promise<Serial[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.serial.findMany({ skip, take, cursor, where, orderBy });
  }

  async updateSerial(params: {
    where: Prisma.SerialWhereUniqueInput;
    data: Prisma.SerialUpdateInput;
  }): Promise<Serial> {
    const { where, data } = params;
    return this.prisma.serial.update({ where, data }).catch(() => {
      throw new NotFoundException(`Can't find item with id ${where.id}`);
    });
  }

  async deleteSerial(params: {
    where: Prisma.SerialWhereUniqueInput;
  }): Promise<Serial> {
    const { where } = params;
    return this.prisma.serial.delete({ where }).catch(() => {
      throw new NotFoundException(`Can't find item with id ${where.id}`);
    });
  }
}
