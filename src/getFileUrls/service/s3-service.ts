import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3UrlResponse } from '../models/file-models';

export class S3Service {
  private s3Client: S3Client;
  private readonly EXPIRATION_SECONDS = 300; // 5 minutes

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.region || 'us-east-1'
    });
  }

  /**
   * Generates fetch URLs for an array of S3 object names
   * @param objectNames Array of S3 object names
   * @returns Array of responses with fetch URLs
   */
  async generateFetchUrls(objectNames: string[]): Promise<S3UrlResponse[]> {
    const responses: S3UrlResponse[] = [];
    
    for (const objectName of objectNames) {
      try {
        // Check if the object exists
        try {
          await this.s3Client.send(
            new HeadObjectCommand({
              Bucket: process.env.bucketName,
              Key: objectName
            })
          );
        } catch (error) {
          // Object doesn't exist or another error occurred
          responses.push({
            s3ObjectName: objectName,
            s3FetchUrl: null
          });
          continue;
        }
        
        // Generate presigned URL for fetching the object
        const command = new GetObjectCommand({
          Bucket: process.env.bucketName,
          Key: objectName
        });
        
        const s3FetchUrl = await getSignedUrl(this.s3Client, command, {
          expiresIn: this.EXPIRATION_SECONDS
        });
        
        responses.push({
          s3ObjectName: objectName,
          s3FetchUrl
        });
      } catch (error) {
        console.error(`Error generating fetch URL for ${objectName}:`, error);
        // Add entry with null URL in case of error
        responses.push({
          s3ObjectName: objectName,
          s3FetchUrl: null
        });
      }
    }
    
    return responses;
  }
} 