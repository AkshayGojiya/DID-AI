/**
 * VerifyX Hardhat Configuration
 * =============================
 * Configuration for smart contract development, testing, and deployment.
 */

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],

  // Solidity compiler settings
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: false,
        },
      },
    },
  },

  // Network configurations
  networks: {
    // Local Hardhat network (for development)
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },

    // Hardhat OP Stack network
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },

    // Sepolia Testnet (for testing before mainnet)
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
});
