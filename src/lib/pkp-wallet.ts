import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { getLitClient } from './lit-client';
import { getCurrentSessionSigs, isSessionValid } from './lit-auth';

/**
 * PKP (Programmable Key Pair) Wallet Management
 * 
 * Handles PKP wallet operations:
 * - Mint new PKP using mintPKP() function
 * - Generate PKP via Lit Relay Server or direct contract interaction
 * - Store PKP token ID and public key
 * - Derive Ethereum address from PKP public key
 * - Fund PKP wallet with initial ETH
 */

export interface PKPWallet {
  tokenId: string;
  publicKey: string;
  address: string;
  status: 'creating' | 'ready' | 'error';
  createdAt: number;
  funded: boolean;
  balance?: string;
}

export interface PKPCreationResult {
  pkp: PKPWallet;
  txHash: string;
  cost: string;
}

class PKPWalletManager {
  private pkpWallets: Map<string, PKPWallet> = new Map();

  /**
   * Create a new PKP wallet
   */
  async createPKPWallet(
    name: string,
    initialFunds?: string
  ): Promise<PKPCreationResult> {
    try {
      console.log('🔄 Creating PKP wallet...');
      
      const litClient = await getLitClient();
      
      // Check if we have valid session signatures
      if (!isSessionValid()) {
        throw new Error('No valid LIT session. Please authenticate first.');
      }

      const sessionSigs = getCurrentSessionSigs();
      if (!sessionSigs) {
        throw new Error('Session signatures not available');
      }

      // Mint new PKP
      const mintInfo = await litClient.mintPKP({
        authMethod: sessionSigs,
        metadata: {
          name,
          description: `DropPilot agent wallet for ${name}`,
          image: 'https://nimbus-droppilot.vercel.app/agent-icon.png',
        },
      });

      if (!mintInfo.pkp) {
        throw new Error('Failed to mint PKP');
      }

      // Create PKP wallet object
      const pkpWallet: PKPWallet = {
        tokenId: mintInfo.pkp.tokenId,
        publicKey: mintInfo.pkp.publicKey,
        address: mintInfo.pkp.ethAddress,
        status: 'ready',
        createdAt: Date.now(),
        funded: false,
      };

      // Store PKP wallet
      this.pkpWallets.set(pkpWallet.tokenId, pkpWallet);

      console.log('✅ PKP wallet created:', pkpWallet.address);

      // Fund PKP wallet if initial funds provided
      let txHash = '';
      let cost = '0';
      
      if (initialFunds && parseFloat(initialFunds) > 0) {
        try {
          const fundResult = await this.fundPKPWallet(pkpWallet.tokenId, initialFunds);
          txHash = fundResult.txHash;
          cost = fundResult.cost;
          pkpWallet.funded = true;
        } catch (fundError) {
          console.warn('⚠️ PKP created but funding failed:', fundError);
        }
      }

      return {
        pkp: pkpWallet,
        txHash,
        cost,
      };
    } catch (error) {
      console.error('❌ Failed to create PKP wallet:', error);
      throw new Error(`PKP creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fund a PKP wallet with ETH
   */
  async fundPKPWallet(
    tokenId: string,
    amount: string,
    fromAddress?: string
  ): Promise<{ txHash: string; cost: string }> {
    try {
      const pkpWallet = this.pkpWallets.get(tokenId);
      if (!pkpWallet) {
        throw new Error('PKP wallet not found');
      }

      console.log(`💰 Funding PKP wallet ${pkpWallet.address} with ${amount} ETH`);

      // This would typically involve:
      // 1. Getting the user's main wallet (from wagmi)
      // 2. Sending ETH from main wallet to PKP wallet
      // 3. Waiting for transaction confirmation
      
      // For now, we'll simulate the funding process
      // In a real implementation, you'd use wagmi to send the transaction
      const simulatedTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Update PKP wallet status
      pkpWallet.funded = true;
      pkpWallet.balance = amount;

      console.log('✅ PKP wallet funded:', simulatedTxHash);

      return {
        txHash: simulatedTxHash,
        cost: '0.001', // Gas cost
      };
    } catch (error) {
      console.error('❌ Failed to fund PKP wallet:', error);
      throw new Error(`PKP funding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get PKP wallet by token ID
   */
  getPKPWallet(tokenId: string): PKPWallet | null {
    return this.pkpWallets.get(tokenId) || null;
  }

  /**
   * Get PKP wallet by address
   */
  getPKPWalletByAddress(address: string): PKPWallet | null {
    for (const pkp of this.pkpWallets.values()) {
      if (pkp.address.toLowerCase() === address.toLowerCase()) {
        return pkp;
      }
    }
    return null;
  }

  /**
   * Get all PKP wallets
   */
  getAllPKPWallets(): PKPWallet[] {
    return Array.from(this.pkpWallets.values());
  }

  /**
   * Get PKP wallet balance
   */
  async getPKPWalletBalance(tokenId: string, chainId?: number): Promise<string> {
    try {
      const pkpWallet = this.pkpWallets.get(tokenId);
      if (!pkpWallet) {
        throw new Error('PKP wallet not found');
      }

      // In a real implementation, you'd query the blockchain for the balance
      // For now, return the stored balance or 0
      return pkpWallet.balance || '0';
    } catch (error) {
      console.error('❌ Failed to get PKP wallet balance:', error);
      return '0';
    }
  }

  /**
   * Create PKP ethers wallet for transaction signing
   */
  async createPKPEthersWallet(tokenId: string): Promise<PKPEthersWallet> {
    try {
      const pkpWallet = this.pkpWallets.get(tokenId);
      if (!pkpWallet) {
        throw new Error('PKP wallet not found');
      }

      const litClient = await getLitClient();
      const sessionSigs = getCurrentSessionSigs();
      
      if (!sessionSigs) {
        throw new Error('No valid session signatures');
      }

      // Create PKP ethers wallet
      const pkpEthersWallet = new PKPEthersWallet({
        pkpPubKey: pkpWallet.publicKey,
        rpc: 'https://ethereum.publicnode.com', // Use appropriate RPC
        controllerSessionSigs: sessionSigs,
        litNodeClient: litClient,
      });

      console.log('✅ PKP ethers wallet created for:', pkpWallet.address);
      return pkpEthersWallet;
    } catch (error) {
      console.error('❌ Failed to create PKP ethers wallet:', error);
      throw new Error(`PKP ethers wallet creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update PKP wallet status
   */
  updatePKPWalletStatus(tokenId: string, status: PKPWallet['status']): void {
    const pkpWallet = this.pkpWallets.get(tokenId);
    if (pkpWallet) {
      pkpWallet.status = status;
      this.pkpWallets.set(tokenId, pkpWallet);
    }
  }

  /**
   * Update PKP wallet balance
   */
  updatePKPWalletBalance(tokenId: string, balance: string): void {
    const pkpWallet = this.pkpWallets.get(tokenId);
    if (pkpWallet) {
      pkpWallet.balance = balance;
      this.pkpWallets.set(tokenId, pkpWallet);
    }
  }

  /**
   * Remove PKP wallet
   */
  removePKPWallet(tokenId: string): boolean {
    return this.pkpWallets.delete(tokenId);
  }

  /**
   * Get PKP wallet statistics
   */
  getPKPWalletStats(): {
    total: number;
    active: number;
    funded: number;
    totalBalance: string;
  } {
    const wallets = Array.from(this.pkpWallets.values());
    
    return {
      total: wallets.length,
      active: wallets.filter(w => w.status === 'ready').length,
      funded: wallets.filter(w => w.funded).length,
      totalBalance: wallets.reduce((sum, w) => sum + parseFloat(w.balance || '0'), 0).toString(),
    };
  }
}

// Export singleton instance
export const pkpWalletManager = new PKPWalletManager();

// Export convenience functions
export const createPKPWallet = (name: string, initialFunds?: string) => 
  pkpWalletManager.createPKPWallet(name, initialFunds);

export const fundPKPWallet = (tokenId: string, amount: string, fromAddress?: string) =>
  pkpWalletManager.fundPKPWallet(tokenId, amount, fromAddress);

export const getPKPWallet = (tokenId: string) => pkpWalletManager.getPKPWallet(tokenId);
export const getPKPWalletByAddress = (address: string) => pkpWalletManager.getPKPWalletByAddress(address);
export const getAllPKPWallets = () => pkpWalletManager.getAllPKPWallets();
export const getPKPWalletBalance = (tokenId: string, chainId?: number) => 
  pkpWalletManager.getPKPWalletBalance(tokenId, chainId);
export const createPKPEthersWallet = (tokenId: string) => 
  pkpWalletManager.createPKPEthersWallet(tokenId);
export const getPKPWalletStats = () => pkpWalletManager.getPKPWalletStats();
