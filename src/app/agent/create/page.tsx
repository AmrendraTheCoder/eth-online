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
import {
  Bot,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateAgent() {
  const [isCreating, setIsCreating] = useState(false);
  const [agentCreated, setAgentCreated] = useState(false);
  const [agentData, setAgentData] = useState({
    name: "",
    description: "",
    initialFunds: "",
    maxGasPrice: "",
    preferredChains: [] as string[],
  });

  const chains = [
    { id: "ethereum", name: "Ethereum", icon: "Ξ" },
    { id: "polygon", name: "Polygon", icon: "⬟" },
    { id: "arbitrum", name: "Arbitrum", icon: "◉" },
    { id: "optimism", name: "Optimism", icon: "◉" },
    { id: "bsc", name: "BSC", icon: "◉" },
  ];

  const handleCreateAgent = async () => {
    setIsCreating(true);

    try {
      // Import the useLitProtocol hook
      const { createPKPWallet } = await import("@/hooks/useLitProtocol");
      
      // Create PKP wallet using real LIT Protocol
      const pkpWallet = await createPKPWallet(agentData.name, agentData.initialFunds);
      
      console.log("✅ PKP wallet created:", pkpWallet);
      
      setAgentCreated(true);
    } catch (error) {
      console.error("❌ Failed to create PKP wallet:", error);
      // Handle error - you might want to show an error message to the user
      alert(`Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (agentCreated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Agent Created Successfully!
              </CardTitle>
              <CardDescription className="text-green-600">
                Your DropPilot agent is ready to start farming airdrops
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Agent Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{agentData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 text-green-600 font-medium">
                      Active
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Wallet Address:</span>
                    <span className="ml-2 font-mono text-xs">
                      {agentData.name} PKP Wallet
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Initial Funds:</span>
                    <span className="ml-2 font-medium">
                      {agentData.initialFunds} ETH
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">PKP Status:</span>
                    <span className="ml-2 text-green-600 font-medium">
                      Ready for Automation
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Security:</span>
                    <span className="ml-2 text-blue-600 font-medium">
                      Lit Protocol TEE
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1" size="lg">
                  <Bot className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Set Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your DropPilot Agent
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create a separate PKP wallet that will work 24/7 to farm airdrops
            for you. Your main wallet stays safe while your agent does the work.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Agent Configuration
            </CardTitle>
            <CardDescription>
              Configure your agent's basic settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  placeholder="My Airdrop Agent"
                  value={agentData.name}
                  onChange={(e) =>
                    setAgentData({ ...agentData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funds">Initial Funds (ETH)</Label>
                <Input
                  id="funds"
                  type="number"
                  placeholder="0.1"
                  value={agentData.initialFunds}
                  onChange={(e) =>
                    setAgentData({ ...agentData, initialFunds: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what this agent will do..."
                value={agentData.description}
                onChange={(e) =>
                  setAgentData({ ...agentData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Chains</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {chains.map((chain) => (
                  <div
                    key={chain.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      agentData.preferredChains.includes(chain.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      const newChains = agentData.preferredChains.includes(
                        chain.id
                      )
                        ? agentData.preferredChains.filter(
                            (c) => c !== chain.id
                          )
                        : [...agentData.preferredChains, chain.id];
                      setAgentData({
                        ...agentData,
                        preferredChains: newChains,
                      });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{chain.icon}</span>
                      <span className="text-sm font-medium">{chain.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGas">Max Gas Price (Gwei)</Label>
              <Input
                id="maxGas"
                type="number"
                placeholder="50"
                value={agentData.maxGasPrice}
                onChange={(e) =>
                  setAgentData({ ...agentData, maxGasPrice: e.target.value })
                }
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your agent will be created using Lit Protocol PKP technology.
                This ensures your main wallet stays secure while the agent works
                independently.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCreateAgent}
              disabled={
                isCreating || !agentData.name || !agentData.initialFunds
              }
              className="w-full"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Agent...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5 mr-2" />
                  Create Agent
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
