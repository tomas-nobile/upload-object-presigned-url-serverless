import { S3Service } from './service/s3-service';
import { ObjectNameRequest, S3UrlResponse } from './models/file-models';
import { createSuccessResponse, createErrorResponse } from './utils/response-utils';

export const handler = async (event: any): Promise<any> => {
  try {
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    let objectNames: string[];
    
    try {
      const requestBody = JSON.parse(event.body);
      
      // Check if the s3ObjectNames property exists and is an array
      if (!requestBody.s3ObjectNames || !Array.isArray(requestBody.s3ObjectNames)) {
        return createErrorResponse(400, 'Request body must contain a "s3ObjectNames" property which is an array of object names');
      }
      
      objectNames = requestBody.s3ObjectNames;
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON in request body');
    }
    
    // Generate fetch URLs for each object
    const s3Service = new S3Service();
    const responses: S3UrlResponse[] = await s3Service.generateFetchUrls(objectNames);

    return createSuccessResponse(responses);
  } catch (error) {
    console.error('Error in getFileUrls:', error);
    return createErrorResponse(500, 'Internal server error');
  }
}; 