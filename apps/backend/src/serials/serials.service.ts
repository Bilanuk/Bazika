import { Injectable } from '@nestjs/common';
import { Serial } from '@prisma/client';
import { SerialsRepository } from '@/serials/serials.repository';
import { CreateSerialInput } from '@/serials/dto/inputs/create-serial';
import { UpdateSerialInput } from '@/serials/dto/inputs/update-serial';
import { SerialConnection } from '@/serials/models/serial';
import { PaginationArgs } from '@/common/pagination/pagination.args';
import { GetSerialArgs } from '@/serials/dto/args/get-serial';

@Injectable()
export class SerialsService {
  constructor(private serialsRepository: SerialsRepository) {}

  public async getSerial(id: string): Promise<Serial> {
    return this.serialsRepository.getSerial({ where: { id: id } });
  }

  public async getSerials(
    paginationArgs: PaginationArgs,
    where?: GetSerialArgs,
  ): Promise<SerialConnection> {
    return this.serialsRepository.getSerials(paginationArgs, where);
  }

  public async createSerial(
    createSerialData: CreateSerialInput,
  ): Promise<Serial> {
    return this.serialsRepository.createSerial({ data: createSerialData });
  }

  public async updateSerial(
    updateSerialData: UpdateSerialInput,
  ): Promise<Serial> {
    return this.serialsRepository.updateSerial({
      where: { id: updateSerialData.id },
      data: updateSerialData,
    });
  }

  public async deleteSerial(id: string): Promise<Serial> {
    return this.serialsRepository.deleteSerial({ where: { id: id } });
  }
}
