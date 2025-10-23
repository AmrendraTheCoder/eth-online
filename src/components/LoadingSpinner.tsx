"use client";

import React from "react";
import { Bot, Zap, Activity } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  message = "Loading your DropPilot agent...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
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

      <div className="relative z-10 text-center">
        {/* Animated Bot Icon */}
        <div className="relative mb-8">
          <div className={`${sizeClasses[size]} mx-auto relative`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Bot className="w-1/2 h-1/2 text-white animate-bounce" />
            </div>
          </div>

          {/* Orbiting Icons */}
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Activity className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-2">
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>

          {/* Progress Bar */}
          <div className="w-64 mx-auto">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
