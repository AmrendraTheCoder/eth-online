"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";
import {
  Bot,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Settings,
  Target,
  Activity,
  Network,
  Zap,
  Coins,
  TrendingUp,
  Users,
  Building2,
  BookOpen,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold">
            🤖 Live: 5,000+ Agents • 24/7 Airdrop Farming • $0 Setup Fees
          </span>
          <Link
            href="/dashboard"
            className="ml-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium hover:bg-white/30 transition-all duration-300"
          >
            Start Farming →
          </Link>
        </div>
      </div>

      <nav className="sticky top-0 z-[100] w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">NIMBUS</span>
              </Link>
            </div>

            {/* Center: Navigation */}
            <div className="hidden lg:flex items-center space-x-12">
              <div className="hidden lg:flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                    >
                      <Bot className="w-4 h-4" />
                      Features
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 bg-white border border-gray-200 shadow-xl rounded-xl"
                  >
                    <div className="p-4">
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Agent Features
                      </div>
                      <div className="grid gap-3">
                        <DropdownMenuItem asChild>
                          <Link
                            href="#encryption"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                              <Bot className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                Agent Wallet Creation
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Create separate PKP wallets for farming
                              </div>
                            </div>
                            <div className="text-xs text-purple-600 font-semibold">
                              Secure
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#zkp"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-pink-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                              <Settings className="w-5 h-5 text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                Rules Engine
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Set if-this-then-that automation rules
                              </div>
                            </div>
                            <div className="text-xs text-green-600 font-semibold">
                              Smart
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#nft"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                24/7 Automation
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Lit Protocol-powered agents work around the
                                clock
                              </div>
                            </div>
                            <div className="text-xs text-blue-600 font-semibold">
                              Always On
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem asChild>
                          <Link
                            href="#multi-chain"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Network className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Multi-Chain Support
                            </span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#gas-optimization"
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <Zap className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Gas Optimization
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                    >
                      <Users className="w-4 h-4" />
                      Solutions
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 bg-white border border-gray-200 shadow-xl rounded-xl"
                  >
                    <div className="p-4">
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        Agent Solutions
                      </div>
                      <div className="grid gap-3">
                        <DropdownMenuItem asChild>
                          <Link
                            href="#individuals"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                For Individuals
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Personal airdrop farming agents
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#dapps"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                              <Network className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                For dApps
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Integrate agent automation
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#enterprises"
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-orange-50 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                              <Building2 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                For Enterprises
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Enterprise automation solutions
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-10 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                    >
                      <BookOpen className="w-4 h-4" />
                      Docs
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-72 bg-white border border-gray-200 shadow-xl rounded-xl"
                  >
                    <div className="p-4">
                      <div className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Documentation
                      </div>
                      <div className="grid gap-2">
                        <DropdownMenuItem asChild>
                          <Link
                            href="#getting-started"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                Getting Started
                              </div>
                              <div className="text-xs text-gray-500">
                                Quick setup guide
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="#api"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-all duration-300"
                          >
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Key className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                API Reference
                              </div>
                              <div className="text-xs text-gray-500">
                                Integration docs
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem asChild>
                          <Link
                            href="#support"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            <HelpCircle className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              Support Center
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <Link href="/agent/create">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Create Agent
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/rules">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Rules
                  </Button>
                </Link>
                <Link href="/activity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Activity
                  </Button>
                </Link>
              </div>

              <div className="hidden lg:flex">
                <ConnectButton />
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link
                href="/agent/create"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Agent
              </Link>
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/rules"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rules
              </Link>
              <Link
                href="/activity"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Activity
              </Link>
              <div className="pt-4">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
