/**
 * Request object for getFileUrls function
 */
export interface ObjectNameRequest {
  s3ObjectNames: string[];
}

/**
 * Response object with S3 object name and fetch URL
 */
export interface S3UrlResponse {
  s3ObjectName: string;
  s3FetchUrl: string | null;
} 