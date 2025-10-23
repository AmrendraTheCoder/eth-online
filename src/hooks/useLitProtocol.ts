"use client";

import { useState, useEffect } from "react";
import { getLitConnectionStatus } from "../lib/lit-client";
import { isSessionValid, getCurrentSessionSigs } from "../lib/lit-auth";
import {
  createPKPWallet as createPKPWalletService,
  getPKPWallet,
  getAllPKPWallets,
  getPKPWalletBalance,
  getPKPWalletStats,
} from "../lib/pkp-wallet";
import {
  executeLitAction as executeLitActionService,
  getAllLitActionTemplates,
  getLitActionExecutionHistory,
  getLitActionExecutionStats,
} from "../lib/lit-actions-executor";
import {
  startLitMonitoring,
  stopLitMonitoring,
  getActiveOpportunities,
  getMonitoringStats,
} from "../lib/airdrop-lit-monitor";

interface PKPWallet {
  tokenId: string;
  publicKey: string;
  address: string;
  status: "creating" | "ready" | "error";
  createdAt: number;
  funded: boolean;
  balance?: string;
}

interface LitAction {
  id: string;
  name: string;
  code: string;
  status: "active" | "paused" | "error";
  lastExecution?: string;
  executions: number;
}

export function useLitProtocol() {
  const [pkpWallet, setPkpWallet] = useState<PKPWallet | null>(null);
  const [litActions, setLitActions] = useState<LitAction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  // Initialize Lit Protocol connection
  useEffect(() => {
    const initializeLit = async () => {
      try {
        console.log("🔄 Initializing Lit Protocol...");

        // Check LIT connection status
        const status = getLitConnectionStatus();
        setConnectionStatus(status);
        setIsConnected(status.connected);

        if (status.connected) {
          console.log("✅ Lit Protocol connected");

          // Load existing PKP wallets
          await loadPKPWallets();

          // Load Lit Action templates
          await loadLitActionTemplates();
        } else {
          console.log("⚠️ Lit Protocol not connected");
        }
      } catch (error) {
        console.error("Failed to initialize Lit Protocol:", error);
        setIsConnected(false);
      }
    };

    initializeLit();
  }, []);

  // Load existing PKP wallets
  const loadPKPWallets = async () => {
    try {
      const wallets = getAllPKPWallets();
      if (wallets.length > 0) {
        // Use the first wallet as the primary one
        const primaryWallet = wallets[0];
        setPkpWallet({
          tokenId: primaryWallet.tokenId,
          publicKey: primaryWallet.publicKey,
          address: primaryWallet.address,
          status: primaryWallet.status,
          createdAt: primaryWallet.createdAt,
          funded: primaryWallet.funded,
          balance: primaryWallet.balance,
        });
      }
    } catch (error) {
      console.error("Failed to load PKP wallets:", error);
    }
  };

  // Load Lit Action templates
  const loadLitActionTemplates = async () => {
    try {
      const templates = getAllLitActionTemplates();
      const actions: LitAction[] = templates.map((template) => ({
        id: template.id,
        name: template.name,
        code: template.code,
        status: "active" as const,
        executions: 0,
      }));
      setLitActions(actions);
    } catch (error) {
      console.error("Failed to load Lit Action templates:", error);
    }
  };

  // Create a new PKP wallet
  const createPKPWallet = async (name: string, initialFunds: string) => {
    setIsLoading(true);

    try {
      console.log("🔄 Creating PKP wallet...");

      // Check session validity
      if (!isSessionValid()) {
        throw new Error("No valid LIT session. Please authenticate first.");
      }

      // Create PKP wallet using real LIT SDK
      const result = await createPKPWalletService(name, initialFunds);

      const newWallet: PKPWallet = {
        tokenId: result.pkp.tokenId,
        publicKey: result.pkp.publicKey,
        address: result.pkp.address,
        status: result.pkp.status,
        createdAt: result.pkp.createdAt,
        funded: result.pkp.funded,
        balance: result.pkp.balance,
      };

      setPkpWallet(newWallet);
      console.log("✅ PKP wallet created:", newWallet.address);

      return newWallet;
    } catch (error) {
      console.error("Failed to create PKP wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new Lit Action
  const createLitAction = async (name: string, code: string) => {
    try {
      console.log("🔄 Creating Lit Action...");

      // Check session validity
      if (!isSessionValid()) {
        throw new Error("No valid LIT session. Please authenticate first.");
      }

      // For now, we'll add it to the local state
      // In a real implementation, you might want to store it in a database
      const newAction: LitAction = {
        id: `action_${Date.now()}`,
        name,
        code,
        status: "active",
        executions: 0,
      };

      setLitActions((prev) => [...prev, newAction]);
      console.log("✅ Lit Action created:", newAction.name);

      return newAction;
    } catch (error) {
      console.error("Failed to create Lit Action:", error);
      throw error;
    }
  };

  // Execute a Lit Action
  const executeLitAction = async (actionId: string, params: any) => {
    try {
      console.log("🔄 Executing Lit Action...");

      // Check session validity
      if (!isSessionValid()) {
        throw new Error("No valid LIT session. Please authenticate first.");
      }

      // Find the action
      const action = litActions.find((a) => a.id === actionId);
      if (!action) {
        throw new Error("Lit Action not found");
      }

      // Execute using the Lit Action executor
      const result = await executeLitActionService(actionId, params);

      // Update action execution count
      setLitActions((prev) =>
        prev.map((a) =>
          a.id === actionId
            ? {
                ...a,
                executions: a.executions + 1,
                lastExecution: new Date().toISOString(),
              }
            : a
        )
      );

      console.log("✅ Lit Action executed:", result);

      return {
        success: result.success,
        txHash: result.data?.txHash,
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      console.error("Failed to execute Lit Action:", error);
      throw error;
    }
  };

  // Monitor airdrop opportunities
  const monitorAirdrops = async () => {
    try {
      console.log("🔄 Monitoring airdrop opportunities...");

      // Start Lit-powered monitoring
      await startLitMonitoring();

      // Get active opportunities
      const opportunities = getActiveOpportunities();

      if (opportunities.length > 0) {
        // Return the first active opportunity
        const opportunity = opportunities[0];
        return {
          id: opportunity.id,
          name: opportunity.name,
          chain: opportunity.chain,
          requirements: opportunity.requirements,
          estimatedValue: opportunity.estimatedValue,
          deadline: opportunity.deadline,
        };
      }

      // If no opportunities found, return a default one
      return {
        id: `airdrop_${Date.now()}`,
        name: "No Active Airdrops",
        chain: "ethereum",
        requirements: ["Check back later"],
        estimatedValue: "$0",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      console.error("Failed to monitor airdrops:", error);
      throw error;
    }
  };

  // Get agent performance metrics
  const getAgentMetrics = () => {
    try {
      // Get real metrics from Lit Action execution stats
      const executionStats = getLitActionExecutionStats();
      const monitoringStats = getMonitoringStats();
      const pkpStats = getPKPWalletStats();

      return {
        totalExecutions: executionStats.total,
        activeActions: litActions.filter((action) => action.status === "active")
          .length,
        successRate: executionStats.successRate,
        totalProfit: monitoringStats.totalCost, // Using total cost as proxy for profit
        uptime: `${executionStats.successRate.toFixed(1)}%`,
        pkpWallets: pkpStats.total,
        fundedWallets: pkpStats.funded,
        totalBalance: pkpStats.totalBalance,
      };
    } catch (error) {
      console.error("Failed to get agent metrics:", error);
      return {
        totalExecutions: 0,
        activeActions: 0,
        successRate: 0,
        totalProfit: "$0.00",
        uptime: "0%",
        pkpWallets: 0,
        fundedWallets: 0,
        totalBalance: "0",
      };
    }
  };

  // Get PKP wallet balance
  const getPKPWalletBalance = async (chainId?: number) => {
    if (!pkpWallet) return "0";

    try {
      const balance = await getPKPWalletBalance(pkpWallet.tokenId, chainId);
      return balance;
    } catch (error) {
      console.error("Failed to get PKP wallet balance:", error);
      return "0";
    }
  };

  // Get Lit Action execution history
  const getLitActionExecutionHistory = () => {
    try {
      return getLitActionExecutionHistory();
    } catch (error) {
      console.error("Failed to get Lit Action execution history:", error);
      return [];
    }
  };

  // Stop monitoring
  const stopMonitoring = () => {
    try {
      stopLitMonitoring();
      console.log("⏹️ Airdrop monitoring stopped");
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
    }
  };

  return {
    pkpWallet,
    litActions,
    isConnected,
    isLoading,
    connectionStatus,
    createPKPWallet,
    createLitAction,
    executeLitAction,
    monitorAirdrops,
    getAgentMetrics,
    getPKPWalletBalance,
    getLitActionExecutionHistory,
    stopMonitoring,
  };
}
