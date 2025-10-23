import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { ethers } from "ethers";
import { createPKPEthersWallet } from "./pkp-wallet";
import { getCurrentSessionSigs, isSessionValid } from "./lit-auth";

/**
 * PKP Ethers Signer for Multi-Chain Transaction Signing
 *
 * Provides ethers.js compatible signer for PKP wallets:
 * - Initialize PKPEthersWallet from PKP credentials
 * - Enable transaction signing through Lit network
 * - Support multi-chain operations (Ethereum, Polygon, Arbitrum, etc.)
 * - Handle gas estimation and transaction construction
 */

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: "pending" | "confirmed" | "failed";
  blockNumber?: number;
  blockHash?: string;
}

// Supported chain configurations
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: "https://ethereum.publicnode.com",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon.publicnode.com",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum",
    rpcUrl: "https://arbitrum.publicnode.com",
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  optimism: {
    chainId: 10,
    name: "Optimism",
    rpcUrl: "https://optimism.publicnode.com",
    blockExplorer: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://base.publicnode.com",
    blockExplorer: "https://basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: "https://sepolia.publicnode.com",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

class PKPSignerManager {
  private signers: Map<string, PKPEthersWallet> = new Map();
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  /**
   * Get or create PKP ethers wallet for a specific PKP
   */
  async getPKPSigner(
    tokenId: string,
    chainId: number
  ): Promise<PKPEthersWallet> {
    const signerKey = `${tokenId}-${chainId}`;

    if (this.signers.has(signerKey)) {
      return this.signers.get(signerKey)!;
    }

    try {
      // Check session validity
      if (!isSessionValid()) {
        throw new Error("No valid LIT session. Please authenticate first.");
      }

      const sessionSigs = getCurrentSessionSigs();
      if (!sessionSigs) {
        throw new Error("Session signatures not available");
      }

      // Create PKP ethers wallet
      const pkpWallet = await createPKPEthersWallet(tokenId);

      // Get chain configuration
      const chainConfig = this.getChainConfig(chainId);
      if (!chainConfig) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      // Create provider for the chain
      const provider = this.getProvider(chainId);

      // Connect PKP wallet to the provider
      const connectedWallet = pkpWallet;

      // Store the signer
      this.signers.set(signerKey, connectedWallet);

      console.log(
        `✅ PKP signer created for chain ${chainId}:`,
        connectedWallet.address
      );
      return connectedWallet;
    } catch (error) {
      console.error("❌ Failed to create PKP signer:", error);
      throw new Error(
        `PKP signer creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get provider for a specific chain
   */
  getProvider(chainId: number): ethers.JsonRpcProvider {
    if (this.providers.has(chainId)) {
      return this.providers.get(chainId)!;
    }

    const chainConfig = this.getChainConfig(chainId);
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    this.providers.set(chainId, provider);
    return provider;
  }

  /**
   * Get chain configuration
   */
  getChainConfig(chainId: number): ChainConfig | null {
    for (const config of Object.values(SUPPORTED_CHAINS)) {
      if (config.chainId === chainId) {
        return config;
      }
    }
    return null;
  }

  /**
   * Send transaction using PKP signer
   */
  async sendTransaction(
    tokenId: string,
    chainId: number,
    txRequest: TransactionRequest
  ): Promise<TransactionResult> {
    try {
      const signer = await this.getPKPSigner(tokenId, chainId);

      console.log("🔄 Sending transaction via PKP signer...");
      console.log("To:", txRequest.to);
      console.log("Value:", txRequest.value || "0");
      console.log("Chain:", chainId);

      // Estimate gas if not provided
      if (!txRequest.gasLimit) {
        try {
          const gasEstimate = await signer.estimateGas({
            to: txRequest.to,
            value: txRequest.value ? ethers.parseEther(txRequest.value) : 0,
            data: txRequest.data,
          });
          txRequest.gasLimit = gasEstimate.toString();
        } catch (error) {
          console.warn("⚠️ Gas estimation failed, using default:", error);
          txRequest.gasLimit = "21000"; // Default gas limit
        }
      }

      // Build transaction object
      const tx = {
        to: txRequest.to,
        value: txRequest.value ? ethers.parseEther(txRequest.value) : 0,
        data: txRequest.data || "0x",
        gasLimit: txRequest.gasLimit,
        gasPrice: txRequest.gasPrice
          ? ethers.parseUnits(txRequest.gasPrice, "gwei")
          : undefined,
        maxFeePerGas: txRequest.maxFeePerGas
          ? ethers.parseUnits(txRequest.maxFeePerGas, "gwei")
          : undefined,
        maxPriorityFeePerGas: txRequest.maxPriorityFeePerGas
          ? ethers.parseUnits(txRequest.maxPriorityFeePerGas, "gwei")
          : undefined,
      };

      // Send transaction
      const txResponse = await signer.sendTransaction(tx);

      console.log("✅ Transaction sent:", txResponse.hash);

      // Wait for confirmation
      const receipt = await txResponse.wait();

      const result: TransactionResult = {
        hash: txResponse.hash,
        from: txResponse.from,
        to: txRequest.to,
        value: txRequest.value || "0",
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: txResponse.gasPrice?.toString() || "0",
        status: receipt.status === 1 ? "confirmed" : "failed",
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
      };

      console.log("✅ Transaction confirmed:", result);
      return result;
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      throw new Error(
        `Transaction failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get PKP wallet balance
   */
  async getBalance(tokenId: string, chainId: number): Promise<string> {
    try {
      const signer = await this.getPKPSigner(tokenId, chainId);
      const balance = await signer.provider.getBalance(signer.address);
      return ethers.formatEther(balance.toString());
    } catch (error) {
      console.error("❌ Failed to get balance:", error);
      return "0";
    }
  }

  /**
   * Get PKP wallet address
   */
  async getAddress(tokenId: string, chainId: number): Promise<string> {
    try {
      const signer = await this.getPKPSigner(tokenId, chainId);
      return signer.address;
    } catch (error) {
      console.error("❌ Failed to get address:", error);
      throw new Error(
        `Failed to get PKP address: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get transaction count (nonce)
   */
  async getTransactionCount(tokenId: string, chainId: number): Promise<number> {
    try {
      const signer = await this.getPKPSigner(tokenId, chainId);
      return await signer.provider.getTransactionCount(signer.address);
    } catch (error) {
      console.error("❌ Failed to get transaction count:", error);
      return 0;
    }
  }

  /**
   * Get gas price for a chain
   */
  async getGasPrice(chainId: number): Promise<string> {
    try {
      const provider = this.getProvider(chainId);
      const gasPrice = await provider.getFeeData();
      return gasPrice.gasPrice
        ? ethers.formatUnits(gasPrice.gasPrice, "gwei")
        : "0";
    } catch (error) {
      console.error("❌ Failed to get gas price:", error);
      return "0";
    }
  }

  /**
   * Clear signer cache
   */
  clearSigners(): void {
    this.signers.clear();
    console.log("🧹 PKP signers cleared");
  }

  /**
   * Get all active signers
   */
  getActiveSigners(): string[] {
    return Array.from(this.signers.keys());
  }
}

// Export singleton instance
export const pkpSignerManager = new PKPSignerManager();

// Export convenience functions
export const getPKPSigner = (tokenId: string, chainId: number) =>
  pkpSignerManager.getPKPSigner(tokenId, chainId);

export const sendPKPTransaction = (
  tokenId: string,
  chainId: number,
  txRequest: TransactionRequest
) => pkpSignerManager.sendTransaction(tokenId, chainId, txRequest);

export const getPKPBalance = (tokenId: string, chainId: number) =>
  pkpSignerManager.getBalance(tokenId, chainId);

export const getPKPAddress = (tokenId: string, chainId: number) =>
  pkpSignerManager.getAddress(tokenId, chainId);

export const getPKPTransactionCount = (tokenId: string, chainId: number) =>
  pkpSignerManager.getTransactionCount(tokenId, chainId);

export const getGasPrice = (chainId: number) =>
  pkpSignerManager.getGasPrice(chainId);
export const clearPKPSigners = () => pkpSignerManager.clearSigners();
export const getActivePKPSigners = () => pkpSignerManager.getActiveSigners();
