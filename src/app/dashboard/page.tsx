"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Activity,
  Settings,
  TrendingUp,
  Zap,
  CheckCircle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLitProtocol } from "@/hooks/useLitProtocol";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const {
    pkpWallet,
    litActions,
    isConnected: isLitConnected,
    connectionStatus,
    getAgentMetrics,
    getPKPWalletBalance,
    getLitActionExecutionHistory,
  } = useLitProtocol();

  const [agentData, setAgentData] = useState({
    name: "My Airdrop Agent",
    walletAddress: "0x742d...8f3a",
    status: "Active" as const,
    balance: "0.15 ETH",
    totalProfit: "$127.50",
    uptime: "99.8%",
    rulesActive: 3,
    totalExecutions: 47,
    lastActivity: "2 minutes ago",
  });

  const [realMetrics, setRealMetrics] = useState<{
    totalExecutions: number;
    activeActions: number;
    successRate: number;
    totalProfit: string;
    uptime: string;
    pkpWallets: number;
    fundedWallets: number;
    totalBalance: string;
  } | null>(null);
  const [executionHistory, setExecutionHistory] = useState<
    {
      id: string;
      success: boolean;
      timestamp: number;
      txHash?: string;
    }[]
  >([]);

  // Load real data on component mount
  useEffect(() => {
    const loadRealData = async () => {
      try {
        // Get real agent metrics
        const metrics = getAgentMetrics();
        setRealMetrics(metrics);

        // Get execution history
        const history = getLitActionExecutionHistory();
        setExecutionHistory(history);

        // Update agent data with real PKP wallet info
        if (pkpWallet) {
          const balance = await getPKPWalletBalance();
          setAgentData((prev) => ({
            ...prev,
            walletAddress: pkpWallet.address,
            balance: `${balance} ETH`,
            totalProfit: metrics.totalProfit,
            uptime: metrics.uptime,
            rulesActive: metrics.activeActions,
            totalExecutions: metrics.totalExecutions,
          }));
        }
      } catch (error) {
        console.error("Failed to load real data:", error);
      }
    };

    if (isLitConnected) {
      loadRealData();
    }
  }, [
    isLitConnected,
    pkpWallet,
    getAgentMetrics,
    getPKPWalletBalance,
    getLitActionExecutionHistory,
  ]);

  const stats = [
    {
      title: "Total Profit",
      value: realMetrics?.totalProfit || "$0.00",
      change: "+12.3%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Active Rules",
      value: realMetrics?.activeActions?.toString() || "0",
      change: "+1 this week",
      icon: Settings,
      color: "text-blue-600",
    },
    {
      title: "Executions",
      value: realMetrics?.totalExecutions?.toString() || "0",
      change: "+8 today",
      icon: Zap,
      color: "text-purple-600",
    },
    {
      title: "PKP Wallets",
      value: realMetrics?.pkpWallets?.toString() || "0",
      change: `+${realMetrics?.fundedWallets || 0} funded`,
      icon: Shield,
      color: "text-orange-600",
    },
  ];

  const recentActivities =
    executionHistory.length > 0
      ? executionHistory.slice(0, 3).map((exec, index) => ({
          id: exec.id || `exec_${index}`,
          type: "lit_action_execution",
          title: `Lit Action Executed`,
          description: exec.success
            ? "Lit Action completed successfully"
            : "Lit Action failed",
          timestamp: new Date(exec.timestamp).toLocaleString(),
          status: exec.success ? "success" : "failed",
          profit: exec.success ? "+$0.00" : undefined,
          txHash: exec.txHash,
        }))
      : [
          {
            id: "1",
            type: "lit_action_execution",
            title: "Lit Action Ready",
            description:
              "Lit Protocol integration active and ready for automation",
            timestamp: "Just now",
            status: "success",
            profit: "+$0.00",
          },
        ];

  const rules = litActions.map((action) => ({
    id: action.id,
    name: action.name,
    status: action.status,
    executions: action.executions,
    lastExecuted: action.lastExecution
      ? new Date(action.lastExecution).toLocaleString()
      : "Never",
    profit: action.executions > 0 ? "+$0.00" : "$0.00",
  }));

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            Connect your wallet to access the DropPilot dashboard
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!isLitConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            Lit Protocol Not Connected
          </h1>
          <p className="text-gray-600 mb-6">
            Lit Protocol is required for autonomous agent operations
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              Please ensure Lit Protocol is properly configured and connected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">DropPilot Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your automated airdrop farming agent and track
                performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <Shield className="w-3 h-3 mr-1" />
                Lit Protocol Active
              </Badge>
              {connectionStatus && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <LinkIcon className="w-3 h-3 mr-1" />
                  {connectionStatus.network}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Agent Status Card */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{agentData.name}</CardTitle>
                  <CardDescription>
                    Agent Wallet: {agentData.walletAddress} • Balance:{" "}
                    {agentData.balance}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {agentData.status}
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {agentData.totalProfit}
                </div>
                <div className="text-sm text-gray-600">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {agentData.uptime}
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {agentData.rulesActive}
                </div>
                <div className="text-sm text-gray-600">Active Rules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {agentData.totalExecutions}
                </div>
                <div className="text-sm text-gray-600">Executions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <Bot className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Settings className="w-4 h-4 mr-2" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {activity.timestamp}
                          </span>
                          {activity.profit && (
                            <span className="text-xs text-green-600 font-medium">
                              {activity.profit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/activity">
                    <Button variant="outline" className="w-full">
                      View All Activities
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/agent/create">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Agent
                    </Button>
                  </Link>
                  <Link href="/rules">
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Rules
                    </Button>
                  </Link>
                  <Link href="/activity">
                    <Button className="w-full justify-start" variant="outline">
                      <Activity className="w-4 h-4 mr-2" />
                      View Activity Feed
                    </Button>
                  </Link>
                  <Button className="w-full justify-start" variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart Agent
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Automation Rules</h3>
              <Link href="/rules">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            rule.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div>
                          <h4 className="font-semibold">{rule.name}</h4>
                          <p className="text-sm text-gray-600">
                            {rule.executions} executions • Last:{" "}
                            {rule.lastExecuted}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">
                          {rule.profit}
                        </span>
                        <Button variant="ghost" size="sm">
                          {rule.status === "active" ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Activity Feed
              </h3>
              <p className="text-gray-600 mb-6">
                View detailed activity logs and performance metrics
              </p>
              <Link href="/activity">
                <Button>
                  <Activity className="w-4 h-4 mr-2" />
                  View Full Activity Feed
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
