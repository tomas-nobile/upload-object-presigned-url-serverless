import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileRequest, FileResponse } from '../models/file-models';

export class S3Service {
  private s3Client: S3Client;
  private readonly EXPIRATION_SECONDS = 120; // 2 minutes

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.region || 'us-east-1'
    });
  }

  /**
   * Generates a timestamp string in the format yyyy-mm-dd_hh-mm-ss-ms
   * @returns Formatted timestamp string
   */
  private getTimestampString(): string {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}-${milliseconds}`;
  }

  /**
   * Generates a unique S3 object name for a file
   * @param fileName The base file name
   * @param extension The file extension
   * @returns The S3 object name
   */
  private generateS3ObjectName(fileName: string, extension: string): string {
    const timestamp = this.getTimestampString();
    const filePath = process.env.filePath || '';
    
    // Make sure filePath ends with a slash if it's not empty
    const formattedFilePath = filePath && !filePath.endsWith('/') ? `${filePath}/` : filePath;
    
    return `${formattedFilePath}${timestamp}_${fileName}.${extension}`;
  }

  /**
   * Generates presigned URLs for an array of file requests
   * @param fileRequests The array of file requests
   * @returns Array of file responses with presigned URLs
   */
  async generatePresignedUrls(fileRequests: FileRequest[]): Promise<FileResponse[]> {
    const responses: FileResponse[] = [];
    
    for (const file of fileRequests) {
      const s3ObjectName = this.generateS3ObjectName(file.name, file.extension);
      
      const command = new PutObjectCommand({
        Bucket: process.env.bucketName,
        Key: s3ObjectName,
        ContentType: this.getContentType(file.extension)
      });
      
      const s3UploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.EXPIRATION_SECONDS
      });
      
      responses.push({
        ...file,
        s3UploadUrl,
        s3ObjectName
      });
    }
    
    return responses;
  }

  /**
   * Maps file extensions to MIME types
   * @param extension The file extension
   * @returns The corresponding MIME type or a default
   */
  private getContentType(extension: string): string {
    const contentTypeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml'
    };
    
    return contentTypeMap[extension.toLowerCase()] || 'application/octet-stream';
  }
} 