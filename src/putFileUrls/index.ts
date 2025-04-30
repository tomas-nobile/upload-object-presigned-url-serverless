import { S3Service } from './service/s3-service';
import { FileRequest, FileResponse } from './models/file-models';
import { validateFileRequests } from './utils/validators';
import { createSuccessResponse, createErrorResponse } from './utils/response-utils';

export const handler = async (event: any): Promise<any> => {
  try {
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    let fileRequests: FileRequest[];
    
    try {
      fileRequests = JSON.parse(event.body);
      
      // Ensure the input is an array
      if (!Array.isArray(fileRequests)) {
        return createErrorResponse(400, 'Request body must be an array of file objects');
      }
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON in request body');
    }

    // Validate the request objects
    const validationErrors = validateFileRequests(fileRequests);
    if (validationErrors.length > 0) {
      return createErrorResponse(400, 'Validation errors', validationErrors);
    }

    // Generate presigned URLs for each file
    const s3Service = new S3Service();
    const fileResponses: FileResponse[] = await s3Service.generatePresignedUrls(fileRequests);

    return createSuccessResponse(fileResponses);
  } catch (error) {
    console.error('Error in putFileUrls:', error);
    return createErrorResponse(500, 'Internal server error');
  }
}; 