import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Main Ignition module for deploying all VerifyX contracts
 * This deploys both DIDRegistry and CredentialRegistry
 */
const VerifyXModule = buildModule("VerifyXModule", (m) => {
    // Deploy DIDRegistry
    const didRegistry = m.contract("DIDRegistry");

    // Deploy CredentialRegistry
    const credentialRegistry = m.contract("CredentialRegistry");

    return { didRegistry, credentialRegistry };
});

export default VerifyXModule;
