/**
 * Represents a file request from the client
 */
export interface FileRequest {
  name: string;
  extension: string;
}

/**
 * Represents a file response with S3 details
 */
export interface FileResponse extends FileRequest {
  s3UploadUrl: string;
  s3ObjectName: string;
} 