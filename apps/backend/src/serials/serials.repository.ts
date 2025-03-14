import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Serial } from '@database';
import { PrismaService } from 'src/database/prisma.service';
import { PaginationArgs } from '@/common/pagination/pagination.args';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { SerialConnection } from '@/serials/models/serial';

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
    paginationArgs: PaginationArgs,
    where?: Prisma.SerialWhereInput,
  ): Promise<SerialConnection> {
    return await findManyCursorConnection(
      (args) => this.prisma.serial.findMany({ where, ...args }),
      () =>
        this.prisma.serial.count({
          where,
        }),
      paginationArgs,
    );
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
