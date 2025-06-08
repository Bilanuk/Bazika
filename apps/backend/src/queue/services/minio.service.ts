import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly defaultBucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get('MINIO_PORT', 9000),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'roma'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', '12345678'),
    });

    this.defaultBucketName = this.configService.get(
      'MINIO_BUCKET_NAME',
      'torrents',
    );
    this.ensureBucketsExist();
  }

  private async ensureBucketsExist(): Promise<void> {
    const buckets = [this.defaultBucketName, 'anime'];

    for (const bucketName of buckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucketName);
        if (!exists) {
          await this.minioClient.makeBucket(bucketName);
          this.logger.log(`Created bucket: ${bucketName}`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to ensure bucket ${bucketName} exists: ${error.message}`,
        );
      }
    }
  }

  async uploadStream(
    objectName: string,
    stream: Readable,
    size?: number,
    metaData?: Record<string, string>,
    bucketName?: string,
  ): Promise<string> {
    const bucket = bucketName || this.defaultBucketName;

    try {
      const uploadInfo = await this.minioClient.putObject(
        bucket,
        objectName,
        stream,
        size,
        metaData,
      );

      this.logger.log(
        `Successfully uploaded ${objectName} to ${bucket} bucket`,
      );
      return uploadInfo.etag;
    } catch (error) {
      this.logger.error(
        `Failed to upload ${objectName} to ${bucket}: ${error.message}`,
      );
      throw error;
    }
  }

  async getObject(objectName: string, bucketName?: string): Promise<Readable> {
    const bucket = bucketName || this.defaultBucketName;

    try {
      const stream = await this.minioClient.getObject(bucket, objectName);
      this.logger.log(
        `Successfully retrieved ${objectName} from ${bucket} bucket`,
      );
      return stream;
    } catch (error) {
      this.logger.error(
        `Failed to get ${objectName} from ${bucket}: ${error.message}`,
      );
      throw error;
    }
  }

  async getObjectUrl(
    objectName: string,
    expiry: number = 24 * 60 * 60,
    bucketName?: string,
  ): Promise<string> {
    const bucket = bucketName || this.defaultBucketName;
    
    try {
      return await this.minioClient.presignedGetObject(
        bucket,
        objectName,
        expiry,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get presigned URL for ${objectName} in ${bucket}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteObject(objectName: string, bucketName?: string): Promise<void> {
    const bucket = bucketName || this.defaultBucketName;
    
    try {
      await this.minioClient.removeObject(bucket, objectName);
      this.logger.log(`Successfully deleted ${objectName} from ${bucket} bucket`);
    } catch (error) {
      this.logger.error(`Failed to delete ${objectName} from ${bucket}: ${error.message}`);
      throw error;
    }
  }

  async listObjects(prefix?: string, bucketName?: string): Promise<string[]> {
    const bucket = bucketName || this.defaultBucketName;
    
    try {
      const objects: string[] = [];
      const stream = this.minioClient.listObjects(bucket, prefix);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => objects.push(obj.name));
        stream.on('end', () => resolve(objects));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to list objects in ${bucket}: ${error.message}`);
      throw error;
    }
  }
}
