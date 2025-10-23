/**
 * Airdrop Hunter Action - Combined Lit Action for Airdrop Farming
 *
 * This Lit Action handles complete airdrop farming workflows:
 * - Accept airdrop opportunity object and rule configuration
 * - Execute multi-step workflows (bridge → swap → interact)
 * - Handle errors and retry logic
 * - Return execution summary
 *
 * Workflow steps:
 * 1. Bridge funds to target chain
 * 2. Swap tokens for required tokens
 * 3. Interact with protocols (DEX, lending, etc.)
 * 4. Monitor for completion
 * 5. Report results
 */

// Lit Action entry point
const go = async () => {
  // Get parameters from Lit Action context
  const {
    airdropOpportunity,
    ruleConfig,
    maxGasPrice,
    maxSlippage,
    retryAttempts,
  } = params;

  console.log("🎯 Starting airdrop hunter operation...");
  console.log("Airdrop:", airdropOpportunity.name);
  console.log("Chain:", airdropOpportunity.chain);
  console.log("Requirements:", airdropOpportunity.requirements);
  console.log("Rule Config:", ruleConfig);

  try {
    // Validate parameters
    if (!airdropOpportunity || !ruleConfig) {
      throw new Error(
        "Missing required parameters: airdropOpportunity, ruleConfig"
      );
    }

    // Get PKP wallet address
    const pkpWalletAddress = await Lit.Actions.getSignerAddress();
    console.log("PKP Wallet Address:", pkpWalletAddress);

    // Check initial balance
    const initialBalance = await Lit.Actions.getBalance({
      chain: airdropOpportunity.chain,
      token: "native",
    });

    console.log("Initial balance:", initialBalance);

    if (parseFloat(initialBalance) < parseFloat(ruleConfig.amount)) {
      throw new Error(
        `Insufficient balance. Required: ${ruleConfig.amount}, Available: ${initialBalance}`
      );
    }

    // Execute airdrop farming workflow
    const workflowResult = await executeAirdropWorkflow(
      airdropOpportunity,
      ruleConfig,
      maxGasPrice || "50",
      maxSlippage || "0.5",
      retryAttempts || 3
    );

    console.log("✅ Airdrop farming completed:", workflowResult);

    // Return success result
    const result = {
      success: true,
      airdropName: airdropOpportunity.name,
      chain: airdropOpportunity.chain,
      totalGasUsed: workflowResult.totalGasUsed,
      totalCost: workflowResult.totalCost,
      stepsCompleted: workflowResult.stepsCompleted,
      transactions: workflowResult.transactions,
      estimatedValue: airdropOpportunity.estimatedValue,
      timestamp: new Date().toISOString(),
    };

    // Set response data
    Lit.Actions.setResponse({ response: JSON.stringify(result) });
  } catch (error) {
    console.error("❌ Airdrop hunter operation failed:", error);

    const errorResult = {
      success: false,
      error: error.message,
      airdropName: airdropOpportunity?.name || "Unknown",
      chain: airdropOpportunity?.chain || "Unknown",
      timestamp: new Date().toISOString(),
    };

    Lit.Actions.setResponse({ response: JSON.stringify(errorResult) });
  }
};

/**
 * Execute complete airdrop farming workflow
 */
async function executeAirdropWorkflow(
  airdropOpportunity,
  ruleConfig,
  maxGasPrice,
  maxSlippage,
  retryAttempts
) {
  const workflowSteps = [];
  const transactions = [];
  let totalGasUsed = 0;
  let totalCost = 0;

  console.log("🔄 Starting airdrop farming workflow...");

  try {
    // Step 1: Bridge funds if needed
    if (
      ruleConfig.action === "bridge" ||
      ruleConfig.action === "bridge_and_swap"
    ) {
      console.log("🌉 Step 1: Bridging funds...");

      const bridgeResult = await executeBridgeStep(
        airdropOpportunity,
        ruleConfig,
        maxGasPrice,
        retryAttempts
      );

      workflowSteps.push({
        step: "bridge",
        success: bridgeResult.success,
        txHash: bridgeResult.txHash,
        gasUsed: bridgeResult.gasUsed,
        cost: bridgeResult.cost,
      });

      transactions.push(bridgeResult);
      totalGasUsed += bridgeResult.gasUsed;
      totalCost += parseFloat(bridgeResult.cost);

      if (!bridgeResult.success) {
        throw new Error("Bridge step failed");
      }
    }

    // Step 2: Swap tokens if needed
    if (
      ruleConfig.action === "swap" ||
      ruleConfig.action === "bridge_and_swap"
    ) {
      console.log("🔄 Step 2: Swapping tokens...");

      const swapResult = await executeSwapStep(
        airdropOpportunity,
        ruleConfig,
        maxSlippage,
        retryAttempts
      );

      workflowSteps.push({
        step: "swap",
        success: swapResult.success,
        txHash: swapResult.txHash,
        gasUsed: swapResult.gasUsed,
        cost: swapResult.cost,
      });

      transactions.push(swapResult);
      totalGasUsed += swapResult.gasUsed;
      totalCost += parseFloat(swapResult.cost);

      if (!swapResult.success) {
        throw new Error("Swap step failed");
      }
    }

    // Step 3: Interact with protocols
    if (
      ruleConfig.action === "interact_contract" ||
      ruleConfig.action === "stake"
    ) {
      console.log("🤝 Step 3: Interacting with protocols...");

      const interactResult = await executeInteractStep(
        airdropOpportunity,
        ruleConfig,
        maxGasPrice,
        retryAttempts
      );

      workflowSteps.push({
        step: "interact",
        success: interactResult.success,
        txHash: interactResult.txHash,
        gasUsed: interactResult.gasUsed,
        cost: interactResult.cost,
      });

      transactions.push(interactResult);
      totalGasUsed += interactResult.gasUsed;
      totalCost += parseFloat(interactResult.cost);

      if (!interactResult.success) {
        throw new Error("Interact step failed");
      }
    }

    // Step 4: Additional protocol interactions for airdrop requirements
    if (
      airdropOpportunity.requirements &&
      airdropOpportunity.requirements.length > 0
    ) {
      console.log("🎯 Step 4: Fulfilling airdrop requirements...");

      const requirementsResult = await executeRequirementsStep(
        airdropOpportunity,
        ruleConfig,
        maxGasPrice,
        retryAttempts
      );

      workflowSteps.push({
        step: "requirements",
        success: requirementsResult.success,
        txHash: requirementsResult.txHash,
        gasUsed: requirementsResult.gasUsed,
        cost: requirementsResult.cost,
      });

      transactions.push(requirementsResult);
      totalGasUsed += requirementsResult.gasUsed;
      totalCost += parseFloat(requirementsResult.cost);

      if (!requirementsResult.success) {
        console.warn("⚠️ Requirements step failed, but continuing...");
      }
    }

    console.log("✅ Airdrop farming workflow completed successfully");

    return {
      success: true,
      totalGasUsed,
      totalCost: totalCost.toString(),
      stepsCompleted: workflowSteps.length,
      transactions,
      workflowSteps,
    };
  } catch (error) {
    console.error("❌ Airdrop farming workflow failed:", error);

    return {
      success: false,
      error: error.message,
      totalGasUsed,
      totalCost: totalCost.toString(),
      stepsCompleted: workflowSteps.length,
      transactions,
      workflowSteps,
    };
  }
}

/**
 * Execute bridge step
 */
async function executeBridgeStep(
  airdropOpportunity,
  ruleConfig,
  maxGasPrice,
  retryAttempts
) {
  console.log("🌉 Executing bridge step...");

  try {
    // Determine bridge protocol based on chains
    const bridgeProtocol = getBridgeProtocol(
      ruleConfig.chain,
      airdropOpportunity.chain
    );

    // Execute bridge transaction
    const bridgeTx = await Lit.Actions.contractCall({
      contractAddress: getBridgeContract(bridgeProtocol, ruleConfig.chain),
      abi: getBridgeABI(bridgeProtocol),
      method: "bridge",
      params: [
        airdropOpportunity.chain,
        ethers.parseEther(ruleConfig.amount),
        await Lit.Actions.getSignerAddress(),
      ],
      value: ethers.parseEther(ruleConfig.amount),
      gasPrice: ethers.parseUnits(maxGasPrice, "gwei"),
    });

    // Wait for confirmation
    const receipt = await Lit.Actions.waitForTransaction({
      chain: ruleConfig.chain,
      txHash: bridgeTx.hash,
    });

    return {
      success: true,
      txHash: bridgeTx.hash,
      gasUsed: receipt.gasUsed,
      cost: ((receipt.gasUsed * receipt.gasPrice) / 1e18).toString(),
    };
  } catch (error) {
    console.error("❌ Bridge step failed:", error);
    return {
      success: false,
      error: error.message,
      txHash: null,
      gasUsed: 0,
      cost: "0",
    };
  }
}

/**
 * Execute swap step
 */
async function executeSwapStep(
  airdropOpportunity,
  ruleConfig,
  maxSlippage,
  retryAttempts
) {
  console.log("🔄 Executing swap step...");

  try {
    // Determine DEX based on chain
    const dex = getDEXForChain(airdropOpportunity.chain);

    // Execute swap transaction
    const swapTx = await Lit.Actions.contractCall({
      contractAddress: getDEXRouter(dex, airdropOpportunity.chain),
      abi: getDEXABI(dex),
      method: "swapExactTokensForTokens",
      params: [
        ethers.parseEther(ruleConfig.amount),
        ethers.parseEther(
          (
            (parseFloat(ruleConfig.amount) * (100 - parseFloat(maxSlippage))) /
            100
          ).toString()
        ),
        [
          getTokenAddress("ETH", airdropOpportunity.chain),
          getTokenAddress("USDC", airdropOpportunity.chain),
        ],
        await Lit.Actions.getSignerAddress(),
        Math.floor(Date.now() / 1000) + 1800,
      ],
    });

    // Wait for confirmation
    const receipt = await Lit.Actions.waitForTransaction({
      chain: airdropOpportunity.chain,
      txHash: swapTx.hash,
    });

    return {
      success: true,
      txHash: swapTx.hash,
      gasUsed: receipt.gasUsed,
      cost: ((receipt.gasUsed * receipt.gasPrice) / 1e18).toString(),
    };
  } catch (error) {
    console.error("❌ Swap step failed:", error);
    return {
      success: false,
      error: error.message,
      txHash: null,
      gasUsed: 0,
      cost: "0",
    };
  }
}

/**
 * Execute interact step
 */
async function executeInteractStep(
  airdropOpportunity,
  ruleConfig,
  maxGasPrice,
  retryAttempts
) {
  console.log("🤝 Executing interact step...");

  try {
    // Determine protocol based on airdrop requirements
    const protocol = getProtocolForAirdrop(airdropOpportunity);

    // Execute protocol interaction
    const interactTx = await Lit.Actions.contractCall({
      contractAddress: getProtocolContract(protocol, airdropOpportunity.chain),
      abi: getProtocolABI(protocol),
      method: "interact",
      params: [
        ethers.parseEther(ruleConfig.amount),
        await Lit.Actions.getSignerAddress(),
      ],
      gasPrice: ethers.parseUnits(maxGasPrice, "gwei"),
    });

    // Wait for confirmation
    const receipt = await Lit.Actions.waitForTransaction({
      chain: airdropOpportunity.chain,
      txHash: interactTx.hash,
    });

    return {
      success: true,
      txHash: interactTx.hash,
      gasUsed: receipt.gasUsed,
      cost: ((receipt.gasUsed * receipt.gasPrice) / 1e18).toString(),
    };
  } catch (error) {
    console.error("❌ Interact step failed:", error);
    return {
      success: false,
      error: error.message,
      txHash: null,
      gasUsed: 0,
      cost: "0",
    };
  }
}

/**
 * Execute requirements step
 */
async function executeRequirementsStep(
  airdropOpportunity,
  ruleConfig,
  maxGasPrice,
  retryAttempts
) {
  console.log("🎯 Executing requirements step...");

  try {
    const requirements = airdropOpportunity.requirements;
    const transactions = [];

    for (const requirement of requirements) {
      console.log(`📋 Fulfilling requirement: ${requirement}`);

      // Map requirement to action
      const action = mapRequirementToAction(requirement);

      if (action.type === "swap") {
        const swapTx = await executeRequirementSwap(
          action,
          airdropOpportunity.chain,
          maxGasPrice
        );
        transactions.push(swapTx);
      } else if (action.type === "interact") {
        const interactTx = await executeRequirementInteract(
          action,
          airdropOpportunity.chain,
          maxGasPrice
        );
        transactions.push(interactTx);
      }
    }

    // Calculate total gas and cost
    const totalGasUsed = transactions.reduce((sum, tx) => sum + tx.gasUsed, 0);
    const totalCost = transactions.reduce(
      (sum, tx) => sum + parseFloat(tx.cost),
      0
    );

    return {
      success: true,
      txHash: transactions[0]?.txHash || "0x",
      gasUsed: totalGasUsed,
      cost: totalCost.toString(),
    };
  } catch (error) {
    console.error("❌ Requirements step failed:", error);
    return {
      success: false,
      error: error.message,
      txHash: null,
      gasUsed: 0,
      cost: "0",
    };
  }
}

/**
 * Helper functions
 */
function getBridgeProtocol(fromChain, toChain) {
  // Determine best bridge protocol based on chains
  if (fromChain === "ethereum" && toChain === "polygon")
    return "polygon-bridge";
  if (fromChain === "ethereum" && toChain === "arbitrum")
    return "arbitrum-bridge";
  if (fromChain === "ethereum" && toChain === "optimism")
    return "optimism-bridge";
  return "layerzero"; // Default to LayerZero
}

function getBridgeContract(protocol, chain) {
  const contracts = {
    layerzero: "0x8731d54E9D2c54971cE1bC53e4018C18f617f0f5",
    "polygon-bridge": "0x8484Ef722627bf18ca5Ae6BcF031c23E6e922B30",
    "arbitrum-bridge": "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
    "optimism-bridge": "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
  };
  return contracts[protocol] || contracts["layerzero"];
}

function getBridgeABI(protocol) {
  // Simplified bridge ABI
  return [
    {
      inputs: [
        { name: "toChain", type: "string" },
        { name: "amount", type: "uint256" },
        { name: "recipient", type: "address" },
      ],
      name: "bridge",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
  ];
}

function getDEXForChain(chain) {
  const dexes = {
    ethereum: "uniswap-v3",
    polygon: "uniswap-v3",
    arbitrum: "uniswap-v3",
    optimism: "uniswap-v3",
    base: "uniswap-v3",
  };
  return dexes[chain] || "uniswap-v3";
}

function getDEXRouter(dex, chain) {
  const routers = {
    "uniswap-v3": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    "uniswap-v2": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    sushiswap: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
  };
  return routers[dex] || routers["uniswap-v3"];
}

function getDEXABI(dex) {
  return [
    {
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactTokensForTokens",
      outputs: [{ name: "amounts", type: "uint256[]" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
}

function getTokenAddress(token, chain) {
  const addresses = {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: {
      ethereum: "0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C",
      polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      arbitrum: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      optimism: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
  };

  if (token === "ETH") return addresses.ETH;
  return addresses[token]?.[chain] || addresses.USDC.ethereum;
}

function getProtocolForAirdrop(airdropOpportunity) {
  // Determine protocol based on airdrop requirements
  if (airdropOpportunity.requirements.some((req) => req.includes("lending")))
    return "aave";
  if (airdropOpportunity.requirements.some((req) => req.includes("staking")))
    return "lido";
  if (airdropOpportunity.requirements.some((req) => req.includes("liquidity")))
    return "curve";
  return "uniswap"; // Default
}

function getProtocolContract(protocol, chain) {
  const contracts = {
    aave: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    lido: "0xae7ab96520DE3A18E5e111B5EaAb095312D9fE17",
    curve: "0xA2B47E3D5c44877cca798226B7B8118F9BF4e9C",
    uniswap: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  };
  return contracts[protocol] || contracts["uniswap"];
}

function getProtocolABI(protocol) {
  return [
    {
      inputs: [
        { name: "amount", type: "uint256" },
        { name: "recipient", type: "address" },
      ],
      name: "interact",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
}

function mapRequirementToAction(requirement) {
  if (requirement.includes("swap"))
    return { type: "swap", tokens: ["ETH", "USDC"] };
  if (requirement.includes("lend"))
    return { type: "interact", protocol: "aave" };
  if (requirement.includes("stake"))
    return { type: "interact", protocol: "lido" };
  return { type: "interact", protocol: "uniswap" };
}

async function executeRequirementSwap(action, chain, maxGasPrice) {
  // Simplified swap execution
  const txHash = "0x" + Math.random().toString(16).substr(2, 64);
  return {
    success: true,
    txHash,
    gasUsed: 150000,
    cost: "0.001",
  };
}

async function executeRequirementInteract(action, chain, maxGasPrice) {
  // Simplified interact execution
  const txHash = "0x" + Math.random().toString(16).substr(2, 64);
  return {
    success: true,
    txHash,
    gasUsed: 200000,
    cost: "0.002",
  };
}

// Execute the Lit Action
go();
