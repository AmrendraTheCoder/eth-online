/**
 * Mock Lit Protocol Implementation
 *
 * This file provides mock implementations of Lit Protocol functionality
 * to bypass dependency issues during development.
 */

// Mock LitNodeClient
export class MockLitNodeClient {
  connected = false;
  config = {
    litNetworkName: "datil-dev",
    litNetwork: "datil-dev",
  };

  async connect() {
    this.connected = true;
    console.log("✅ Mock LIT client connected");
    return this;
  }

  async disconnect() {
    this.connected = false;
    console.log("🔌 Mock LIT client disconnected");
  }

  async executeJs(params: any) {
    console.log("🔧 Mock executeJs called with:", params);
    return {
      signatures: {},
      response: {
        success: true,
        data: "Mock execution result",
      },
    };
  }

  async mintPKP(params: any) {
    console.log("🔧 Mock mintPKP called with:", params);
    return {
      pkp: {
        tokenId: `mock_pkp_${Date.now()}`,
        publicKey: "mock_public_key",
        ethAddress: "0x" + Math.random().toString(16).substr(2, 40),
      },
    };
  }
}

// Mock LIT_NETWORKS
export const LIT_NETWORKS = {
  "datil-dev": {
    name: "datil-dev",
    chainId: 1,
  },
};

// Mock SessionSigs type
export type SessionSigs = Record<string, any>;

// Mock LitAuthClient
export class MockLitAuthClient {
  async authenticateWithEthWallet(params: any) {
    console.log("🔧 Mock authenticateWithEthWallet called");
    return {
      sessionSigs: {
        "1": {
          sig: "mock_signature",
          derivedVia: "mock_derivation",
          signedMessage: "mock_message",
          address: "mock_address",
        },
      },
    };
  }
}

// Mock PKPEthersWallet
export class MockPKPEthersWallet {
  address: string;
  publicKey: string;

  constructor(params: any) {
    this.address =
      params.ethAddress || "0x" + Math.random().toString(16).substr(2, 40);
    this.publicKey = params.publicKey || "mock_public_key";
  }

  async sendTransaction(tx: any) {
    console.log("🔧 Mock sendTransaction called with:", tx);
    return {
      hash: "0x" + Math.random().toString(16).substr(2, 64),
      from: this.address,
      to: tx.to,
      value: tx.value,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
    };
  }

  async getAddress() {
    return this.address;
  }

  connect(provider: any) {
    return this;
  }
}

// Export mock implementations
export const LitNodeClient = MockLitNodeClient;
export const LitAuthClient = MockLitAuthClient;
export const PKPEthersWallet = MockPKPEthersWallet;
