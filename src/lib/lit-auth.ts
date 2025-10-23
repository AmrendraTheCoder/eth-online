import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { SessionSigs } from '@lit-protocol/auth-helpers';
import { getLitClient } from './lit-client';

/**
 * LIT Protocol Authentication Service
 * 
 * Handles session signature generation for PKP operations:
 * - Generate session signatures for PKP operations
 * - Handle authentication with user's wallet (via wagmi)
 * - Manage session expiration and renewal
 * - Support multiple auth methods (wallet, social, webauthn)
 */

export interface AuthSession {
  sessionSigs: SessionSigs;
  expiresAt: number;
  authMethod: string;
  userId: string;
}

class LitAuthManager {
  private authClient: LitAuthClient | null = null;
  private currentSession: AuthSession | null = null;
  private sessionRenewalTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize the LIT auth client
   */
  async initialize(): Promise<LitAuthClient> {
    if (this.authClient) {
      return this.authClient;
    }

    try {
      const litClient = await getLitClient();
      
      this.authClient = new LitAuthClient({
        litRelayConfig: {
          relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
        },
        litNodeClient: litClient,
      });

      console.log('✅ LIT Auth client initialized');
      return this.authClient;
    } catch (error) {
      console.error('❌ Failed to initialize LIT auth client:', error);
      throw new Error(`LIT auth initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate session signatures for wallet authentication
   */
  async generateSessionSigs(
    walletAddress: string,
    chainId: number,
    signMessage: (message: string) => Promise<string>
  ): Promise<SessionSigs> {
    try {
      const authClient = await this.initialize();
      
      // Create wallet auth method
      const authMethod = await authClient.initWalletAuth({
        wallet: {
          address: walletAddress,
          chainId: chainId.toString(),
        },
        signMessage,
      });

      // Generate session signatures
      const sessionSigs = await authClient.getSessionSigs({
        authMethod,
        chain: `ethereum:${chainId}`,
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Store session
      this.currentSession = {
        sessionSigs,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        authMethod: 'wallet',
        userId: walletAddress,
      };

      // Set up session renewal
      this.setupSessionRenewal(walletAddress, chainId, signMessage);

      console.log('✅ Session signatures generated for wallet:', walletAddress);
      return sessionSigs;
    } catch (error) {
      console.error('❌ Failed to generate session signatures:', error);
      throw new Error(`Session signature generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate session signatures for social authentication
   */
  async generateSocialSessionSigs(
    provider: 'google' | 'discord' | 'github',
    redirectUri?: string
  ): Promise<SessionSigs> {
    try {
      const authClient = await this.initialize();
      
      // Create social auth method
      const authMethod = await authClient.initSocialAuth({
        provider,
        redirectUri: redirectUri || window.location.origin,
      });

      // Generate session signatures
      const sessionSigs = await authClient.getSessionSigs({
        authMethod,
        chain: 'ethereum:1',
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Store session
      this.currentSession = {
        sessionSigs,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        authMethod: provider,
        userId: authMethod.userId,
      };

      console.log('✅ Session signatures generated for social auth:', provider);
      return sessionSigs;
    } catch (error) {
      console.error('❌ Failed to generate social session signatures:', error);
      throw new Error(`Social session signature generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current session signatures
   */
  getCurrentSessionSigs(): SessionSigs | null {
    if (!this.currentSession || this.isSessionExpired()) {
      return null;
    }
    return this.currentSession.sessionSigs;
  }

  /**
   * Check if current session is valid
   */
  isSessionValid(): boolean {
    return this.currentSession !== null && !this.isSessionExpired();
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(): boolean {
    if (!this.currentSession) return true;
    return Date.now() >= this.currentSession.expiresAt;
  }

  /**
   * Get session info
   */
  getSessionInfo(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Setup automatic session renewal
   */
  private setupSessionRenewal(
    walletAddress: string,
    chainId: number,
    signMessage: (message: string) => Promise<string>
  ): void {
    // Clear existing timer
    if (this.sessionRenewalTimer) {
      clearTimeout(this.sessionRenewalTimer);
    }

    // Set up renewal 1 hour before expiration
    const renewalTime = this.currentSession!.expiresAt - Date.now() - 60 * 60 * 1000;
    
    if (renewalTime > 0) {
      this.sessionRenewalTimer = setTimeout(async () => {
        try {
          console.log('🔄 Renewing LIT session...');
          await this.generateSessionSigs(walletAddress, chainId, signMessage);
        } catch (error) {
          console.error('❌ Failed to renew session:', error);
        }
      }, renewalTime);
    }
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.currentSession = null;
    
    if (this.sessionRenewalTimer) {
      clearTimeout(this.sessionRenewalTimer);
      this.sessionRenewalTimer = null;
    }
    
    console.log('🧹 LIT session cleared');
  }

  /**
   * Refresh session signatures
   */
  async refreshSession(
    walletAddress: string,
    chainId: number,
    signMessage: (message: string) => Promise<string>
  ): Promise<SessionSigs> {
    this.clearSession();
    return this.generateSessionSigs(walletAddress, chainId, signMessage);
  }

  /**
   * Get auth client instance
   */
  async getAuthClient(): Promise<LitAuthClient> {
    return this.initialize();
  }
}

// Export singleton instance
export const litAuth = new LitAuthManager();

// Export convenience functions
export const generateWalletSessionSigs = (
  walletAddress: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>
) => litAuth.generateSessionSigs(walletAddress, chainId, signMessage);

export const generateSocialSessionSigs = (
  provider: 'google' | 'discord' | 'github',
  redirectUri?: string
) => litAuth.generateSocialSessionSigs(provider, redirectUri);

export const getCurrentSessionSigs = () => litAuth.getCurrentSessionSigs();
export const isSessionValid = () => litAuth.isSessionValid();
export const clearSession = () => litAuth.clearSession();
export const refreshSession = (
  walletAddress: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>
) => litAuth.refreshSession(walletAddress, chainId, signMessage);
