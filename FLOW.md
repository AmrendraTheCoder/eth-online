# NIMBUS - DropPilot Lit Protocol Integration Flow

## 🎯 **Overview**

This document explains the complete flow of how NIMBUS (DropPilot) integrates with Lit Protocol to create autonomous airdrop farming agents. It's designed for developers who want to understand the system architecture and implementation flow.

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Lit Protocol  │    │   Blockchain    │
│   (Next.js)     │◄──►│   (PKP + Actions)│◄──►│   (Multi-chain)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WalletConnect │    │   Session Sigs  │    │   PKP Wallets   │
│   (RainbowKit)  │    │   (Auth)        │    │   (Automation)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 **Complete Integration Flow**

### **Phase 1: Initialization & Setup**

#### 1.1 Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_LIT_NETWORK=datil-dev
NODE_ENV=development
```

#### 1.2 Application Bootstrap

```typescript
// src/components/providers.tsx
export function Providers({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

#### 1.3 Lit Protocol Client Initialization

```typescript
// src/lib/lit-client.ts
class LitClientManager {
  async getClient(): Promise<LitNodeClient> {
    // Singleton pattern to prevent multiple instances
    if (this.client && this.connected) {
      return this.client;
    }

    // Connect to Lit network
    this.client = new LitNodeClient({
      litNetwork: LIT_NETWORKS[network],
      debug: process.env.NODE_ENV === "development",
    });

    await this.client.connect();
    this.connected = true;
    return this.client;
  }
}
```

### **Phase 2: User Authentication**

#### 2.1 Wallet Connection

```typescript
// User connects wallet via RainbowKit
const { address, isConnected } = useAccount();
```

#### 2.2 Lit Protocol Authentication

```typescript
// src/lib/lit-auth.ts
async generateSessionSigs(
  walletAddress: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>
): Promise<SessionSigs> {
  const authClient = await this.initialize();

  const authMethod = await authClient.initWalletAuth({
    wallet: { address: walletAddress, chainId: chainId.toString() },
    signMessage,
  });

  const sessionSigs = await authClient.getSessionSigs({
    authMethod,
    chain: `ethereum:${chainId}`,
    expiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  return sessionSigs;
}
```

### **Phase 3: PKP Wallet Creation**

#### 3.1 Create Agent (PKP Wallet)

```typescript
// src/lib/pkp-wallet.ts
async createPKPWallet(name: string, initialFunds?: string) {
  const litClient = await getLitClient();
  const sessionSigs = getCurrentSessionSigs();

  // Mint new PKP
  const mintInfo = await litClient.mintPKP({
    authMethod: sessionSigs,
    metadata: {
      name,
      description: `DropPilot agent wallet for ${name}`,
      image: 'https://nimbus-droppilot.vercel.app/agent-icon.png',
    },
  });

  // Create PKP wallet object
  const pkpWallet: PKPWallet = {
    tokenId: mintInfo.pkp.tokenId,
    publicKey: mintInfo.pkp.publicKey,
    address: mintInfo.pkp.ethAddress,
    status: 'ready',
    createdAt: Date.now(),
    funded: false,
  };

  return { pkp: pkpWallet, txHash, cost };
}
```

#### 3.2 Fund PKP Wallet

```typescript
async fundPKPWallet(tokenId: string, amount: string) {
  // In production: Send ETH from user's main wallet to PKP wallet
  // For demo: Simulate funding
  const simulatedTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

  pkpWallet.funded = true;
  pkpWallet.balance = amount;

  return { txHash: simulatedTxHash, cost: '0.001' };
}
```

### **Phase 4: Rules Engine Setup**

#### 4.1 Create Automation Rules

```typescript
// src/lib/rules-engine.ts
addRule({
  name: "ZkSync Airdrop Hunter",
  trigger: "new_airdrop",
  condition: "chain = 'zksync' AND estimatedValue > 500",
  action: "bridge_and_swap",
  amount: "0.05",
  chain: "zksync",
  enabled: true,
  litActionTemplateId: "airdrop-hunter-action",
  litActionParameters: {
    maxGasPrice: "50",
    maxSlippage: "0.5",
    retryAttempts: 3,
  },
});
```

#### 4.2 Rule-to-Lit-Action Mapping

```typescript
private mapActionToLitActionTemplate(rule: AirdropRule): void {
  switch (rule.action) {
    case "bridge":
      rule.litActionTemplateId = "bridge-action";
      rule.litActionParameters = {
        fromChain: "ethereum",
        toChain: rule.chain,
        amount: rule.amount,
        bridgeProtocol: "layerzero",
        tokenAddress: "native",
      };
      break;

    case "swap":
      rule.litActionTemplateId = "swap-action";
      rule.litActionParameters = {
        chain: rule.chain,
        tokenIn: "0x0000000000000000000000000000000000000000", // ETH
        tokenOut: "0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C", // USDC
        amount: rule.amount,
        dex: "uniswap-v3",
        slippage: "0.5",
      };
      break;
  }
}
```

### **Phase 5: Lit Actions Execution**

#### 5.1 Lit Action Templates

```typescript
// src/lib/lit-actions-executor.ts
class LitActionExecutor {
  private initializeTemplates(): void {
    // Bridge Action Template
    this.addTemplate({
      id: "bridge-action",
      name: "Bridge Action",
      description: "Bridge funds across different chains",
      code: this.getBridgeActionCode(),
      parameters: [
        { name: "fromChain", type: "string", required: true },
        { name: "toChain", type: "string", required: true },
        { name: "amount", type: "string", required: true },
        { name: "bridgeProtocol", type: "string", required: true },
      ],
      category: "bridge",
      version: "1.0.0",
    });
  }
}
```

#### 5.2 Execute Lit Actions

```typescript
async executeLitAction(
  templateId: string,
  parameters: Record<string, unknown>,
  pkpTokenId?: string
): Promise<LitActionResult> {
  const litClient = await getLitClient();
  const sessionSigs = getCurrentSessionSigs();

  const result = await litClient.executeJs({
    code: template.code,
    sessionSigs: sessionSigs,
    jsParams: parameters,
    ipfsId: undefined, // Use inline code
  });

  return {
    success: true,
    data: result,
    executionTime: Date.now() - startTime,
  };
}
```

### **Phase 6: Rule Monitoring & Execution**

#### 6.1 Start Monitoring

```typescript
startMonitoring(intervalMs: number = 30000): void {
  this.monitoringInterval = setInterval(async () => {
    await this.checkAndExecuteRules();
  }, intervalMs);
}
```

#### 6.2 Rule Execution Flow

```typescript
private async checkAndExecuteRules(): Promise<void> {
  const activeRules = this.getActiveRules();

  for (const rule of activeRules) {
    // Create execution context
    const context = await this.createExecutionContext();

    // Check if rule should execute
    if (this.shouldExecuteRule(rule, context)) {
      await this.executeRule(rule.id, context);
    }
  }
}
```

#### 6.3 Rule Execution

```typescript
async executeRule(
  ruleId: string,
  context: RuleExecutionContext,
  pkpTokenId?: string
): Promise<LitActionExecutionResult> {
  const rule = this.rules.get(ruleId);

  // Check rule conditions
  if (!this.checkRuleConditions(rule, context)) {
    throw new Error(`Rule conditions not met: ${rule.condition}`);
  }

  // Prepare Lit Action parameters
  const litActionParams = this.prepareLitActionParameters(rule, context);

  // Execute Lit Action
  const result = await executeLitAction(
    rule.litActionTemplateId!,
    litActionParams,
    pkpTokenId
  );

  // Update rule execution count and history
  rule.executions += 1;
  rule.lastExecuted = new Date().toISOString();
  rule.litActionLastExecution = executionResult;

  return executionResult;
}
```

## 🔧 **Key Components Explained**

### **1. Lit Protocol Integration**

- **LitNodeClient**: Main client for interacting with Lit network
- **Session Signatures**: Authentication mechanism for Lit operations
- **PKP Wallets**: Programmable Key Pairs for autonomous transactions
- **Lit Actions**: Serverless JavaScript functions executed by Lit nodes

### **2. Rules Engine**

- **Rule Definition**: If-then-else logic for automation
- **Condition Evaluation**: Check if rules should execute
- **Action Mapping**: Connect rules to Lit Action templates
- **Execution Monitoring**: Continuous monitoring for rule triggers

### **3. PKP Wallet Management**

- **Wallet Creation**: Mint new PKP wallets via Lit Protocol
- **Funding**: Transfer ETH to PKP wallets for gas fees
- **Signing**: Use PKP wallets for transaction signing
- **Balance Tracking**: Monitor PKP wallet balances

### **4. Lit Actions System**

- **Template Management**: Pre-built Lit Action templates
- **Parameter Handling**: Pass data to Lit Actions
- **Execution Tracking**: Monitor Lit Action execution results
- **Error Handling**: Handle and log execution failures

## 🚀 **Development Flow for New Developers**

### **Step 1: Environment Setup**

```bash
# Clone repository
git clone <repository-url>
cd eth-online

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your WalletConnect Project ID

# Start development server
npm run dev
```

### **Step 2: Understanding the Codebase**

1. **Start with**: `src/components/providers.tsx` - Application bootstrap
2. **Then**: `src/lib/lit-client.ts` - Lit Protocol connection
3. **Next**: `src/lib/lit-auth.ts` - Authentication flow
4. **Follow**: `src/lib/pkp-wallet.ts` - PKP wallet management
5. **Study**: `src/lib/rules-engine.ts` - Automation logic
6. **Explore**: `src/lib/lit-actions-executor.ts` - Action execution

### **Step 3: Key Files to Understand**

- **`src/hooks/useLitProtocol.ts`**: Main hook for Lit Protocol integration
- **`src/app/dashboard/page.tsx`**: Main dashboard interface
- **`src/app/agent/create/page.tsx`**: PKP wallet creation
- **`src/app/rules/page.tsx`**: Rules management interface

### **Step 4: Testing the Flow**

1. **Connect Wallet**: Use RainbowKit to connect MetaMask
2. **Create Agent**: Navigate to `/agent/create` and create a PKP wallet
3. **Set Rules**: Go to `/rules` and create automation rules
4. **Monitor**: Check `/dashboard` for agent status and execution history

## 🔍 **Debugging Guide**

### **Common Issues & Solutions**

#### 1. **WalletConnect Errors**

```bash
# Error: WalletConnect Core is already initialized
# Solution: Use singleton pattern in providers.tsx
```

#### 2. **Lit Protocol Connection Issues**

```bash
# Error: LIT connection failed
# Solution: Check network configuration and session validity
```

#### 3. **PKP Wallet Creation Fails**

```bash
# Error: Failed to mint PKP
# Solution: Ensure valid session signatures and sufficient gas
```

#### 4. **Lit Action Execution Errors**

```bash
# Error: Lit Action execution failed
# Solution: Check Lit Action code and parameter validation
```

## 📊 **Monitoring & Analytics**

### **Key Metrics to Track**

- **PKP Wallet Count**: Number of created agent wallets
- **Rule Execution Rate**: How often rules trigger
- **Success Rate**: Percentage of successful executions
- **Gas Usage**: Total gas consumed by operations
- **Profit Tracking**: Revenue generated from airdrop farming

### **Dashboard Components**

- **Agent Status**: Real-time agent health and activity
- **Execution History**: Log of all rule executions
- **Performance Metrics**: Success rates and gas efficiency
- **Rule Management**: Enable/disable automation rules

## 🛡️ **Security Considerations**

### **PKP Security**

- **Session Management**: Proper session signature handling
- **Access Control**: Limit PKP wallet permissions
- **Key Rotation**: Regular key updates for security

### **Rule Security**

- **Input Validation**: Sanitize rule conditions and parameters
- **Rate Limiting**: Prevent rule execution spam
- **Error Handling**: Graceful failure handling

## 🔮 **Future Enhancements**

### **Planned Features**

- **Multi-Chain Support**: Expand beyond Ethereum ecosystem
- **Advanced Analytics**: Machine learning for rule optimization
- **Social Features**: Share successful rule configurations
- **Mobile App**: Native mobile application

### **Integration Opportunities**

- **DeFi Protocols**: Direct integration with popular DeFi platforms
- **Oracle Services**: Real-time price and data feeds
- **Cross-Chain Bridges**: Seamless multi-chain operations
- **AI/ML**: Intelligent rule generation and optimization

## 📚 **Additional Resources**

### **Documentation Links**

- [Lit Protocol Documentation](https://developer.litprotocol.com/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)

### **Community Resources**

- [Lit Protocol Discord](https://discord.gg/litprotocol)
- [GitHub Repository](https://github.com/LIT-Protocol)
- [Developer Forums](https://forum.litprotocol.com/)

---

## 🎯 **Quick Start Checklist**

- [ ] Set up environment variables
- [ ] Install dependencies
- [ ] Start development server
- [ ] Connect wallet via RainbowKit
- [ ] Create first PKP wallet
- [ ] Set up automation rules
- [ ] Test Lit Action execution
- [ ] Monitor dashboard metrics

This flow document provides a complete understanding of how NIMBUS integrates with Lit Protocol to create autonomous airdrop farming agents. Follow the phases sequentially to understand the full system architecture and implementation.
