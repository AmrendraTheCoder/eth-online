"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Plus,
  Trash2,
  Play,
  Pause,
  Edit,
  Bot,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Rule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  amount: string;
  chain: string;
  enabled: boolean;
  lastExecuted?: string;
  executions: number;
}

export default function RulesEngine() {
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "1",
      name: "ZkSync Airdrop Hunter",
      trigger: "new_airdrop",
      condition: "chain = 'zksync' AND amount > 1000000",
      action: "bridge_and_swap",
      amount: "0.05",
      chain: "zksync",
      enabled: true,
      lastExecuted: "2 hours ago",
      executions: 3,
    },
    {
      id: "2",
      name: "LayerZero Bridge Bot",
      trigger: "new_airdrop",
      condition: "chain = 'arbitrum' AND project = 'layerzero'",
      action: "bridge",
      amount: "0.1",
      chain: "arbitrum",
      enabled: true,
      lastExecuted: "1 day ago",
      executions: 1,
    },
    {
      id: "3",
      name: "Starknet DEX Trader",
      trigger: "new_airdrop",
      condition: "chain = 'starknet' AND dex_volume > 1000",
      action: "swap",
      amount: "0.02",
      chain: "starknet",
      enabled: false,
      executions: 0,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    trigger: "",
    condition: "",
    action: "",
    amount: "",
    chain: "",
    enabled: true,
  });

  const triggers = [
    { value: "new_airdrop", label: "New Airdrop Announced" },
    { value: "price_threshold", label: "Price Threshold Reached" },
    { value: "volume_spike", label: "Volume Spike Detected" },
    { value: "time_based", label: "Time-Based Trigger" },
  ];

  const actions = [
    { value: "bridge", label: "Bridge Funds" },
    { value: "swap", label: "Swap Tokens" },
    { value: "stake", label: "Stake Tokens" },
    { value: "bridge_and_swap", label: "Bridge & Swap" },
    { value: "interact_contract", label: "Interact with Contract" },
  ];

  const chains = [
    { value: "ethereum", label: "Ethereum" },
    { value: "polygon", label: "Polygon" },
    { value: "arbitrum", label: "Arbitrum" },
    { value: "optimism", label: "Optimism" },
    { value: "bsc", label: "BSC" },
    { value: "zksync", label: "ZkSync" },
    { value: "starknet", label: "Starknet" },
  ];

  const handleCreateRule = () => {
    const rule: Rule = {
      id: Date.now().toString(),
      ...newRule,
      executions: 0,
    };
    setRules([...rules, rule]);
    setNewRule({
      name: "",
      trigger: "",
      condition: "",
      action: "",
      amount: "",
      chain: "",
      enabled: true,
    });
    setShowCreateForm(false);
  };

  const toggleRule = (id: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rules Engine
            </h1>
            <p className="text-gray-600">
              Configure your agent's automation rules. Set triggers and actions
              for automatic airdrop farming.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Rule
          </Button>
        </div>

        {/* Create Rule Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Create New Rule
              </CardTitle>
              <CardDescription>
                Define when and how your agent should act automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ruleName">Rule Name</Label>
                  <Input
                    id="ruleName"
                    placeholder="My Airdrop Rule"
                    value={newRule.name}
                    onChange={(e) =>
                      setNewRule({ ...newRule, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger</Label>
                  <Select
                    value={newRule.trigger}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, trigger: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggers.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Textarea
                  id="condition"
                  placeholder="chain = 'zksync' AND amount > 1000000"
                  value={newRule.condition}
                  onChange={(e) =>
                    setNewRule({ ...newRule, condition: e.target.value })
                  }
                />
                <p className="text-sm text-gray-500">
                  Define the conditions that must be met for this rule to
                  execute
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ETH)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.05"
                    value={newRule.amount}
                    onChange={(e) =>
                      setNewRule({ ...newRule, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chain">Target Chain</Label>
                  <Select
                    value={newRule.chain}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, chain: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {chains.map((chain) => (
                        <SelectItem key={chain.value} value={chain.value}>
                          {chain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={newRule.enabled}
                    onCheckedChange={(checked) =>
                      setNewRule({ ...newRule, enabled: checked })
                    }
                  />
                  <Label htmlFor="enabled">Enable this rule</Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCreateRule}
                  disabled={
                    !newRule.name || !newRule.trigger || !newRule.action
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rules List */}
        <div className="space-y-6">
          {rules.map((rule) => (
            <Card
              key={rule.id}
              className={rule.enabled ? "border-green-200" : "border-gray-200"}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        rule.enabled ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge variant={rule.enabled ? "default" : "secondary"}>
                      {rule.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRule(rule.id)}
                    >
                      {rule.enabled ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label className="text-sm text-gray-500">Trigger</Label>
                    <p className="font-medium">
                      {triggers.find((t) => t.value === rule.trigger)?.label}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Action</Label>
                    <p className="font-medium">
                      {actions.find((a) => a.value === rule.action)?.label}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Amount</Label>
                    <p className="font-medium">{rule.amount} ETH</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Chain</Label>
                    <p className="font-medium">
                      {chains.find((c) => c.value === rule.chain)?.label}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <Label className="text-sm text-gray-500">Condition</Label>
                  <p className="font-mono text-sm">{rule.condition}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {rule.executions} executions
                    </span>
                    {rule.lastExecuted && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Last: {rule.lastExecuted}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rules.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Rules Created
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first automation rule to start farming airdrops
                automatically.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
