import { Injectable, Logger } from '@nestjs/common';
import { SourcesRepository } from './sources.repository';
import { Source, SourceType } from '@database';

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);

  constructor(private sourcesRepository: SourcesRepository) {}

  async getAllActiveSources(): Promise<Source[]> {
    return this.sourcesRepository.findAll();
  }

  async getSourceById(id: string): Promise<Source | null> {
    return this.sourcesRepository.findById(id);
  }

  async createSource(
    name: string,
    type: SourceType,
    url: string,
  ): Promise<Source> {
    this.logger.log(`Creating new source: ${name} (${type})`);
    return this.sourcesRepository.create({
      name,
      type,
      url,
    });
  }

  async updateSourceLastChecked(id: string): Promise<Source> {
    return this.sourcesRepository.updateLastChecked(id);
  }

  async deactivateSource(id: string): Promise<Source> {
    this.logger.log(`Deactivating source: ${id}`);
    return this.sourcesRepository.update(id, { isActive: false });
  }

  async activateSource(id: string): Promise<Source> {
    this.logger.log(`Activating source: ${id}`);
    return this.sourcesRepository.update(id, { isActive: true });
  }
}
