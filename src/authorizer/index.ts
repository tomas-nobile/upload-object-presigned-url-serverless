import { AuthService } from './service/auth-service';

export const handler = async (event: any) => {
  try {
    console.log('Authorizer event:', JSON.stringify(event));
    
    // Get Authorization header from the request
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      console.log('Missing or invalid Authorization header');
      return generatePolicy('user', 'Deny', event.methodArn);
    }
    
    // Extract and decode credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    const authService = new AuthService();
    const isAuthorized = await authService.validateCredentials(username, password);
    
    console.log('Authorization result:', isAuthorized);
    
    if (isAuthorized) {
      return generatePolicy(username, 'Allow', event.methodArn);
    } else {
      return generatePolicy(username, 'Deny', event.methodArn);
    }
  } catch (error) {
    console.error('Error in authorizer:', error);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

/**
 * Generates an IAM policy for API Gateway authorization
 */
function generatePolicy(principalId: string, effect: 'Allow' | 'Deny', resource: string) {
  const authResponse: any = {
    principalId
  };
  
  if (effect && resource) {
    const policyDocument: any = {
      Version: '2012-10-17',
      Statement: []
    };
    
    const statement: any = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource
    };
    
    policyDocument.Statement.push(statement);
    authResponse.policyDocument = policyDocument;
  }
  
  return authResponse;
} 