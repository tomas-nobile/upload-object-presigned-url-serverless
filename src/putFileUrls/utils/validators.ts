import { FileRequest } from '../models/file-models';

/**
 * Validates an array of file requests
 * @param fileRequests The array of file requests to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateFileRequests(fileRequests: FileRequest[]): string[] {
  const errors: string[] = [];

  fileRequests.forEach((file, index) => {
    if (!file.name) {
      errors.push(`File at index ${index} is missing the 'name' property`);
    }

    if (!file.extension) {
      errors.push(`File at index ${index} is missing the 'extension' property`);
    }
  });

  return errors;
} 