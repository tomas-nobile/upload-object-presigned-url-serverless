export class AuthService {
  /**
   * Validates user credentials against environment variables
   * @param username The username to validate
   * @param password The password to validate
   * @returns Boolean indicating if credentials are valid
   */
  async validateCredentials(username: string, password: string): Promise<boolean> {
    // Verify username matches
    if (username !== process.env.username) {
      return false;
    }

    // Verify password matches either ps1 or ps2 (if it exists)
    if (password === process.env.ps1) {
      return true;
    }

    if (process.env.ps2 && password === process.env.ps2) {
      return true;
    }

    return false;
  }
} 