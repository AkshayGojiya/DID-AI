import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for deploying CredentialRegistry contract
 */
const CredentialRegistryModule = buildModule("CredentialRegistryModule", (m) => {
    // Deploy CredentialRegistry
    const credentialRegistry = m.contract("CredentialRegistry");

    return { credentialRegistry };
});

export default CredentialRegistryModule;
