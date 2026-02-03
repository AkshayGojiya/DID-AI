import hre from "hardhat";
import { formatEther } from "viem";

async function main() {
    console.log("🚀 Starting deployment...\n");

    // Get the deployer account
    const [deployer] = await hre.viem.getWalletClients();
    console.log("📝 Deploying contracts with account:", deployer.account.address);

    const publicClient = await hre.viem.getPublicClient();
    const balance = await publicClient.getBalance({ address: deployer.account.address });
    console.log("💰 Account balance:", formatEther(balance), "ETH\n");

    // Deploy DIDRegistry
    console.log("📦 Deploying DIDRegistry...");
    const didRegistry = await hre.viem.deployContract("DIDRegistry");
    console.log("✅ DIDRegistry deployed to:", didRegistry.address);

    // Deploy CredentialRegistry
    console.log("\n📦 Deploying CredentialRegistry...");
    const credentialRegistry = await hre.viem.deployContract("CredentialRegistry");
    console.log("✅ CredentialRegistry deployed to:", credentialRegistry.address);

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("DIDRegistry:         ", didRegistry.address);
    console.log("CredentialRegistry:  ", credentialRegistry.address);
    console.log("=".repeat(60));

    console.log("\n💡 Add these addresses to your backend .env file:");
    console.log(`DID_REGISTRY_ADDRESS=${didRegistry.address}`);
    console.log(`CREDENTIAL_REGISTRY_ADDRESS=${credentialRegistry.address}`);

    console.log("\n✨ Deployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
