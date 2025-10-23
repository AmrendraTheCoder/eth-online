// DropPilot Agent Types
export interface Agent {
  id: string;
  name: string;
  walletAddress: string;
  balance: string;
  status: "active" | "paused" | "error";
  totalProfit: string;
  uptime: string;
  rulesActive: number;
  totalExecutions: number;
  lastActivity: string;
  createdAt: string;
}

// Airdrop Opportunity Types
export interface AirdropOpportunity {
  id: string;
  name: string;
  chain: string;
  project: string;
  requirements: string[];
  estimatedValue: string;
  deadline: string;
  status: "active" | "expired" | "completed";
  difficulty: "easy" | "medium" | "hard";
  gasCost: string;
  timeRequired: string;
}

// Rule Types
export interface AirdropRule {
  id: string;
  name: string;
  trigger: "new_airdrop" | "price_threshold" | "volume_spike" | "time_based";
  condition: string;
  action: "bridge" | "swap" | "stake" | "bridge_and_swap" | "interact_contract";
  amount: string;
  chain: string;
  enabled: boolean;
  lastExecuted?: string;
  executions: number;
  profit?: string;
}

// Activity Types
export interface ActivityItem {
  id: string;
  timestamp: string;
  type:
    | "rule_execution"
    | "airdrop_detected"
    | "transaction"
    | "bridge"
    | "swap";
  status: "success" | "pending" | "failed";
  title: string;
  description: string;
  chain?: string;
  amount?: string;
  txHash?: string;
  ruleName?: string;
  profit?: string;
}

// Lit Protocol Types
export interface PKPWallet {
  tokenId: string;
  publicKey: string;
  address: string;
  status: "creating" | "ready" | "error";
}

export interface LitAction {
  id: string;
  name: string;
  code: string;
  status: "active" | "paused" | "error";
  lastExecution?: string;
  executions: number;
}

// Agent Metrics Types
export interface AgentMetrics {
  totalExecutions: number;
  activeActions: number;
  successRate: number;
  totalProfit: string;
  uptime: string;
}

// Monitoring Status Types
export interface MonitoringStatus {
  isMonitoring: boolean;
  opportunitiesCount: number;
  activeRulesCount: number;
}
