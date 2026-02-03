/**
 * Contract ABIs and Addresses
 * Auto-generated from blockchain deployment
 * 
 * Usage in backend:
 * const { DIDRegistry, CredentialRegistry } = require('./contracts');
 */

const DIDRegistry = {
    address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    abi: [
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
                { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
            ],
            "name": "DIDDeactivated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
                { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
            ],
            "name": "DIDRegistered",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
                { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
            ],
            "name": "DIDUpdated",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "deactivateDID",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
            "name": "getDID",
            "outputs": [
                {
                    "components": [
                        { "internalType": "address", "name": "controller", "type": "address" },
                        { "internalType": "string", "name": "publicKey", "type": "string" },
                        { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
                        { "internalType": "bool", "name": "isActive", "type": "bool" }
                    ],
                    "internalType": "struct DIDRegistry.DIDDocument",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
            "name": "hasDID",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "string", "name": "_publicKey", "type": "string" }],
            "name": "registerDID",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "string", "name": "_newPublicKey", "type": "string" }],
            "name": "updateDID",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
};

const CredentialRegistry = {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: [
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" },
                { "indexed": true, "internalType": "address", "name": "subject", "type": "address" },
                { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" },
                { "indexed": false, "internalType": "uint256", "name": "expiresAt", "type": "uint256" }
            ],
            "name": "CredentialIssued",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" },
                { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
            ],
            "name": "CredentialRevoked",
            "type": "event"
        },
        {
            "inputs": [{ "internalType": "bytes32", "name": "_credentialHash", "type": "bytes32" }],
            "name": "getCredential",
            "outputs": [
                {
                    "components": [
                        { "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" },
                        { "internalType": "address", "name": "subject", "type": "address" },
                        { "internalType": "address", "name": "issuer", "type": "address" },
                        { "internalType": "uint256", "name": "issuedAt", "type": "uint256" },
                        { "internalType": "uint256", "name": "expiresAt", "type": "uint256" },
                        { "internalType": "bool", "name": "isRevoked", "type": "bool" }
                    ],
                    "internalType": "struct CredentialRegistry.Credential",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "_subject", "type": "address" }],
            "name": "getSubjectCredentials",
            "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "bytes32", "name": "_credentialHash", "type": "bytes32" },
                { "internalType": "address", "name": "_subject", "type": "address" },
                { "internalType": "uint256", "name": "_expiresAt", "type": "uint256" }
            ],
            "name": "issueCredential",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "bytes32", "name": "_credentialHash", "type": "bytes32" }],
            "name": "isExpired",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "bytes32", "name": "_credentialHash", "type": "bytes32" }],
            "name": "isRevoked",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "bytes32", "name": "_credentialHash", "type": "bytes32" }],
            "name": "revokeCredential",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "bytes32", "name": "_credentialHash", "type": "bytes32" }],
            "name": "verifyCredential",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
            "stateMutability": "view",
            "type": "function"
        }
    ]
};

module.exports = {
    DIDRegistry,
    CredentialRegistry
};
