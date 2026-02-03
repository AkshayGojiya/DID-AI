import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for deploying DIDRegistry contract
 */
const DIDRegistryModule = buildModule("DIDRegistryModule", (m) => {
    // Deploy DIDRegistry
    const didRegistry = m.contract("DIDRegistry");

    return { didRegistry };
});

export default DIDRegistryModule;
