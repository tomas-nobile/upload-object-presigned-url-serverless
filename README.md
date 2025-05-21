# Upload Object Presigned URL Serverless

This service provides API endpoints for secure file uploads using presigned S3 URLs, including authentication and URL management.

## Project Structure

```
upload-object-presigned-url-serverless/
├── serverless.yml        # Combined serverless configuration
├── stage-config.yml      # Environment-specific configuration (not in Git)
├── stage-config-sample.yml # Sample configuration template
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
└── src/
    ├── authorizer/       # Authorization function
    │   ├── index.ts
    │   └── service/
    │       └── auth-service.ts
    ├── putFileUrls/      # File upload URL generation function
    │   ├── index.ts
    │   ├── models/
    │   │   └── file-models.ts
    │   ├── service/
    │   │   └── s3-service.ts
    │   └── utils/
    │       └── validators.ts
    └── getFileUrls/      # File download URL generation function
        ├── index.ts
        ├── models/
        │   └── file-models.ts
        ├── service/
        │   └── s3-service.ts
        └── utils/
            └── response-utils.ts
```

## Lambda Functions

### Authorizer

The Authorizer Lambda authenticates users via Basic Authentication:

- **Functionality**: Verifies username and password against environment variables.
- **Authentication Method**: Basic Authentication (username:password encoded in base64).
- **Validation**:
  - The username is compared with the `username` environment variable.
  - The password is compared with either the `ps1` or `ps2` environment variable (if present).
- **Endpoint**: Used as an API Gateway authorizer for secure endpoints
- **Status Codes**:
  - Allows or denies access to API endpoints based on credentials

### PutFileUrls

The PutFileUrls Lambda generates presigned S3 URLs for file uploads:

- **Functionality**: Creates presigned URLs for S3 uploads based on file information.
- **Request Format**: An array of file objects with the structure: `{ name: string, extension: string }`.
- **Validation**: Validates that both `name` and `extension` properties are present for each file.
- **S3 Object Naming**: `${process.env.filePath}/yyyy-mm-dd_hh-mm-ss-ms_${fileName}.${extension}`
- **URL Expiration**: 2 minutes (120 seconds)
- **Response Format**: Returns the original objects with added properties:
  - `s3UploadUrl`: The presigned URL for uploading the file
  - `s3ObjectName`: The full S3 object key
- **Endpoint**: POST /file-urls (protected by authorizer)
- **Status Codes**:
  - 200: URLs successfully generated
  - 400: Invalid request format or validation errors
  - 500: Internal server error

### GetFileUrls

The GetFileUrls Lambda generates presigned S3 URLs for file downloads:

- **Functionality**: Creates presigned URLs for downloading existing S3 objects.
- **Request Format**: An object with a `s3ObjectNames` property containing an array of S3 object names.
- **S3 Object Verification**: Checks if each object exists in the bucket before generating a URL.
- **URL Expiration**: 5 minutes (300 seconds)
- **Response Format**: Returns an array of objects with:
  - `s3ObjectName`: The original S3 object name
  - `s3FetchUrl`: The presigned URL for downloading the file (or `null` if file doesn't exist)
- **Endpoint**: POST /get-file-urls (protected by authorizer)
- **Status Codes**:
  - 200: URLs successfully generated (even if some objects don't exist)
  - 400: Invalid request format
  - 500: Internal server error

## Configuration

This project uses stage-specific configuration for different environments (test, stage, prod).

1. Copy the sample configuration file to create your actual configuration:
   ```
   cp stage-config-sample.yml stage-config.yml
   ```

2. Update the values in `stage-config.yml` with your actual credentials and settings.

3. The actual configuration file (`stage-config.yml`) is excluded from Git to protect sensitive information.

## AWS Resources

### S3 Bucket

The service automatically creates an S3 bucket for file storage:

- **Bucket Name**: `upload-object-presigned-url-serverless-[stage]-bucket` (e.g., `upload-object-presigned-url-serverless-test-bucket`)
- **CORS Configuration**: Enabled for PUT, POST, and GET operations
- **Permissions**: The Lambda functions have necessary permissions to interact with the bucket
- **Creation**: Managed through CloudFormation in serverless.yml

## Environment Variables

### Authorizer
- `username`: Username for basic authentication
- `ps1`: Primary password
- `ps2`: Secondary password (optional)

### PutFileUrls
- `bucketName`: S3 bucket name for file uploads (automatically set to the created bucket)
- `filePath`: Base path for S3 objects
- `region`: AWS region for S3 operations (automatically set to the deployment region)

### GetFileUrls
- `bucketName`: S3 bucket name for file downloads (same as PutFileUrls)
- `region`: AWS region for S3 operations (automatically set to the deployment region)

## Setup

1. Copy the sample configuration and update with your values:
   ```
   cp stage-config-sample.yml stage-config.yml
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Required plugins (included in package.json):
   - serverless-plugin-typescript
   - serverless-offline

## Local Development

Run the service locally:
```
npm start
```

## Deployment

Deploy to a specific stage:
```
npm run deploy -- --stage test
```

Available stages:
- test
- stage
- prod

## API Examples

### Accessing Protected Endpoints
All endpoints are protected by the authorizer and require Basic Authentication:
```
Authorization: Basic base64(username:password)
```

### PutFileUrls
```
POST /file-urls
Content-Type: application/json

[
  {
    "name": "document1",
    "extension": "pdf"
  },
  {
    "name": "image1",
    "extension": "jpg"
  }
]
```

Response:
```json
[
  {
    "name": "document1",
    "extension": "pdf",
    "s3UploadUrl": "https://s3-presigned-url-for-document1",
    "s3ObjectName": "test/uploads/2023-07-15_14-25-36-789_document1.pdf"
  },
  {
    "name": "image1",
    "extension": "jpg",
    "s3UploadUrl": "https://s3-presigned-url-for-image1",
    "s3ObjectName": "test/uploads/2023-07-15_14-25-36-790_image1.jpg"
  }
]
```

### GetFileUrls
```
POST /get-file-urls
Content-Type: application/json

{
  "s3ObjectNames": [
    "test/uploads/2023-07-15_14-25-36-789_document1.pdf",
    "test/uploads/2023-07-15_14-25-36-790_image1.jpg"
  ]
}
```

Response:
```json
[
  {
    "s3ObjectName": "test/uploads/2023-07-15_14-25-36-789_document1.pdf",
    "s3FetchUrl": "https://s3-presigned-url-for-downloading-document1"
  },
  {
    "s3ObjectName": "test/uploads/2023-07-15_14-25-36-790_image1.jpg",
    "s3FetchUrl": "https://s3-presigned-url-for-downloading-image1"
  }
]
```

## Using Presigned URLs with Postman

### Step 1: Get Presigned URLs
1. Create a POST request to your API Gateway URL: `https://your-api-gateway-url/file-urls`
2. Add Basic Authentication:
   - Username: your configured username (from stage-config.yml)
   - Password: your configured password (from stage-config.yml)
3. Set Content-Type header to `application/json`
4. Add this request body:
   ```json
   [
     {
       "name": "document1",
       "extension": "pdf"
     }
   ]
   ```
5. Send the request to receive presigned URLs

### Step 2: Upload File Using the Presigned URL
1. Create a new PUT request in Postman
2. Copy the `s3UploadUrl` from the response and paste it as the request URL
3. Go to the Body tab and select "binary"
4. Click "Select File" and choose your file
5. Add Content-Type header matching your file type (e.g., `application/pdf`)
6. Send the request

### Step 3: Download File Using a Presigned URL
1. Get download URLs by sending a request to `/get-file-urls` with the object names
2. Create a GET request in Postman
3. Paste the `s3FetchUrl` value as the request URL
4. Send the request to download the file

Important notes:
- Upload URLs expire after 2 minutes
- Download URLs expire after 5 minutes
- Use PUT method for uploading files
- Use GET method for downloading files
- No authentication needed for the S3 upload/download requests 