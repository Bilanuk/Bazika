import { Injectable } from '@nestjs/common';
import { Serial } from '@prisma/client';
import { SerialsRepository } from '@/serials/serials.repository';
import { CreateSerialInput } from '@/serials/dto/inputs/create-serial';
import { UpdateSerialInput } from '@/serials/dto/inputs/update-serial';
import { GetSerialsArgs } from '@/serials/dto/args/get-serials';

@Injectable()
export class SerialsService {
  constructor(private serialsRepository: SerialsRepository) {}

  public async getSerial(id: number): Promise<Serial> {
    return this.serialsRepository.getSerial({ where: { id: id } });
  }

  public async getSerials(params: GetSerialsArgs): Promise<Serial[]> {
    return this.serialsRepository.getSerials({
      skip: params.skip,
      take: params.take,
      where: params.titles ? { title: { in: params.titles } } : undefined,
      orderBy: { [params.orderBy || 'id']: 'asc' },
    });
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

  public async deleteSerial(id: number): Promise<Serial> {
    return this.serialsRepository.deleteSerial({ where: { id: id } });
  }
}
