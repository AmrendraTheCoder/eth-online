/**
 * Stake Action - Lit Action for Token Staking Operations
 *
 * This Lit Action handles staking tokens in various protocols:
 * - Accept parameters: chain, protocol, amount, token
 * - Approve and stake tokens
 * - Return staking transaction details
 *
 * Supported staking protocols:
 * - Lido (ETH staking)
 * - Rocket Pool (ETH staking)
 * - Aave (lending)
 * - Compound (lending)
 * - Yearn Finance (yield farming)
 * - Curve (liquidity staking)
 */

// Lit Action entry point
const go = async () => {
  // Get parameters from Lit Action context
  const { chain, protocol, amount, token, poolId, duration } = params;

  console.log("🥩 Starting stake operation...");
  console.log("Chain:", chain);
  console.log("Protocol:", protocol);
  console.log("Amount:", amount);
  console.log("Token:", token);
  console.log("Pool ID:", poolId);
  console.log("Duration:", duration);

  try {
    // Validate parameters
    if (!chain || !protocol || !amount || !token) {
      throw new Error(
        "Missing required parameters: chain, protocol, amount, token"
      );
    }

    if (parseFloat(amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Get PKP wallet address
    const pkpWalletAddress = await Lit.Actions.getSignerAddress();
    console.log("PKP Wallet Address:", pkpWalletAddress);

    // Check balance before staking
    const balance = await Lit.Actions.getBalance({
      chain: chain,
      token: token,
    });

    console.log("Current balance:", balance);

    if (parseFloat(balance) < parseFloat(amount)) {
      throw new Error(
        `Insufficient balance. Required: ${amount}, Available: ${balance}`
      );
    }

    let stakeResult;

    // Execute stake based on protocol
    switch (protocol.toLowerCase()) {
      case "lido":
        stakeResult = await stakeViaLido(chain, amount, token);
        break;

      case "rocket-pool":
        stakeResult = await stakeViaRocketPool(chain, amount, token);
        break;

      case "aave":
        stakeResult = await stakeViaAave(chain, amount, token);
        break;

      case "compound":
        stakeResult = await stakeViaCompound(chain, amount, token);
        break;

      case "yearn":
        stakeResult = await stakeViaYearn(chain, amount, token, poolId);
        break;

      case "curve":
        stakeResult = await stakeViaCurve(chain, amount, token, poolId);
        break;

      default:
        throw new Error(`Unsupported staking protocol: ${protocol}`);
    }

    console.log("✅ Stake transaction sent:", stakeResult.txHash);

    // Wait for transaction confirmation
    const receipt = await Lit.Actions.waitForTransaction({
      chain: chain,
      txHash: stakeResult.txHash,
    });

    console.log("✅ Stake transaction confirmed:", receipt);

    // Return success result
    const result = {
      success: true,
      txHash: stakeResult.txHash,
      chain: chain,
      protocol: protocol,
      token: token,
      amount: amount,
      stakedAmount: stakeResult.stakedAmount,
      apy: stakeResult.apy,
      gasUsed: receipt.gasUsed,
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toISOString(),
    };

    // Set response data
    Lit.Actions.setResponse({ response: JSON.stringify(result) });
  } catch (error) {
    console.error("❌ Stake operation failed:", error);

    const errorResult = {
      success: false,
      error: error.message,
      chain: chain,
      protocol: protocol,
      token: token,
      amount: amount,
      timestamp: new Date().toISOString(),
    };

    Lit.Actions.setResponse({ response: JSON.stringify(errorResult) });
  }
};

/**
 * Stake via Lido
 */
async function stakeViaLido(chain, amount, token) {
  console.log("🏛️ Staking via Lido...");

  // Lido stETH contract addresses
  const lidoContracts = {
    ethereum: "0xae7ab96520DE3A18E5e111B5EaAb095312D9fE17",
    polygon: "0x9A7c69A167160C507602ecB3Df4911e8EBeE476b",
    arbitrum: "0x5979D7b546E38E414F7E9822514be443A4800529",
    optimism: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb",
    base: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
  };

  const lidoContract = lidoContracts[chain];
  if (!lidoContract) {
    throw new Error(`Lido not supported on ${chain}`);
  }

  // Check if token is ETH
  if (token !== "0x0000000000000000000000000000000000000000") {
    throw new Error("Lido only supports ETH staking");
  }

  // Submit stake to Lido
  const tx = await Lit.Actions.contractCall({
    contractAddress: lidoContract,
    abi: lidoStakingABI,
    method: "submit",
    params: [ethers.parseEther(amount)],
    value: ethers.parseEther(amount),
  });

  return {
    txHash: tx.hash,
    stakedAmount: amount,
    apy: "4.2", // Current Lido APY
  };
}

/**
 * Stake via Rocket Pool
 */
async function stakeViaRocketPool(chain, amount, token) {
  console.log("🚀 Staking via Rocket Pool...");

  // Rocket Pool contract addresses
  const rocketPoolContracts = {
    ethereum: "0xae78736Cd615f374D3085123A210448E74Fc6393",
  };

  const rocketPoolContract = rocketPoolContracts[chain];
  if (!rocketPoolContract) {
    throw new Error(`Rocket Pool not supported on ${chain}`);
  }

  // Check if token is ETH
  if (token !== "0x0000000000000000000000000000000000000000") {
    throw new Error("Rocket Pool only supports ETH staking");
  }

  // Submit stake to Rocket Pool
  const tx = await Lit.Actions.contractCall({
    contractAddress: rocketPoolContract,
    abi: rocketPoolStakingABI,
    method: "deposit",
    params: [],
    value: ethers.parseEther(amount),
  });

  return {
    txHash: tx.hash,
    stakedAmount: amount,
    apy: "4.8", // Current Rocket Pool APY
  };
}

/**
 * Stake via Aave
 */
async function stakeViaAave(chain, amount, token) {
  console.log("🏦 Staking via Aave...");

  // Aave Lending Pool contract addresses
  const aaveContracts = {
    ethereum: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    polygon: "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
    arbitrum: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    optimism: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    base: "0x46e6b214b524310239732D51387075E0e70970bf",
  };

  const aaveContract = aaveContracts[chain];
  if (!aaveContract) {
    throw new Error(`Aave not supported on ${chain}`);
  }

  // First, approve the token for Aave
  const approveTx = await Lit.Actions.contractCall({
    contractAddress: token,
    abi: erc20ABI,
    method: "approve",
    params: [aaveContract, ethers.parseUnits(amount, 18)],
  });

  console.log("✅ Token approved for Aave:", approveTx.hash);

  // Wait for approval confirmation
  await Lit.Actions.waitForTransaction({
    chain: chain,
    txHash: approveTx.hash,
  });

  // Supply token to Aave
  const supplyTx = await Lit.Actions.contractCall({
    contractAddress: aaveContract,
    abi: aaveLendingPoolABI,
    method: "supply",
    params: [
      token,
      ethers.parseUnits(amount, 18),
      await Lit.Actions.getSignerAddress(),
      0, // referral code
    ],
  });

  return {
    txHash: supplyTx.hash,
    stakedAmount: amount,
    apy: "2.5", // Current Aave APY (varies by token)
  };
}

/**
 * Stake via Compound
 */
async function stakeViaCompound(chain, amount, token) {
  console.log("🏛️ Staking via Compound...");

  // Compound cToken contract addresses
  const compoundContracts = {
    ethereum: {
      USDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
      USDT: "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
      DAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    },
  };

  const cTokenAddress = compoundContracts[chain]?.[token];
  if (!cTokenAddress) {
    throw new Error(`Compound not supported for ${token} on ${chain}`);
  }

  // First, approve the token for Compound
  const approveTx = await Lit.Actions.contractCall({
    contractAddress: token,
    abi: erc20ABI,
    method: "approve",
    params: [cTokenAddress, ethers.parseUnits(amount, 18)],
  });

  console.log("✅ Token approved for Compound:", approveTx.hash);

  // Wait for approval confirmation
  await Lit.Actions.waitForTransaction({
    chain: chain,
    txHash: approveTx.hash,
  });

  // Mint cTokens (supply to Compound)
  const mintTx = await Lit.Actions.contractCall({
    contractAddress: cTokenAddress,
    abi: compoundCTokenABI,
    method: "mint",
    params: [ethers.parseUnits(amount, 18)],
  });

  return {
    txHash: mintTx.hash,
    stakedAmount: amount,
    apy: "1.8", // Current Compound APY (varies by token)
  };
}

/**
 * Stake via Yearn Finance
 */
async function stakeViaYearn(chain, amount, token, poolId) {
  console.log("📈 Staking via Yearn Finance...");

  // Yearn Vault contract addresses (simplified)
  const yearnVaults = {
    ethereum: {
      USDC: "0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9",
      USDT: "0x7Da96a3891Add058AdA2E826306D812C638D87a7",
      DAI: "0xdA816459F1AB5631232FE5e97a05BBBb94970c95",
    },
  };

  const vaultAddress = yearnVaults[chain]?.[token];
  if (!vaultAddress) {
    throw new Error(`Yearn vault not found for ${token} on ${chain}`);
  }

  // First, approve the token for Yearn
  const approveTx = await Lit.Actions.contractCall({
    contractAddress: token,
    abi: erc20ABI,
    method: "approve",
    params: [vaultAddress, ethers.parseUnits(amount, 18)],
  });

  console.log("✅ Token approved for Yearn:", approveTx.hash);

  // Wait for approval confirmation
  await Lit.Actions.waitForTransaction({
    chain: chain,
    txHash: approveTx.hash,
  });

  // Deposit to Yearn vault
  const depositTx = await Lit.Actions.contractCall({
    contractAddress: vaultAddress,
    abi: yearnVaultABI,
    method: "deposit",
    params: [ethers.parseUnits(amount, 18)],
  });

  return {
    txHash: depositTx.hash,
    stakedAmount: amount,
    apy: "5.2", // Current Yearn APY (varies by vault)
  };
}

/**
 * Stake via Curve
 */
async function stakeViaCurve(chain, amount, token, poolId) {
  console.log("📈 Staking via Curve...");

  // Curve pool contract addresses (simplified)
  const curvePools = {
    ethereum: {
      "USDC-USDT": "0xA2B47E3D5c44877cca798226B7B8118F9BF4e9C",
      "DAI-USDC": "0x2dded6Da1BF5DBdF597C45fcFaa3194e53EcfeAF",
    },
  };

  const poolAddress = curvePools[chain]?.[poolId];
  if (!poolAddress) {
    throw new Error(`Curve pool not found for ${poolId} on ${chain}`);
  }

  // First, approve the token for Curve
  const approveTx = await Lit.Actions.contractCall({
    contractAddress: token,
    abi: erc20ABI,
    method: "approve",
    params: [poolAddress, ethers.parseUnits(amount, 18)],
  });

  console.log("✅ Token approved for Curve:", approveTx.hash);

  // Wait for approval confirmation
  await Lit.Actions.waitForTransaction({
    chain: chain,
    txHash: approveTx.hash,
  });

  // Add liquidity to Curve pool
  const addLiquidityTx = await Lit.Actions.contractCall({
    contractAddress: poolAddress,
    abi: curvePoolABI,
    method: "add_liquidity",
    params: [
      [ethers.parseUnits(amount, 18), 0], // amounts
      0, // min_mint_amount
    ],
  });

  return {
    txHash: addLiquidityTx.hash,
    stakedAmount: amount,
    apy: "3.5", // Current Curve APY (varies by pool)
  };
}

// Lido stETH ABI (simplified)
const lidoStakingABI = [
  {
    inputs: [{ name: "referral", type: "address" }],
    name: "submit",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
];

// Rocket Pool stETH ABI (simplified)
const rocketPoolStakingABI = [
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// ERC20 ABI (simplified)
const erc20ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Aave Lending Pool ABI (simplified)
const aaveLendingPoolABI = [
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Compound cToken ABI (simplified)
const compoundCTokenABI = [
  {
    inputs: [{ name: "mintAmount", type: "uint256" }],
    name: "mint",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Yearn Vault ABI (simplified)
const yearnVaultABI = [
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Curve Pool ABI (simplified)
const curvePoolABI = [
  {
    inputs: [
      { name: "amounts", type: "uint256[]" },
      { name: "min_mint_amount", type: "uint256" },
    ],
    name: "add_liquidity",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Execute the Lit Action
go();
