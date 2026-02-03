// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DIDRegistry
 * @dev Decentralized Identifier (DID) Registry for managing user identities
 * @notice This contract allows users to register and manage their DIDs on-chain
 */
contract DIDRegistry {
    struct DIDDocument {
        address controller;      // Wallet address that controls this DID
        string publicKey;        // Public key for verification
        uint256 createdAt;       // Timestamp when DID was created
        bool isActive;           // Whether the DID is currently active
    }
    
    // Mapping from wallet address to DID document
    mapping(address => DIDDocument) private dids;
    
    // Events
    event DIDRegistered(address indexed owner, uint256 timestamp);
    event DIDUpdated(address indexed owner, uint256 timestamp);
    event DIDDeactivated(address indexed owner, uint256 timestamp);
    
    /**
     * @dev Register a new DID for the caller
     * @param _publicKey The public key to associate with this DID
     */
    function registerDID(string memory _publicKey) external {
        require(dids[msg.sender].createdAt == 0, "DID already exists");
        require(bytes(_publicKey).length > 0, "Public key cannot be empty");
        
        dids[msg.sender] = DIDDocument({
            controller: msg.sender,
            publicKey: _publicKey,
            createdAt: block.timestamp,
            isActive: true
        });
        
        emit DIDRegistered(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update the public key of an existing DID
     * @param _newPublicKey The new public key
     */
    function updateDID(string memory _newPublicKey) external {
        require(dids[msg.sender].createdAt != 0, "DID not found");
        require(dids[msg.sender].isActive, "DID is deactivated");
        require(bytes(_newPublicKey).length > 0, "Public key cannot be empty");
        
        dids[msg.sender].publicKey = _newPublicKey;
        
        emit DIDUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Deactivate a DID (cannot be reactivated)
     */
    function deactivateDID() external {
        require(dids[msg.sender].createdAt != 0, "DID not found");
        require(dids[msg.sender].isActive, "DID already deactivated");
        
        dids[msg.sender].isActive = false;
        
        emit DIDDeactivated(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get DID document for a specific address
     * @param _owner The address to query
     * @return The DID document
     */
    function getDID(address _owner) external view returns (DIDDocument memory) {
        require(dids[_owner].createdAt != 0, "DID not found");
        return dids[_owner];
    }
    
    /**
     * @dev Check if an address has an active DID
     * @param _owner The address to check
     * @return True if the address has an active DID
     */
    function hasDID(address _owner) external view returns (bool) {
        return dids[_owner].createdAt != 0 && dids[_owner].isActive;
    }
}
