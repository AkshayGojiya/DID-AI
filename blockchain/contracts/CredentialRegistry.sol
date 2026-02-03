// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialRegistry
 * @dev Registry for managing verifiable credentials on-chain
 * @notice This contract allows issuers to issue, verify, and revoke credentials
 */
contract CredentialRegistry {
    struct Credential {
        bytes32 credentialHash;  // Hash of the credential data
        address subject;         // Address of the credential holder
        address issuer;          // Address of the credential issuer
        uint256 issuedAt;        // Timestamp when credential was issued
        uint256 expiresAt;       // Timestamp when credential expires
        bool isRevoked;          // Whether the credential has been revoked
    }
    
    // Mapping from credential hash to credential data
    mapping(bytes32 => Credential) private credentials;
    
    // Mapping to track credentials by subject
    mapping(address => bytes32[]) private subjectCredentials;
    
    // Events
    event CredentialIssued(
        bytes32 indexed credentialHash,
        address indexed subject,
        address indexed issuer,
        uint256 expiresAt
    );
    event CredentialRevoked(bytes32 indexed credentialHash, uint256 timestamp);
    
    /**
     * @dev Issue a new credential
     * @param _credentialHash Hash of the credential data
     * @param _subject Address of the credential holder
     * @param _expiresAt Expiration timestamp
     */
    function issueCredential(
        bytes32 _credentialHash,
        address _subject,
        uint256 _expiresAt
    ) external {
        require(_credentialHash != bytes32(0), "Invalid credential hash");
        require(_subject != address(0), "Invalid subject address");
        require(_expiresAt > block.timestamp, "Expiration must be in the future");
        require(credentials[_credentialHash].issuedAt == 0, "Credential already exists");
        
        credentials[_credentialHash] = Credential({
            credentialHash: _credentialHash,
            subject: _subject,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            isRevoked: false
        });
        
        // Track credential for subject
        subjectCredentials[_subject].push(_credentialHash);
        
        emit CredentialIssued(_credentialHash, _subject, msg.sender, _expiresAt);
    }
    
    /**
     * @dev Verify if a credential is valid
     * @param _credentialHash Hash of the credential to verify
     * @return True if the credential is valid (exists, not revoked, not expired)
     */
    function verifyCredential(bytes32 _credentialHash) external view returns (bool) {
        Credential memory cred = credentials[_credentialHash];
        
        return cred.issuedAt != 0 &&           // Credential exists
               !cred.isRevoked &&               // Not revoked
               block.timestamp < cred.expiresAt; // Not expired
    }
    
    /**
     * @dev Revoke a credential (only by issuer or subject)
     * @param _credentialHash Hash of the credential to revoke
     */
    function revokeCredential(bytes32 _credentialHash) external {
        Credential storage cred = credentials[_credentialHash];
        
        require(cred.issuedAt != 0, "Credential not found");
        require(!cred.isRevoked, "Credential already revoked");
        require(
            msg.sender == cred.issuer || msg.sender == cred.subject,
            "Only issuer or subject can revoke"
        );
        
        cred.isRevoked = true;
        
        emit CredentialRevoked(_credentialHash, block.timestamp);
    }
    
    /**
     * @dev Get credential details
     * @param _credentialHash Hash of the credential
     * @return The credential data
     */
    function getCredential(bytes32 _credentialHash) external view returns (Credential memory) {
        require(credentials[_credentialHash].issuedAt != 0, "Credential not found");
        return credentials[_credentialHash];
    }
    
    /**
     * @dev Get all credentials for a subject
     * @param _subject Address of the subject
     * @return Array of credential hashes
     */
    function getSubjectCredentials(address _subject) external view returns (bytes32[] memory) {
        return subjectCredentials[_subject];
    }
    
    /**
     * @dev Check if a credential is expired
     * @param _credentialHash Hash of the credential
     * @return True if the credential is expired
     */
    function isExpired(bytes32 _credentialHash) external view returns (bool) {
        Credential memory cred = credentials[_credentialHash];
        require(cred.issuedAt != 0, "Credential not found");
        return block.timestamp >= cred.expiresAt;
    }
    
    /**
     * @dev Check if a credential is revoked
     * @param _credentialHash Hash of the credential
     * @return True if the credential is revoked
     */
    function isRevoked(bytes32 _credentialHash) external view returns (bool) {
        Credential memory cred = credentials[_credentialHash];
        require(cred.issuedAt != 0, "Credential not found");
        return cred.isRevoked;
    }
}
