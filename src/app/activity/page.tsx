"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Bot,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Coins,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface ActivityItem {
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
  chain: string;
  amount?: string;
  txHash?: string;
  ruleName?: string;
  profit?: string;
}

export default function ActivityFeed() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const activities: ActivityItem[] = [
    {
      id: "1",
      timestamp: "2 minutes ago",
      type: "rule_execution",
      status: "success",
      title: "ZkSync Airdrop Rule Executed",
      description:
        "Successfully bridged 0.05 ETH to ZkSync and performed 2 swaps",
      chain: "zksync",
      amount: "0.05 ETH",
      txHash: "0x742d...8f3a",
      ruleName: "ZkSync Airdrop Hunter",
      profit: "+$12.50",
    },
    {
      id: "2",
      timestamp: "15 minutes ago",
      type: "airdrop_detected",
      status: "success",
      title: "New Airdrop Detected",
      description: "LayerZero airdrop opportunity found on Arbitrum",
      chain: "arbitrum",
      ruleName: "LayerZero Bridge Bot",
    },
    {
      id: "3",
      timestamp: "1 hour ago",
      type: "transaction",
      status: "success",
      title: "Token Swap Completed",
      description: "Swapped 0.1 ETH for USDC on Uniswap",
      chain: "ethereum",
      amount: "0.1 ETH",
      txHash: "0x8a3f...2b1c",
      profit: "+$8.30",
    },
    {
      id: "4",
      timestamp: "2 hours ago",
      type: "bridge",
      status: "success",
      title: "Cross-Chain Bridge",
      description: "Bridged 0.2 ETH from Ethereum to Polygon",
      chain: "polygon",
      amount: "0.2 ETH",
      txHash: "0x5c7d...9e2f",
    },
    {
      id: "5",
      timestamp: "3 hours ago",
      type: "rule_execution",
      status: "failed",
      title: "Starknet Rule Failed",
      description: "Failed to execute swap due to insufficient gas",
      chain: "starknet",
      amount: "0.02 ETH",
      ruleName: "Starknet DEX Trader",
    },
    {
      id: "6",
      timestamp: "1 day ago",
      type: "airdrop_detected",
      status: "success",
      title: "Airdrop Opportunity",
      description: "New Starknet airdrop campaign detected",
      chain: "starknet",
      ruleName: "Starknet DEX Trader",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "rule_execution":
        return <Bot className="w-5 h-5" />;
      case "airdrop_detected":
        return <Target className="w-5 h-5" />;
      case "transaction":
        return <Zap className="w-5 h-5" />;
      case "bridge":
        return <ArrowRight className="w-5 h-5" />;
      case "swap":
        return <Coins className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesFilter =
      filter === "all" ||
      activity.type === filter ||
      activity.status === filter;
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    totalExecutions: activities.filter((a) => a.type === "rule_execution")
      .length,
    successfulExecutions: activities.filter(
      (a) => a.type === "rule_execution" && a.status === "success"
    ).length,
    totalProfit: activities.reduce(
      (sum, a) => sum + parseFloat(a.profit?.replace(/[^0-9.-]/g, "") || "0"),
      0
    ),
    airdropsDetected: activities.filter((a) => a.type === "airdrop_detected")
      .length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agent Activity
            </h1>
            <p className="text-gray-600">
              Monitor your agent's performance and track airdrop farming
              activities
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Executions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalExecutions}
                  </p>
                </div>
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalExecutions > 0
                      ? Math.round(
                          (stats.successfulExecutions / stats.totalExecutions) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Profit
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats.totalProfit.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Airdrops Detected
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.airdropsDetected}
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="rule_execution">
                    Rule Executions
                  </SelectItem>
                  <SelectItem value="airdrop_detected">
                    Airdrop Detections
                  </SelectItem>
                  <SelectItem value="transaction">Transactions</SelectItem>
                  <SelectItem value="bridge">Bridges</SelectItem>
                  <SelectItem value="swap">Swaps</SelectItem>
                  <SelectItem value="success">Successful</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card
              key={activity.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {activity.title}
                        </h3>
                        <Badge className={getStatusColor(activity.status)}>
                          {getStatusIcon(activity.status)}
                          <span className="ml-1 capitalize">
                            {activity.status}
                          </span>
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {activity.timestamp}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{activity.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {activity.chain}
                      </span>
                      {activity.amount && (
                        <span className="flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {activity.amount}
                        </span>
                      )}
                      {activity.ruleName && (
                        <span className="flex items-center gap-1">
                          <Bot className="w-4 h-4" />
                          {activity.ruleName}
                        </span>
                      )}
                      {activity.profit && (
                        <span className="text-green-600 font-medium">
                          {activity.profit}
                        </span>
                      )}
                    </div>

                    {activity.txHash && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Transaction:
                        </span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {activity.txHash}
                        </code>
                        <Button variant="ghost" size="sm" className="p-1">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Activities Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Your agent hasn't performed any activities yet. Create some rules to get started."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
