import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get('MINIO_PORT', 9000),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'roma'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', '12345678'),
    });

    this.bucketName = this.configService.get('MINIO_BUCKET_NAME', 'torrents');
    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`Created bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure bucket exists: ${error.message}`);
    }
  }

  async uploadStream(
    objectName: string,
    stream: Readable,
    size?: number,
    metaData?: Record<string, string>,
  ): Promise<string> {
    try {
      const uploadInfo = await this.minioClient.putObject(
        this.bucketName,
        objectName,
        stream,
        size,
        metaData,
      );

      this.logger.log(`Successfully uploaded ${objectName} to MinIO`);
      return uploadInfo.etag;
    } catch (error) {
      this.logger.error(`Failed to upload ${objectName}: ${error.message}`);
      throw error;
    }
  }

  async getObjectUrl(
    objectName: string,
    expiry: number = 24 * 60 * 60,
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expiry,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get presigned URL for ${objectName}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteObject(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`Successfully deleted ${objectName} from MinIO`);
    } catch (error) {
      this.logger.error(`Failed to delete ${objectName}: ${error.message}`);
      throw error;
    }
  }

  async listObjects(prefix?: string): Promise<string[]> {
    try {
      const objects: string[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, prefix);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => objects.push(obj.name));
        stream.on('end', () => resolve(objects));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to list objects: ${error.message}`);
      throw error;
    }
  }
}
