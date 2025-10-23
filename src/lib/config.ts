/**
 * Configuration Management for NIMBUS - DropPilot
 * 
 * Centralized configuration for:
 * - Environment variables
 * - Default values
 * - Validation
 * - Development vs Production settings
 */

export interface AppConfig {
  // WalletConnect Configuration
  walletConnect: {
    projectId: string;
    appName: string;
  };
  
  // LIT Protocol Configuration
  lit: {
    network: string;
    relayApiKey?: string;
    debug: boolean;
  };
  
  // RPC Configuration
  rpc: {
    infuraId?: string;
    alchemyId?: string;
  };
  
  // Development Configuration
  development: {
    nodeEnv: string;
    enableLogging: boolean;
  };
}

/**
 * Get application configuration with fallbacks
 */
export function getAppConfig(): AppConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    walletConnect: {
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
      appName: 'NIMBUS - DropPilot',
    },
    
    lit: {
      network: process.env.NEXT_PUBLIC_LIT_NETWORK || 'datil-dev',
      relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
      debug: isDevelopment,
    },
    
    rpc: {
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
      alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    },
    
    development: {
      nodeEnv: process.env.NODE_ENV || 'development',
      enableLogging: isDevelopment,
    },
  };
}

/**
 * Validate configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const config = getAppConfig();
  const errors: string[] = [];
  
  // Check WalletConnect Project ID
  if (config.walletConnect.projectId === 'demo' || !config.walletConnect.projectId) {
    errors.push('WalletConnect Project ID not configured. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
  }
  
  // Check LIT Network
  const validLitNetworks = ['datil-dev', 'cayenne', 'habanero', 'nautilus'];
  if (!validLitNetworks.includes(config.lit.network)) {
    errors.push(`Invalid LIT network: ${config.lit.network}. Valid options: ${validLitNetworks.join(', ')}`);
  }
  
  // Check for required environment variables in production
  if (config.development.nodeEnv === 'production') {
    if (!config.rpc.infuraId && !config.rpc.alchemyId) {
      errors.push('RPC provider required for production. Set NEXT_PUBLIC_INFURA_ID or NEXT_PUBLIC_ALCHEMY_ID');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get RPC URL for a specific chain
 */
export function getRpcUrl(chainId: number): string {
  const config = getAppConfig();
  
  // Default RPC URLs for common chains
  const defaultRpcs: Record<number, string> = {
    1: 'https://eth-mainnet.g.alchemy.com/v2/demo', // Ethereum Mainnet
    137: 'https://polygon-mainnet.g.alchemy.com/v2/demo', // Polygon
    42161: 'https://arb-mainnet.g.alchemy.com/v2/demo', // Arbitrum
    10: 'https://opt-mainnet.g.alchemy.com/v2/demo', // Optimism
    8453: 'https://base-mainnet.g.alchemy.com/v2/demo', // Base
    11155111: 'https://eth-sepolia.g.alchemy.com/v2/demo', // Sepolia
  };
  
  // Use configured RPC if available
  if (config.rpc.infuraId) {
    const infuraRpcs: Record<number, string> = {
      1: `https://mainnet.infura.io/v3/${config.rpc.infuraId}`,
      137: `https://polygon-mainnet.infura.io/v3/${config.rpc.infuraId}`,
      42161: `https://arbitrum-mainnet.infura.io/v3/${config.rpc.infuraId}`,
      10: `https://optimism-mainnet.infura.io/v3/${config.rpc.infuraId}`,
      8453: `https://base-mainnet.infura.io/v3/${config.rpc.infuraId}`,
      11155111: `https://sepolia.infura.io/v3/${config.rpc.infuraId}`,
    };
    
    if (infuraRpcs[chainId]) {
      return infuraRpcs[chainId];
    }
  }
  
  if (config.rpc.alchemyId) {
    const alchemyRpcs: Record<number, string> = {
      1: `https://eth-mainnet.g.alchemy.com/v2/${config.rpc.alchemyId}`,
      137: `https://polygon-mainnet.g.alchemy.com/v2/${config.rpc.alchemyId}`,
      42161: `https://arb-mainnet.g.alchemy.com/v2/${config.rpc.alchemyId}`,
      10: `https://opt-mainnet.g.alchemy.com/v2/${config.rpc.alchemyId}`,
      8453: `https://base-mainnet.g.alchemy.com/v2/${config.rpc.alchemyId}`,
      11155111: `https://eth-sepolia.g.alchemy.com/v2/${config.rpc.alchemyId}`,
    };
    
    if (alchemyRpcs[chainId]) {
      return alchemyRpcs[chainId];
    }
  }
  
  // Fallback to default RPC
  return defaultRpcs[chainId] || `https://eth-mainnet.g.alchemy.com/v2/demo`;
}

/**
 * Get development warnings
 */
export function getDevelopmentWarnings(): string[] {
  const config = getAppConfig();
  const warnings: string[] = [];
  
  if (config.development.nodeEnv === 'development') {
    if (config.walletConnect.projectId === 'demo') {
      warnings.push('Using demo WalletConnect Project ID. Configure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for production.');
    }
    
    if (config.lit.network === 'datil-dev') {
      warnings.push('Using LIT development network. This is not recommended for production.');
    }
    
    if (!config.rpc.infuraId && !config.rpc.alchemyId) {
      warnings.push('No RPC provider configured. Some features may not work properly.');
    }
  }
  
  return warnings;
}

// Export the configuration instance
export const appConfig = getAppConfig();
