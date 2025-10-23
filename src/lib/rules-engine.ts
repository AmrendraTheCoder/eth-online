import { litActionExecutor, executeLitAction } from "./lit-actions-executor";
import { getPKPWallet } from "./pkp-wallet";

/**
 * Enhanced Rules Engine for Lit Actions Integration
 *
 * Connects rules to Lit Actions:
 * - Map rule actions to specific Lit Action templates
 * - Convert rule parameters to Lit Action inputs
 * - Store Lit Action IPFS CIDs with rules
 * - Enable/disable rule execution via Lit Actions
 */

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
  // Lit Action integration fields
  litActionTemplateId?: string;
  litActionParameters?: Record<string, any>;
  litActionExecutionId?: string;
  litActionIPFSCID?: string;
  litActionLastExecution?: LitActionExecutionResult;
}

export interface LitActionExecutionResult {
  success: boolean;
  txHash?: string;
  gasUsed?: number;
  cost?: string;
  executionTime?: number;
  error?: string;
  timestamp: string;
}

export interface RuleExecutionContext {
  airdropOpportunity?: {
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
  };
  marketData?: {
    price: string;
    volume: string;
    change24h: string;
  };
  timeData?: {
    hour: number;
    day: number;
    week: number;
  };
}

class RulesEngine {
  private rules: Map<string, AirdropRule> = new Map();
  private executionHistory: Map<string, LitActionExecutionResult[]> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default rules with Lit Action mappings
   */
  private initializeDefaultRules(): void {
    // ZkSync Airdrop Rule
    this.addRule({
      id: "zk_sync_airdrop",
      name: "ZkSync Airdrop Hunter",
      trigger: "new_airdrop",
      condition: "chain = 'zksync' AND estimatedValue > 500",
      action: "bridge_and_swap",
      amount: "0.05",
      chain: "zksync",
      enabled: true,
      executions: 0,
      litActionTemplateId: "airdrop-hunter-action",
      litActionParameters: {
        maxGasPrice: "50",
        maxSlippage: "0.5",
        retryAttempts: 3,
      },
    });

    // LayerZero Bridge Rule
    this.addRule({
      id: "layerzero_bridge",
      name: "LayerZero Bridge Bot",
      trigger: "new_airdrop",
      condition: "project = 'layerzero' AND difficulty = 'hard'",
      action: "bridge",
      amount: "0.1",
      chain: "arbitrum",
      enabled: true,
      executions: 0,
      litActionTemplateId: "bridge-action",
      litActionParameters: {
        bridgeProtocol: "layerzero",
        tokenAddress: "native",
      },
    });

    // Starknet DEX Rule
    this.addRule({
      id: "starknet_dex",
      name: "Starknet DEX Trader",
      trigger: "new_airdrop",
      condition: "chain = 'starknet' AND dex_volume > 1000",
      action: "swap",
      amount: "0.02",
      chain: "starknet",
      enabled: true,
      executions: 0,
      litActionTemplateId: "swap-action",
      litActionParameters: {
        dex: "uniswap-v3",
        slippage: "0.5",
      },
    });

    // ETH Staking Rule
    this.addRule({
      id: "eth_staking",
      name: "ETH Staking Bot",
      trigger: "time_based",
      condition: "hour = 0 AND day % 7 = 0", // Weekly staking
      action: "stake",
      amount: "0.1",
      chain: "ethereum",
      enabled: false,
      executions: 0,
      litActionTemplateId: "stake-action",
      litActionParameters: {
        protocol: "lido",
        token: "native",
      },
    });
  }

  /**
   * Add a new rule
   */
  addRule(rule: Omit<AirdropRule, "id" | "executions">): AirdropRule {
    const newRule: AirdropRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      executions: 0,
    };

    // Map action to Lit Action template
    this.mapActionToLitActionTemplate(newRule);

    this.rules.set(newRule.id, newRule);
    console.log(`✅ Added rule: ${newRule.name}`);
    return newRule;
  }

  /**
   * Map rule action to Lit Action template
   */
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

      case "stake":
        rule.litActionTemplateId = "stake-action";
        rule.litActionParameters = {
          chain: rule.chain,
          protocol: "lido",
          amount: rule.amount,
          token: "native",
        };
        break;

      case "bridge_and_swap":
        rule.litActionTemplateId = "airdrop-hunter-action";
        rule.litActionParameters = {
          maxGasPrice: "50",
          maxSlippage: "0.5",
          retryAttempts: 3,
        };
        break;

      case "interact_contract":
        rule.litActionTemplateId = "airdrop-hunter-action";
        rule.litActionParameters = {
          maxGasPrice: "50",
          maxSlippage: "0.5",
          retryAttempts: 3,
        };
        break;

      default:
        console.warn(`⚠️ Unknown action type: ${rule.action}`);
    }
  }

  /**
   * Get all rules
   */
  getAllRules(): AirdropRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get active rules
   */
  getActiveRules(): AirdropRule[] {
    return Array.from(this.rules.values()).filter((rule) => rule.enabled);
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): AirdropRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, updates: Partial<AirdropRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };

    // Re-map Lit Action template if action changed
    if (updates.action) {
      this.mapActionToLitActionTemplate(updatedRule);
    }

    this.rules.set(ruleId, updatedRule);
    return true;
  }

  /**
   * Delete rule
   */
  deleteRule(ruleId: string): boolean {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      this.executionHistory.delete(ruleId);
      console.log(`🗑️ Deleted rule: ${ruleId}`);
    }
    return deleted;
  }

  /**
   * Execute a rule
   */
  async executeRule(
    ruleId: string,
    context: RuleExecutionContext,
    pkpTokenId?: string
  ): Promise<LitActionExecutionResult> {
    const rule = this.rules.get(ruleId);
    if (!rule || !rule.enabled) {
      throw new Error(`Rule not found or disabled: ${ruleId}`);
    }

    try {
      console.log(`🔄 Executing rule: ${rule.name}`);

      // Check if rule conditions are met
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

      // Create execution result
      const executionResult: LitActionExecutionResult = {
        success: result.success,
        txHash: result.data?.txHash,
        gasUsed: result.data?.gasUsed,
        cost: result.data?.cost,
        executionTime: result.executionTime,
        error: result.error,
        timestamp: new Date().toISOString(),
      };

      // Update rule execution count
      rule.executions += 1;
      rule.lastExecuted = executionResult.timestamp;
      rule.litActionLastExecution = executionResult;

      // Store execution history
      if (!this.executionHistory.has(ruleId)) {
        this.executionHistory.set(ruleId, []);
      }
      this.executionHistory.get(ruleId)!.push(executionResult);

      // Update rule in storage
      this.rules.set(ruleId, rule);

      console.log(`✅ Rule executed successfully: ${rule.name}`);
      return executionResult;
    } catch (error) {
      console.error(`❌ Rule execution failed: ${rule.name}`, error);

      const executionResult: LitActionExecutionResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };

      // Store failed execution
      if (!this.executionHistory.has(ruleId)) {
        this.executionHistory.set(ruleId, []);
      }
      this.executionHistory.get(ruleId)!.push(executionResult);

      return executionResult;
    }
  }

  /**
   * Check if rule conditions are met
   */
  private checkRuleConditions(
    rule: AirdropRule,
    context: RuleExecutionContext
  ): boolean {
    try {
      // Simple condition evaluation
      // In a real implementation, you'd use a proper expression evaluator

      if (rule.trigger === "new_airdrop" && context.airdropOpportunity) {
        const opp = context.airdropOpportunity;

        // Check chain condition
        if (rule.condition.includes(`chain = '${opp.chain}'`)) {
          return true;
        }

        // Check project condition
        if (
          rule.condition.includes(`project = '${opp.project.toLowerCase()}'`)
        ) {
          return true;
        }

        // Check estimated value condition
        const valueMatch = rule.condition.match(/estimatedValue > (\d+)/);
        if (valueMatch) {
          const minValue = parseInt(valueMatch[1]);
          const oppValue = parseFloat(opp.estimatedValue.replace(/[$,]/g, ""));
          return oppValue > minValue;
        }
      }

      if (rule.trigger === "price_threshold" && context.marketData) {
        // Price threshold logic
        const price = parseFloat(context.marketData.price);
        const thresholdMatch = rule.condition.match(/price > (\d+)/);
        if (thresholdMatch) {
          const threshold = parseFloat(thresholdMatch[1]);
          return price > threshold;
        }
      }

      if (rule.trigger === "time_based" && context.timeData) {
        // Time-based logic
        if (rule.condition.includes(`hour = ${context.timeData.hour}`)) {
          return true;
        }
        if (rule.condition.includes(`day % 7 = 0`)) {
          return context.timeData.day % 7 === 0;
        }
      }

      return false;
    } catch (error) {
      console.error("❌ Error checking rule conditions:", error);
      return false;
    }
  }

  /**
   * Prepare Lit Action parameters from rule and context
   */
  private prepareLitActionParameters(
    rule: AirdropRule,
    context: RuleExecutionContext
  ): Record<string, any> {
    const baseParams = { ...rule.litActionParameters };

    // Add context-specific parameters
    if (context.airdropOpportunity) {
      baseParams.airdropOpportunity = context.airdropOpportunity;
    }

    if (context.marketData) {
      baseParams.marketData = context.marketData;
    }

    if (context.timeData) {
      baseParams.timeData = context.timeData;
    }

    // Add rule configuration
    baseParams.ruleConfig = {
      action: rule.action,
      amount: rule.amount,
      chain: rule.chain,
      condition: rule.condition,
    };

    return baseParams;
  }

  /**
   * Start monitoring for rule triggers
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.log("⚠️ Monitoring already started");
      return;
    }

    this.isMonitoring = true;
    console.log("🔄 Starting rule monitoring...");

    this.monitoringInterval = setInterval(async () => {
      await this.checkAndExecuteRules();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log("⏹️ Rule monitoring stopped");
  }

  /**
   * Check and execute rules
   */
  private async checkAndExecuteRules(): Promise<void> {
    const activeRules = this.getActiveRules();

    for (const rule of activeRules) {
      try {
        // Create context based on rule trigger
        const context = await this.createExecutionContext(rule);

        // Check if rule should execute
        if (this.shouldExecuteRule(rule, context)) {
          await this.executeRule(rule.id, context);
        }
      } catch (error) {
        console.error(`❌ Error checking rule ${rule.name}:`, error);
      }
    }
  }

  /**
   * Create execution context for a rule
   */
  private async createExecutionContext(
    rule: AirdropRule
  ): Promise<RuleExecutionContext> {
    const context: RuleExecutionContext = {};

    // Add time data
    const now = new Date();
    context.timeData = {
      hour: now.getHours(),
      day: now.getDate(),
      week: Math.floor(now.getDate() / 7),
    };

    // Add market data (simplified)
    context.marketData = {
      price: "2000", // ETH price
      volume: "1000000",
      change24h: "2.5",
    };

    return context;
  }

  /**
   * Check if rule should execute
   */
  private shouldExecuteRule(
    rule: AirdropRule,
    context: RuleExecutionContext
  ): boolean {
    // Check if rule was executed recently (prevent spam)
    if (rule.lastExecuted) {
      const lastExecuted = new Date(rule.lastExecuted);
      const now = new Date();
      const timeDiff = now.getTime() - lastExecuted.getTime();

      // Don't execute if executed within last hour
      if (timeDiff < 60 * 60 * 1000) {
        return false;
      }
    }

    return this.checkRuleConditions(rule, context);
  }

  /**
   * Get execution history for a rule
   */
  getRuleExecutionHistory(ruleId: string): LitActionExecutionResult[] {
    return this.executionHistory.get(ruleId) || [];
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): {
    isMonitoring: boolean;
    activeRulesCount: number;
    totalExecutions: number;
    successRate: number;
  } {
    const activeRules = this.getActiveRules();
    const totalExecutions = Array.from(this.executionHistory.values()).flat()
      .length;

    const successfulExecutions = Array.from(this.executionHistory.values())
      .flat()
      .filter((exec) => exec.success).length;

    const successRate =
      totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    return {
      isMonitoring: this.isMonitoring,
      activeRulesCount: activeRules.length,
      totalExecutions,
      successRate,
    };
  }

  /**
   * Get rule statistics
   */
  getRuleStats(): {
    totalRules: number;
    activeRules: number;
    totalExecutions: number;
    averageExecutionsPerRule: number;
    mostExecutedRule: string;
  } {
    const allRules = this.getAllRules();
    const activeRules = this.getActiveRules();
    const totalExecutions = allRules.reduce(
      (sum, rule) => sum + rule.executions,
      0
    );
    const averageExecutionsPerRule =
      allRules.length > 0 ? totalExecutions / allRules.length : 0;

    const mostExecutedRule = allRules.reduce(
      (max, rule) => (rule.executions > max.executions ? rule : max),
      allRules[0] || { name: "None", executions: 0 }
    );

    return {
      totalRules: allRules.length,
      activeRules: activeRules.length,
      totalExecutions,
      averageExecutionsPerRule,
      mostExecutedRule: mostExecutedRule.name,
    };
  }
}

// Export singleton instance
export const rulesEngine = new RulesEngine();

// Export convenience functions
export const addRule = (rule: Omit<AirdropRule, "id" | "executions">) =>
  rulesEngine.addRule(rule);
export const getAllRules = () => rulesEngine.getAllRules();
export const getActiveRules = () => rulesEngine.getActiveRules();
export const getRule = (ruleId: string) => rulesEngine.getRule(ruleId);
export const updateRule = (ruleId: string, updates: Partial<AirdropRule>) =>
  rulesEngine.updateRule(ruleId, updates);
export const deleteRule = (ruleId: string) => rulesEngine.deleteRule(ruleId);
export const executeRule = (
  ruleId: string,
  context: RuleExecutionContext,
  pkpTokenId?: string
) => rulesEngine.executeRule(ruleId, context, pkpTokenId);
export const startRuleMonitoring = (intervalMs?: number) =>
  rulesEngine.startMonitoring(intervalMs);
export const stopRuleMonitoring = () => rulesEngine.stopMonitoring();
export const getRuleExecutionHistory = (ruleId: string) =>
  rulesEngine.getRuleExecutionHistory(ruleId);
export const getRuleMonitoringStatus = () => rulesEngine.getMonitoringStatus();
export const getRuleStats = () => rulesEngine.getRuleStats();
