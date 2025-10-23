import { isSessionValid } from "./lit-auth";

/**
 * Security Module for PKP Permissions and Lit Action Safety
 *
 * Implements:
 * - PKP permissions and access control
 * - Lit Action safety measures
 * - Spending limits and restrictions
 * - Emergency pause mechanisms
 * - Audit logging
 */

export interface PKPPermissions {
  tokenId: string;
  allowedAddresses: string[];
  maxSpendPerDay: string;
  maxSpendPerTransaction: string;
  allowedChains: number[];
  allowedActions: string[];
  emergencyPaused: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  maxGasPrice: string;
  maxSlippage: string;
  maxTransactionValue: string;
  allowedTokens: string[];
  blockedTokens: string[];
  timeRestrictions: {
    startHour: number;
    endHour: number;
    daysOfWeek: number[];
  };
  enabled: boolean;
}

export interface SecurityEvent {
  id: string;
  type:
    | "permission_denied"
    | "spending_limit_exceeded"
    | "unauthorized_access"
    | "emergency_pause"
    | "safety_check_failed";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: number;
  pkpTokenId?: string;
  transactionHash?: string;
  resolved: boolean;
}

class SecurityManager {
  private permissions: Map<string, PKPPermissions> = new Map();
  private policies: Map<string, SecurityPolicy> = new Map();
  private events: SecurityEvent[] = [];
  private emergencyPause: boolean = false;

  constructor() {
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default security policies
   */
  private initializeDefaultPolicies(): void {
    // Default security policy
    this.addPolicy({
      name: "Default Security Policy",
      description: "Standard security settings for PKP wallets",
      maxGasPrice: "100", // 100 gwei
      maxSlippage: "2.0", // 2%
      maxTransactionValue: "1.0", // 1 ETH
      allowedTokens: [
        "0x0000000000000000000000000000000000000000", // ETH
        "0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C", // USDC
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
      ],
      blockedTokens: [],
      timeRestrictions: {
        startHour: 0,
        endHour: 23,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // All days
      },
      enabled: true,
    });
  }

  /**
   * Set PKP permissions
   */
  setPKPPermissions(
    tokenId: string,
    permissions: Omit<PKPPermissions, "tokenId" | "createdAt" | "updatedAt">
  ): void {
    const now = Date.now();
    const pkpPermissions: PKPPermissions = {
      tokenId,
      ...permissions,
      createdAt: now,
      updatedAt: now,
    };

    this.permissions.set(tokenId, pkpPermissions);
    console.log(`✅ PKP permissions set for token: ${tokenId}`);
  }

  /**
   * Get PKP permissions
   */
  getPKPPermissions(tokenId: string): PKPPermissions | null {
    return this.permissions.get(tokenId) || null;
  }

  /**
   * Check if address is authorized to use PKP
   */
  isAddressAuthorized(tokenId: string, address: string): boolean {
    const permissions = this.getPKPPermissions(tokenId);
    if (!permissions) return false;

    return permissions.allowedAddresses.includes(address.toLowerCase());
  }

  /**
   * Check if spending is within limits
   */
  checkSpendingLimits(
    tokenId: string,
    amount: string,
    chainId: number
  ): {
    allowed: boolean;
    reason?: string;
  } {
    const permissions = this.getPKPPermissions(tokenId);
    if (!permissions) {
      return { allowed: false, reason: "No permissions set for PKP" };
    }

    // Check if emergency paused
    if (permissions.emergencyPaused || this.emergencyPause) {
      return { allowed: false, reason: "Emergency pause active" };
    }

    // Check allowed chains
    if (!permissions.allowedChains.includes(chainId)) {
      return { allowed: false, reason: `Chain ${chainId} not allowed` };
    }

    // Check transaction amount limit
    const amountNum = parseFloat(amount);
    const maxTransactionNum = parseFloat(permissions.maxSpendPerTransaction);

    if (amountNum > maxTransactionNum) {
      return {
        allowed: false,
        reason: `Transaction amount ${amount} exceeds limit ${permissions.maxSpendPerTransaction}`,
      };
    }

    // Check daily spending limit (simplified - in real implementation, you'd track daily spending)
    const maxDailyNum = parseFloat(permissions.maxSpendPerDay);
    if (amountNum > maxDailyNum) {
      return {
        allowed: false,
        reason: `Transaction amount ${amount} exceeds daily limit ${permissions.maxSpendPerDay}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Add security policy
   */
  addPolicy(policy: Omit<SecurityPolicy, "id">): SecurityPolicy {
    const newPolicy: SecurityPolicy = {
      ...policy,
      id: `policy_${Date.now()}`,
    };

    this.policies.set(newPolicy.id, newPolicy);
    console.log(`✅ Security policy added: ${newPolicy.name}`);
    return newPolicy;
  }

  /**
   * Get security policy
   */
  getPolicy(policyId: string): SecurityPolicy | null {
    return this.policies.get(policyId) || null;
  }

  /**
   * Get all policies
   */
  getAllPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Validate Lit Action parameters against security policies
   */
  validateLitActionParameters(
    actionId: string,
    parameters: Record<string, unknown>,
    policyId: string = "default"
  ): { valid: boolean; errors: string[] } {
    const policy = this.getPolicy(policyId);
    if (!policy || !policy.enabled) {
      return { valid: true, errors: [] }; // No policy restrictions
    }

    const errors: string[] = [];

    // Check gas price
    if (
      parameters.gasPrice &&
      parseFloat(parameters.gasPrice as string) > parseFloat(policy.maxGasPrice)
    ) {
      errors.push(
        `Gas price ${parameters.gasPrice} exceeds limit ${policy.maxGasPrice}`
      );
    }

    // Check slippage
    if (
      parameters.slippage &&
      parseFloat(parameters.slippage as string) > parseFloat(policy.maxSlippage)
    ) {
      errors.push(
        `Slippage ${parameters.slippage}% exceeds limit ${policy.maxSlippage}%`
      );
    }

    // Check transaction value
    if (
      parameters.amount &&
      parseFloat(parameters.amount as string) >
        parseFloat(policy.maxTransactionValue)
    ) {
      errors.push(
        `Transaction amount ${parameters.amount} exceeds limit ${policy.maxTransactionValue}`
      );
    }

    // Check allowed tokens
    if (
      parameters.tokenAddress &&
      !policy.allowedTokens.includes(parameters.tokenAddress as string)
    ) {
      errors.push(`Token ${parameters.tokenAddress} not in allowed list`);
    }

    // Check blocked tokens
    if (
      parameters.tokenAddress &&
      policy.blockedTokens.includes(parameters.tokenAddress as string)
    ) {
      errors.push(`Token ${parameters.tokenAddress} is blocked`);
    }

    // Check time restrictions
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    if (
      currentHour < policy.timeRestrictions.startHour ||
      currentHour > policy.timeRestrictions.endHour
    ) {
      errors.push(
        `Transactions not allowed at this time (current: ${currentHour}h, allowed: ${policy.timeRestrictions.startHour}-${policy.timeRestrictions.endHour}h)`
      );
    }

    if (!policy.timeRestrictions.daysOfWeek.includes(currentDay)) {
      errors.push(`Transactions not allowed on this day (day ${currentDay})`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Emergency pause all PKP operations
   */
  emergencyPauseAll(): void {
    this.emergencyPause = true;

    // Pause all PKP permissions
    for (const [tokenId, permissions] of this.permissions) {
      permissions.emergencyPaused = true;
      this.permissions.set(tokenId, permissions);
    }

    this.logSecurityEvent({
      type: "emergency_pause",
      severity: "critical",
      message: "Emergency pause activated for all PKP operations",
      timestamp: Date.now(),
      resolved: false,
    });

    console.log("🚨 EMERGENCY PAUSE ACTIVATED");
  }

  /**
   * Resume all PKP operations
   */
  resumeAll(): void {
    this.emergencyPause = false;

    // Resume all PKP permissions
    for (const [tokenId, permissions] of this.permissions) {
      permissions.emergencyPaused = false;
      this.permissions.set(tokenId, permissions);
    }

    this.logSecurityEvent({
      type: "emergency_pause",
      severity: "medium",
      message: "Emergency pause deactivated - all PKP operations resumed",
      timestamp: Date.now(),
      resolved: true,
    });

    console.log("✅ Emergency pause deactivated");
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: Omit<SecurityEvent, "id">): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.events.push(securityEvent);
    console.log(`🔒 Security event logged: ${event.type} - ${event.message}`);
  }

  /**
   * Get security events
   */
  getSecurityEvents(limit: number = 50): SecurityEvent[] {
    return this.events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get security events by severity
   */
  getSecurityEventsBySeverity(
    severity: SecurityEvent["severity"]
  ): SecurityEvent[] {
    return this.events.filter((event) => event.severity === severity);
  }

  /**
   * Get unresolved security events
   */
  getUnresolvedEvents(): SecurityEvent[] {
    return this.events.filter((event) => !event.resolved);
  }

  /**
   * Resolve security event
   */
  resolveSecurityEvent(eventId: string): boolean {
    const event = this.events.find((e) => e.id === eventId);
    if (event) {
      event.resolved = true;
      console.log(`✅ Security event resolved: ${eventId}`);
      return true;
    }
    return false;
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number;
    unresolvedEvents: number;
    criticalEvents: number;
    emergencyPaused: boolean;
    totalPKPs: number;
    activePolicies: number;
  } {
    return {
      totalEvents: this.events.length,
      unresolvedEvents: this.getUnresolvedEvents().length,
      criticalEvents: this.getSecurityEventsBySeverity("critical").length,
      emergencyPaused: this.emergencyPause,
      totalPKPs: this.permissions.size,
      activePolicies: this.getAllPolicies().filter((p) => p.enabled).length,
    };
  }

  /**
   * Check if Lit Action is safe to execute
   */
  async isLitActionSafe(
    actionId: string,
    parameters: Record<string, unknown>,
    pkpTokenId: string
  ): Promise<{ safe: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    // Check session validity
    if (!isSessionValid()) {
      return { safe: false, warnings: ["No valid LIT session"] };
    }

    // Check PKP permissions
    const permissions = this.getPKPPermissions(pkpTokenId);
    if (!permissions) {
      return { safe: false, warnings: ["No permissions set for PKP"] };
    }

    // Check emergency pause
    if (permissions.emergencyPaused || this.emergencyPause) {
      return { safe: false, warnings: ["Emergency pause active"] };
    }

    // Validate parameters against security policies
    const validation = this.validateLitActionParameters(actionId, parameters);
    if (!validation.valid) {
      return { safe: false, warnings: validation.errors };
    }

    // Additional safety checks
    if (parameters.amount && parseFloat(parameters.amount as string) > 0.1) {
      warnings.push("High value transaction detected");
    }

    if (parameters.gasPrice && parseFloat(parameters.gasPrice as string) > 50) {
      warnings.push("High gas price detected");
    }

    return { safe: true, warnings };
  }

  /**
   * Clear all security data
   */
  clearAllSecurityData(): void {
    this.permissions.clear();
    this.policies.clear();
    this.events = [];
    this.emergencyPause = false;
    console.log("🧹 All security data cleared");
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();

// Export convenience functions
export const setPKPPermissions = (
  tokenId: string,
  permissions: Omit<PKPPermissions, "tokenId" | "createdAt" | "updatedAt">
) => securityManager.setPKPPermissions(tokenId, permissions);

export const getPKPPermissions = (tokenId: string) =>
  securityManager.getPKPPermissions(tokenId);
export const isAddressAuthorized = (tokenId: string, address: string) =>
  securityManager.isAddressAuthorized(tokenId, address);
export const checkSpendingLimits = (
  tokenId: string,
  amount: string,
  chainId: number
) => securityManager.checkSpendingLimits(tokenId, amount, chainId);
export const addSecurityPolicy = (policy: Omit<SecurityPolicy, "id">) =>
  securityManager.addPolicy(policy);
export const getSecurityPolicy = (policyId: string) =>
  securityManager.getPolicy(policyId);
export const getAllSecurityPolicies = () => securityManager.getAllPolicies();
export const validateLitActionParameters = (
  actionId: string,
  parameters: Record<string, unknown>,
  policyId?: string
) =>
  securityManager.validateLitActionParameters(actionId, parameters, policyId);
export const emergencyPauseAll = () => securityManager.emergencyPauseAll();
export const resumeAll = () => securityManager.resumeAll();
export const getSecurityEvents = (limit?: number) =>
  securityManager.getSecurityEvents(limit);
export const getSecurityEventsBySeverity = (
  severity: SecurityEvent["severity"]
) => securityManager.getSecurityEventsBySeverity(severity);
export const getUnresolvedSecurityEvents = () =>
  securityManager.getUnresolvedEvents();
export const resolveSecurityEvent = (eventId: string) =>
  securityManager.resolveSecurityEvent(eventId);
export const getSecurityStats = () => securityManager.getSecurityStats();
export const isLitActionSafe = (
  actionId: string,
  parameters: Record<string, unknown>,
  pkpTokenId: string
) => securityManager.isLitActionSafe(actionId, parameters, pkpTokenId);
export const clearAllSecurityData = () =>
  securityManager.clearAllSecurityData();
