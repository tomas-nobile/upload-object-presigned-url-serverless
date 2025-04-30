/**
 * Standard API response format
 */
export interface ApiResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * Creates a standardized success response
 * @param data The data to include in the response body
 * @returns Formatted API response object
 */
export function createSuccessResponse(data: any): ApiResponse {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}

/**
 * Creates a standardized error response
 * @param statusCode HTTP status code
 * @param message Error message
 * @param errors Optional detailed error information
 * @returns Formatted API response object
 */
export function createErrorResponse(
  statusCode: number, 
  message: string, 
  errors?: any
): ApiResponse {
  const responseBody = errors 
    ? { message, errors } 
    : { message };
    
  return {
    statusCode,
    body: JSON.stringify(responseBody),
    headers: {
      'Content-Type': 'application/json'
    }
  };
} 