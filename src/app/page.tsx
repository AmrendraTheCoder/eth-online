"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Bot,
  Zap,
  Target,
  ArrowRight,
  Network,
  Sparkles,
  Settings,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/footer";

// Custom hook for scroll-based animations
function useScrollAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "50px 0px -50px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible] as const;
}

// Animated Counter Component
function AnimatedCounter({
  targetValue,
  duration = 1500,
  prefix = "",
  suffix = "",
  className = "",
}: {
  targetValue: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [currentValue, setCurrentValue] = useState(0);
  const [ref, isVisible] = useScrollAnimation(0.2);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startValue = 0;

    const updateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue + (targetValue - startValue) * easeOutCubic;
      setCurrentValue(newValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(updateValue);
      }
    };

    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(updateValue);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration, isVisible]);

  const formatNumber = (num: number) => {
    return Math.floor(num).toLocaleString();
  };

  return (
    <div ref={ref}>
      <span className={className}>
        {prefix}
        {formatNumber(currentValue)}
        {suffix}
      </span>
    </div>
  );
}

// Animated Text Component
function AnimatedText({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <div ref={ref} className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-600 ease-out will-change-transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{
            transitionDelay: `${delay + index * 40}ms`,
            backfaceVisibility: "hidden",
          }}
        >
          {word}
          {index < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuresRef, featuresVisible] = useScrollAnimation(0.1);
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation(0.1);
  const [statsRef, statsVisible] = useScrollAnimation(0.1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Bot,
      title: "Agent Wallet Creation",
      description:
        "Create separate PKP wallets that work independently. Your main wallet stays safe while agents do the farming.",
      color: "purple",
    },
    {
      icon: Settings,
      title: "Rules Engine",
      description:
        "Set 'if-this-then-that' rules for automatic airdrop participation. When ZkSync announces an airdrop, bridge $20 automatically.",
      color: "blue",
    },
    {
      icon: Activity,
      title: "24/7 Automation",
      description:
        "Lit Protocol-powered agents work around the clock, monitoring for new airdrops and executing your rules automatically.",
      color: "green",
    },
    {
      icon: Target,
      title: "Smart Targeting",
      description:
        "AI-powered airdrop detection and opportunity analysis. Never miss profitable farming opportunities again.",
      color: "pink",
    },
    {
      icon: Network,
      title: "Multi-Chain Support",
      description:
        "Farm airdrops across Ethereum, Polygon, Arbitrum, Optimism, and BSC. One agent, multiple chains.",
      color: "orange",
    },
    {
      icon: Zap,
      title: "Gas Optimization",
      description:
        "Intelligent transaction batching and fee management. Maximize profits by minimizing gas costs.",
      color: "cyan",
    },
  ];

  const howItWorksSteps = [
    {
      icon: Bot,
      title: "Create Agent",
      description:
        "Create your Agent Wallet using Lit Protocol PKP. This separate wallet will do all the farming work.",
    },
    {
      icon: Settings,
      title: "Set Rules",
      description:
        "Configure your 'if-this-then-that' rules. Define triggers, amounts, and actions for automatic execution.",
    },
    {
      icon: Zap,
      title: "Fund & Deploy",
      description:
        "Load your Agent Wallet with funds and deploy your automation rules to start farming.",
    },
    {
      icon: Activity,
      title: "Monitor & Profit",
      description:
        "Watch your agent work 24/7, farming airdrops and building your crypto portfolio automatically.",
    },
  ];

  const stats = [
    { value: 24, suffix: "/7", label: "Agent Uptime" },
    { value: 0, prefix: "$", label: "Setup Fees" },
    { value: 5000, suffix: "+", label: "Agents Active" },
    { value: 150000, suffix: "+", label: "Airdrops Farmed" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 overflow-hidden">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 transform rotate-45 animate-pulse opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl"></div>
          </div>

          <div
            className="absolute top-40 right-32 w-24 h-24 transform -rotate-12 animate-pulse opacity-30"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl"></div>
          </div>

          <div
            className="absolute bottom-32 left-32 w-40 h-40 transform rotate-12 animate-pulse opacity-15"
            style={{ animationDelay: "2s" }}
          >
            <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl shadow-2xl"></div>
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Announcement Badge */}
            <div
              className={`inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-blue-200 rounded-full text-sm font-medium mb-8 border border-white/20 transition-all duration-1000 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95"
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Introducing: Automated Airdrop Farming
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>

            {/* Main Headline */}
            <AnimatedText
            text="Never Miss an Airdrop Again"
            className={`text-5xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight transition-all duration-1200 ease-out ${
              isLoaded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
              }`}
              delay={200}
/>

            {/* Subtitle */}
            <p
              className={`text-xl lg:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              NIMBUS (DropPilot) is the{" "}
              <span className="text-blue-400 font-semibold">
                automated airdrop farming platform
              </span>
              . Your agent works 24/7 to farm crypto airdrops while you sleep.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-95"
              }`}
              style={{ transitionDelay: "800ms" }}
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group relative inline-flex items-center px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold text-lg rounded-2xl hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg border border-purple-400/30"
                >
                  <Bot className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Create Your Agent
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>

              <Link href="/activity">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                >
                  <Activity className="w-6 h-6 mr-3" />
                  View Activity
                </Button>
              </Link>
            </div>

            {/* Three Main Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div
                className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer text-left ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "1000ms" }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/30">
                  <Bot className="w-7 h-7 text-white group-hover:animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                  Create Agent
                </h3>
                <p className="text-gray-300 text-left group-hover:text-white transition-colors">
                  Create your Agent Wallet using Lit Protocol PKP. This separate
                  wallet will do all the farming work.
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                </div>
              </div>

              <div
                className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer text-left ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "1200ms" }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/30">
                  <Settings className="w-7 h-7 text-white group-hover:animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                  Set Rules
                </h3>
                <p className="text-gray-300 text-left group-hover:text-white transition-colors">
                  Configure your 'if-this-then-that' rules. Define triggers,
                  amounts, and actions for automatic execution.
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                </div>
              </div>

              <div
                className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer text-left ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "1400ms" }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-green-500/30">
                  <Activity className="w-7 h-7 text-white group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors">
                  Automate
                </h3>
                <p className="text-gray-300 text-left group-hover:text-white transition-colors">
                  Watch your agent work 24/7, farming airdrops and building your
                  crypto portfolio automatically.
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto" ref={statsRef}>
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center transition-all duration-1000 ease-out ${
                    statsVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <AnimatedCounter
                    targetValue={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={2000}
                    className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block mb-2"
                  />
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Unified Flowing Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]"></div>
        
        {/* Animated floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full animate-floating"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full animate-floating" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full animate-floating" style={{animationDelay: '2s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16" ref={featuresRef}>
              <div
                className={`inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-6 py-3 rounded-full text-sm font-medium mb-6 transition-all duration-1000 border border-purple-200/50 backdrop-blur-sm ${
                  featuresVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-8 scale-95"
                }`}
              >
                ✨ Features
              </div>
              <AnimatedText
                text="Why NIMBUS is Different"
                className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent"
                delay={100}
              />
              <p
                className={`text-xl text-gray-700 max-w-3xl mx-auto transition-all duration-1000 leading-relaxed ${
                  featuresVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                Built on Lit Protocol to ensure your agents work 24/7, farming
                airdrops while you sleep
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-purple-200/50 group overflow-hidden relative bg-white/80 backdrop-blur-sm ${
                    featuresVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="group-hover:text-purple-600 transition-colors text-xl">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Seamless gradient transition from features section */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_60%)]"></div>
        
        {/* Enhanced floating elements */}
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full animate-pulse-glow"></div>
        <div className="absolute top-32 right-1/3 w-24 h-24 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full animate-pulse-glow" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-32 left-1/2 w-28 h-28 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full animate-pulse-glow" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
          <div className="inline-block bg-gradient-to-r from-purple-200/80 to-pink-200/80 backdrop-blur-sm text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-purple-300/50 shadow-lg">
            🚀 Get Started Today
          </div>

          <h2 className="text-4xl md:text-6xl font-bold max-w-4xl mx-auto bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Ready to Start Automated Airdrop Farming?
          </h2>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Join thousands of users who are farming airdrops 24/7 with NIMBUS.
            No setup fees, complete automation, and maximum profits guaranteed.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 font-bold text-lg px-10 py-6 rounded-2xl border border-purple-400/30"
              >
                <Bot className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Create Your Agent
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>

            <Link href="/activity">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 font-bold text-lg px-10 py-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Activity className="w-6 h-6 mr-3" />
                View Activity
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Continuation of the flowing gradient theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_10%,rgba(236,72,153,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_90%,rgba(168,85,247,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        
        {/* Coordinated floating elements */}
        <div className="absolute top-16 right-10 w-20 h-20 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full animate-floating"></div>
        <div className="absolute top-48 left-20 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full animate-floating" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-24 right-1/3 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-pink-200/30 rounded-full animate-floating" style={{animationDelay: '4s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16" ref={howItWorksRef}>
              <div
                className={`inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-6 transition-all duration-1000 border border-blue-200/50 backdrop-blur-sm ${
                  howItWorksVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-8 scale-95"
                }`}
              >
                💡 How It Works
              </div>
              <AnimatedText
                text="Simple Steps to Automated Farming"
                className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                delay={100}
              />
              <p
                className={`text-xl text-gray-700 max-w-3xl mx-auto transition-all duration-1000 leading-relaxed font-medium ${
                  howItWorksVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                Set up your automated airdrop farming agent in four simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={index}
                  className={`text-center transition-all duration-1000 group ${
                    howItWorksVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <div className="relative mb-8 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto group-hover:rotate-6 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                      <step.icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-purple-600 transition-colors">{step.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed group-hover:text-gray-700 transition-colors">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
