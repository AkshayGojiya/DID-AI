# Software Requirements Specification (SRS)

## VerifyX - Decentralized Identity Verification System

---

**Version:** 1.0  
**Date:** January 24, 2026  
**Project:** DID-AI (Decentralized Identity with Artificial Intelligence)  
**Prepared By:** VerifyX Development Team  
**Project Repository:** [https://github.com/AkshayGojiya/DID-AI](https://github.com/AkshayGojiya/DID-AI)

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Document Conventions
   - 1.3 Intended Audience
   - 1.4 Project Scope
   - 1.5 References
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective
   - 2.2 Product Functions
   - 2.3 User Classes and Characteristics
   - 2.4 Operating Environment
   - 2.5 Design and Implementation Constraints
   - 2.6 Assumptions and Dependencies
3. [System Features](#3-system-features)
4. [Module Architecture](#4-module-architecture)
   - 4.1 Module Overview
   - 4.2 Core Modules
   - 4.3 Supporting Modules
   - 4.4 Module Dependencies
   - 4.5 Module Interaction Matrix
5. [External Interface Requirements](#5-external-interface-requirements)
   - 5.1 User Interfaces
   - 5.2 Hardware Interfaces
   - 5.3 Software Interfaces
   - 5.4 Communication Interfaces
6. [System Architecture](#6-system-architecture)
7. [Non-Functional Requirements](#7-non-functional-requirements)
   - 7.1 Performance Requirements
   - 7.2 Safety Requirements
   - 7.3 Security Requirements
   - 7.4 Quality Attributes
8. [Data Requirements](#8-data-requirements)
9. [API Specifications](#9-api-specifications)
10. [Appendix](#10-appendix)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the VerifyX Decentralized Identity Verification System. It outlines the functional and non-functional requirements, system architecture, and design constraints for the implementation of an AI-powered, blockchain-based identity verification platform.

The primary purpose is to:
- Define the system's capabilities and features
- Establish clear requirements for development teams
- Provide a reference for testing and validation
- Guide stakeholders in understanding system functionality

### 1.2 Document Conventions

- **Shall/Must**: Indicates mandatory requirements
- **Should**: Indicates recommended requirements
- **May**: Indicates optional requirements
- **DID**: Decentralized Identifier
- **KYC**: Know Your Customer
- **OCR**: Optical Character Recognition
- **IPFS**: InterPlanetary File System
- **AI**: Artificial Intelligence
- **API**: Application Programming Interface

### 1.3 Intended Audience

This document is intended for:
- Software Developers and Engineers
- System Architects
- Quality Assurance Teams
- Project Managers
- Product Owners
- Blockchain Developers
- AI/ML Engineers
- Security Auditors
- Technical Stakeholders

### 1.4 Project Scope

**VerifyX** is an end-to-end decentralized identity verification system that combines artificial intelligence and blockchain technology to provide:

- **Self-Sovereign Identity**: Users own and control their digital identity
- **AI-Powered Verification**: Automated face matching, liveness detection, and document verification
- **Blockchain Security**: Immutable credential storage on Ethereum blockchain
- **Privacy-First Design**: No personal identifiable information (PII) stored on-chain
- **Selective Disclosure**: QR code-based sharing of identity attributes
- **Decentralized Storage**: Encrypted document storage on IPFS

**Out of Scope:**
- Multi-chain blockchain support (Phase 2)
- Zero-Knowledge Proofs implementation (Phase 2)
- Mobile native applications (Phase 2)
- Biometric authentication beyond face verification (Phase 2)

### 1.5 References

- W3C Decentralized Identifiers (DIDs) v1.0
- Ethereum Smart Contract Development Standards
- GDPR Compliance Guidelines
- ISO/IEC 24760-1:2019 (IT Security and Privacy - Identity Management)
- NIST Digital Identity Guidelines (NIST SP 800-63-3)

---

## 2. Overall Description

### 2.1 Product Perspective

VerifyX is a self-contained system comprising four major components:

1. **Frontend Application** (Next.js): User-facing web application
2. **Backend API** (Express.js): API gateway and business logic
3. **AI Service** (Flask): AI/ML microservice for verification
4. **Blockchain Layer** (Ethereum): Decentralized credential registry

The system integrates with:
- **MongoDB**: For metadata and session storage
- **IPFS**: For decentralized document storage
- **MetaMask**: For wallet-based authentication
- **Ethereum Network**: For smart contract deployment

### 2.2 Product Functions

**Primary Functions:**

1. **User Authentication**
   - Wallet-based authentication (MetaMask)
   - Signature-based login without passwords
   - DID generation from wallet address

2. **Document Management**
   - Upload identity documents (Passport, Driver's License, National ID)
   - Encrypted storage on IPFS
   - Document retrieval and management

3. **AI-Powered Verification**
   - Face verification between selfie and document photo
   - Liveness detection to prevent spoofing
   - OCR-based document data extraction
   - Document authenticity validation

4. **Credential Management**
   - Verifiable credential creation
   - Blockchain-based credential storage
   - QR code generation for selective disclosure
   - Credential verification by third parties

5. **Privacy and Security**
   - End-to-end encryption
   - Zero on-chain PII storage
   - User-controlled data access
   - Tamper-proof audit logs

### 2.3 User Classes and Characteristics

**1. Identity Owners (Primary Users)**
- Individuals seeking identity verification
- Technical Skill: Basic to intermediate
- Frequency: Occasional use (initial verification + updates)
- Requires: Web3 wallet (MetaMask)

**2. Verifiers (Organizations)**
- Banks, universities, employers, government agencies
- Technical Skill: Intermediate
- Frequency: Regular use for verification checks
- Requires: API access or web interface

**3. System Administrators**
- Technical support and system maintenance
- Technical Skill: Advanced
- Frequency: Continuous monitoring
- Requires: Backend access and monitoring tools

### 2.4 Operating Environment

**Client-Side Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- MetaMask browser extension installed
- Webcam for liveness detection
- Minimum screen resolution: 1280x720

**Server-Side Requirements:**
- Node.js >= 18.0.0
- Python >= 3.10
- MongoDB >= 5.0
- IPFS node
- Ethereum node or provider (Infura, Alchemy)
- Operating System: Linux/Windows/macOS

**Network Requirements:**
- Internet connectivity
- HTTPS protocol support
- WebRTC support for video streaming

### 2.5 Design and Implementation Constraints

1. **Technology Constraints:**
   - Must use Ethereum-compatible blockchain
   - Face verification accuracy >= 95%
   - Liveness detection accuracy >= 98%
   - OCR accuracy >= 90%

2. **Regulatory Constraints:**
   - GDPR compliance for EU users
   - Data retention policies
   - Right to be forgotten implementation
   - KYC/AML compliance for financial institutions

3. **Security Constraints:**
   - End-to-end encryption mandatory
   - No PII on public blockchain
   - Secure key management
   - Rate limiting on API endpoints

4. **Performance Constraints:**
   - API response time < 500ms (excluding AI processing)
   - AI verification complete within 10 seconds
   - Support 1000 concurrent users
   - 99.5% uptime SLA

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have access to required identity documents
- Users can operate web browsers and browser extensions
- Ethereum network is operational
- IPFS network is accessible
- Internet connectivity is stable

**Dependencies:**
- MetaMask or compatible Web3 wallet
- Ethereum blockchain availability
- IPFS network uptime
- Third-party AI libraries (DeepFace, MediaPipe, Tesseract)
- MongoDB database service
- Cloud hosting infrastructure

---

## 3. System Features

### 3.1 User Authentication and DID Management

**Priority:** High  
**Description:** Wallet-based authentication and decentralized identifier management

**Functional Requirements:**

- **FR-AUTH-001**: System shall support MetaMask wallet connection
- **FR-AUTH-002**: System shall generate a nonce for signature verification
- **FR-AUTH-003**: System shall verify wallet signatures for authentication
- **FR-AUTH-004**: System shall create DID from wallet address (format: `did:ethr:<address>`)
- **FR-AUTH-005**: System shall register DID on blockchain
- **FR-AUTH-006**: System shall retrieve DID documents
- **FR-AUTH-007**: System shall maintain user sessions using JWT tokens
- **FR-AUTH-008**: System shall support wallet disconnection

### 3.2 Document Upload and Storage

**Priority:** High  
**Description:** Secure document upload and decentralized storage

**Functional Requirements:**

- **FR-DOC-001**: System shall accept document uploads (PNG, JPG, PDF)
- **FR-DOC-002**: System shall validate file size (max 16MB)
- **FR-DOC-003**: System shall encrypt documents using AES-256
- **FR-DOC-004**: System shall upload encrypted documents to IPFS
- **FR-DOC-005**: System shall store IPFS hash in database
- **FR-DOC-006**: System shall support document types: Passport, Driver's License, National ID
- **FR-DOC-007**: System shall retrieve documents from IPFS
- **FR-DOC-008**: System shall decrypt documents for authorized users
- **FR-DOC-009**: System shall delete documents upon user request

### 3.3 Face Verification

**Priority:** High  
**Description:** AI-powered face matching between selfie and document photo

**Functional Requirements:**

- **FR-FACE-001**: System shall capture selfie image from webcam
- **FR-FACE-002**: System shall extract face from identity document
- **FR-FACE-003**: System shall compare faces using DeepFace (ArcFace model)
- **FR-FACE-004**: System shall return confidence score (0-1)
- **FR-FACE-005**: System shall determine match with threshold >= 0.80
- **FR-FACE-006**: System shall detect face landmarks
- **FR-FACE-007**: System shall handle multiple faces in image
- **FR-FACE-008**: System shall return processing time and metadata

### 3.4 Liveness Detection

**Priority:** High  
**Description:** Anti-spoofing verification to ensure real person presence

**Functional Requirements:**

- **FR-LIVE-001**: System shall generate random liveness challenges (blink, head turn, smile, nod)
- **FR-LIVE-002**: System shall capture video frames during challenge
- **FR-LIVE-003**: System shall analyze facial movements using MediaPipe
- **FR-LIVE-004**: System shall detect spoofing attempts (photos, videos, masks)
- **FR-LIVE-005**: System shall return liveness confidence score >= 0.95
- **FR-LIVE-006**: System shall timeout challenge after 10 seconds
- **FR-LIVE-007**: System shall support multiple challenge types
- **FR-LIVE-008**: System shall provide real-time feedback during challenge

### 3.5 Document OCR and Validation

**Priority:** High  
**Description:** Extract and validate document information using OCR

**Functional Requirements:**

- **FR-OCR-001**: System shall extract text from document images using Tesseract OCR
- **FR-OCR-002**: System shall parse full name from document
- **FR-OCR-003**: System shall parse date of birth
- **FR-OCR-004**: System shall parse document number
- **FR-OCR-005**: System shall parse nationality
- **FR-OCR-006**: System shall parse expiry date
- **FR-OCR-007**: System shall extract MRZ (Machine Readable Zone) data
- **FR-OCR-008**: System shall validate MRZ checksum
- **FR-OCR-009**: System shall validate date formats
- **FR-OCR-010**: System shall validate expiry date (not expired)
- **FR-OCR-011**: System shall return confidence scores for each field
- **FR-OCR-012**: System shall assess document quality

### 3.6 Complete Verification Pipeline

**Priority:** High  
**Description:** End-to-end verification combining all AI components

**Functional Requirements:**

- **FR-VER-001**: System shall initiate verification session
- **FR-VER-002**: System shall perform face verification
- **FR-VER-003**: System shall perform liveness detection
- **FR-VER-004**: System shall perform document OCR
- **FR-VER-005**: System shall validate document data
- **FR-VER-006**: System shall generate overall verification result (PASSED/FAILED)
- **FR-VER-007**: System shall calculate composite confidence score
- **FR-VER-008**: System shall store verification results
- **FR-VER-009**: System shall generate verification ID
- **FR-VER-010**: System shall log verification attempt

### 3.7 Credential Issuance and Management

**Priority:** High  
**Description:** Create and manage verifiable credentials

**Functional Requirements:**

- **FR-CRED-001**: System shall create verifiable credential after successful verification
- **FR-CRED-002**: System shall hash credential data
- **FR-CRED-003**: System shall store credential hash on blockchain
- **FR-CRED-004**: System shall record blockchain transaction hash
- **FR-CRED-005**: System shall support credential expiry dates
- **FR-CRED-006**: System shall list user credentials
- **FR-CRED-007**: System shall revoke credentials
- **FR-CRED-008**: System shall update credential status

### 3.8 Selective Disclosure and Verification

**Priority:** Medium  
**Description:** Share specific identity attributes via QR code

**Functional Requirements:**

- **FR-DISC-001**: System shall generate QR codes for credentials
- **FR-DISC-002**: System shall allow selection of attributes to share
- **FR-DISC-003**: System shall encode credential data in QR code
- **FR-DISC-004**: System shall verify QR code credentials
- **FR-DISC-005**: System shall validate credential authenticity from blockchain
- **FR-DISC-006**: System shall display verification results to verifier
- **FR-DISC-007**: System shall log verification requests
- **FR-DISC-008**: System shall support time-limited shares

### 3.9 User Dashboard

**Priority:** Medium  
**Description:** User interface for managing identity and credentials

**Functional Requirements:**

- **FR-DASH-001**: System shall display user DID
- **FR-DASH-002**: System shall show verification status
- **FR-DASH-003**: System shall list all credentials
- **FR-DASH-004**: System shall display document upload history
- **FR-DASH-005**: System shall show verification history
- **FR-DASH-006**: System shall provide credential sharing interface
- **FR-DASH-007**: System shall display blockchain transaction history
- **FR-DASH-008**: System shall show IPFS storage usage

### 3.10 Settings and Privacy Controls

**Priority:** Low  
**Description:** User configuration and privacy management

**Functional Requirements:**

- **FR-SET-001**: System shall allow profile updates
- **FR-SET-002**: System shall support document deletion
- **FR-SET-003**: System shall provide data export functionality
- **FR-SET-004**: System shall implement right to be forgotten
- **FR-SET-005**: System shall allow notification preferences
- **FR-SET-006**: System shall support dark/light theme toggle

---

## 4. Module Architecture

### 4.1 Module Overview

The VerifyX system is architected using a modular design approach to ensure scalability, maintainability, and clear separation of concerns. The system comprises **15 core and supporting modules** that work together to deliver a comprehensive decentralized identity verification platform.

**Module Classification:**

- **Core Modules (1-7)**: Essential business logic and primary functionality
- **Supporting Modules (8-15)**: Infrastructure, utilities, and cross-cutting concerns

**Design Principles:**

- **Loose Coupling**: Modules interact through well-defined interfaces
- **High Cohesion**: Each module has a single, focused responsibility
- **Dependency Injection**: Dependencies are injected, not hardcoded
- **Interface Segregation**: Modules expose minimal required interfaces
- **Single Responsibility**: Each module handles one aspect of the system

---

### 4.2 Core Modules

#### **Module 1: User Authentication & Wallet Integration Module**

**Module ID:** MOD-AUTH-001  
**Priority:** High  
**Owner:** Backend Team  
**Status:** Active

**Purpose:**  
Provides secure, passwordless authentication using Web3 wallets (MetaMask) and cryptographic signatures. Manages user sessions and authentication state across the application.

**Components:**
- Wallet connection handler
- Nonce generator and validator
- Signature verification engine
- JWT token issuer and validator
- Session manager
- Authentication middleware

**Sub-modules:**
- **1.1 Wallet Connection Service**: Handles MetaMask integration and wallet connectivity
- **1.2 Signature Verification Service**: Validates cryptographic signatures for authentication
- **1.3 Session Management Service**: Manages user sessions using JWT tokens
- **1.4 Authentication Middleware**: Protects routes and validates authentication state

**Key Technologies:**
- Ethers.js for Web3 integration
- JSON Web Tokens (JWT) for session management
- Node.js crypto module for nonce generation

**Interfaces:**
- **Input**: Wallet address, signed message
- **Output**: JWT token, user session data
- **Dependencies**: Module 2 (DID Management)

**Functional Requirements Mapping:**
- FR-AUTH-001 to FR-AUTH-008

---

#### **Module 2: Decentralized Identifier (DID) Management Module**

**Module ID:** MOD-DID-002  
**Priority:** High  
**Owner:** Blockchain Team  
**Status:** Active

**Purpose:**  
Creates, registers, and manages Decentralized Identifiers (DIDs) conforming to W3C DID standards. Provides DID resolution and document management capabilities.

**Components:**
- DID generator (did:ethr format)
- DID document creator
- DID registry contract interface
- DID resolver
- DID document updater
- DID status manager

**Sub-modules:**
- **2.1 DID Generator Service**: Creates unique DIDs from wallet addresses
- **2.2 DID Registry Smart Contract Interface**: Interacts with blockchain DID registry
- **2.3 DID Document Manager**: Creates and manages DID documents
- **2.4 DID Resolution Service**: Resolves DIDs to documents

**Key Technologies:**
- W3C DID specification
- Ethereum blockchain
- Solidity smart contracts
- Ethers.js

**Interfaces:**
- **Input**: Wallet address, public key
- **Output**: DID string, DID document
- **Dependencies**: Module 1 (Authentication), Module 7 (Blockchain Integration)

**Functional Requirements Mapping:**
- FR-AUTH-004 to FR-AUTH-006

**Data Model:**
```javascript
DIDDocument {
  id: "did:ethr:0x...",
  controller: "0x...",
  publicKey: "...",
  createdAt: Date,
  isActive: Boolean
}
```

---

#### **Module 3: Document Management Module**

**Module ID:** MOD-DOC-003  
**Priority:** High  
**Owner:** Backend Team  
**Status:** Active

**Purpose:**  
Handles secure upload, encryption, storage, retrieval, and deletion of identity documents. Integrates with IPFS for decentralized storage.

**Components:**
- File upload handler (Multer middleware)
- Document validator (format, size, type)
- Document preprocessor
- Encryption engine (AES-256)
- IPFS uploader
- Document retrieval service
- Decryption engine
- Document deletion service

**Sub-modules:**
- **3.1 File Upload Handler**: Processes multipart/form-data uploads
- **3.2 Document Encryption Service**: Encrypts documents using AES-256
- **3.3 IPFS Storage Service**: Uploads and retrieves from IPFS
- **3.4 Document Repository**: MongoDB storage for metadata
- **3.5 File Validation Service**: Validates file type, size, and quality

**Key Technologies:**
- Multer for file uploads
- Node.js crypto for encryption
- IPFS HTTP API
- MongoDB for metadata

**Interfaces:**
- **Input**: Document file (PNG, JPG, PDF), document type
- **Output**: IPFS hash, encryption key, document ID
- **Dependencies**: Module 10 (Storage Module)

**Functional Requirements Mapping:**
- FR-DOC-001 to FR-DOC-009

**Supported Document Types:**
- Passport
- Driver's License
- National ID Card
- Residence Permit

**Storage Flow:**
```
Upload → Validate → Encrypt → IPFS → Store Metadata → Return Hash
```

---

#### **Module 4: AI-Powered Verification Module**

**Module ID:** MOD-AI-004  
**Priority:** High  
**Owner:** AI/ML Team  
**Status:** Active

**Purpose:**  
Provides artificial intelligence-powered identity verification through face matching, liveness detection, OCR extraction, and document validation.

**Components:**
- Face verification engine (DeepFace)
- Liveness detection engine (MediaPipe)
- OCR engine (Tesseract)
- Image preprocessing pipeline
- Document authenticity validator
- Verification orchestrator
- Confidence scoring engine

**Sub-modules:**
- **4.1 Face Verification Service**: Compares selfie with document photo using DeepFace
- **4.2 Liveness Detection Service**: Detects real person vs. spoofing using MediaPipe
- **4.3 OCR Extraction Service**: Extracts text from documents using Tesseract
- **4.4 Document Validation Service**: Validates extracted data and document authenticity
- **4.5 Verification Pipeline Orchestrator**: Coordinates all verification steps

**Key Technologies:**
- DeepFace (ArcFace model)
- MediaPipe Face Mesh
- Tesseract OCR
- OpenCV for image processing
- Flask Python microservice

**Interfaces:**
- **Input**: Document image, selfie image, video frames
- **Output**: Verification results, confidence scores, extracted data
- **Dependencies**: Module 3 (Document Management)

**Functional Requirements Mapping:**
- FR-FACE-001 to FR-FACE-008 (Face Verification)
- FR-LIVE-001 to FR-LIVE-008 (Liveness Detection)
- FR-OCR-001 to FR-OCR-012 (OCR)
- FR-VER-001 to FR-VER-010 (Complete Verification)

**AI Models:**
- **Face Recognition**: DeepFace with ArcFace model (95%+ accuracy)
- **Liveness Detection**: MediaPipe Face Mesh with custom logic (98%+ accuracy)
- **OCR**: Tesseract 5.0 with LSTM engine (90%+ accuracy)

**Verification Thresholds:**
- Face Match: ≥ 0.80 confidence
- Liveness: ≥ 0.95 confidence
- OCR: ≥ 0.70 per field

---

#### **Module 5: Credential Management Module**

**Module ID:** MOD-CRED-005  
**Priority:** High  
**Owner:** Backend + Blockchain Team  
**Status:** Active

**Purpose:**  
Creates, issues, stores, retrieves, and manages verifiable credentials after successful identity verification. Handles credential lifecycle including revocation.

**Components:**
- Credential issuer
- Credential hasher (SHA-256)
- Blockchain credential writer
- Credential retriever
- Credential revocation manager
- Credential status tracker
- Expiry manager

**Sub-modules:**
- **5.1 Credential Issuer Service**: Creates verifiable credentials
- **5.2 Credential Registry Smart Contract Interface**: Stores credentials on blockchain
- **5.3 Credential Validator**: Validates credential authenticity
- **5.4 Credential Repository**: MongoDB storage for credential metadata
- **5.5 Credential Revocation Manager**: Handles credential revocation

**Key Technologies:**
- W3C Verifiable Credentials standard
- SHA-256 hashing
- Ethereum blockchain
- MongoDB

**Interfaces:**
- **Input**: Verification results, user DID, attributes
- **Output**: Credential object, blockchain transaction hash
- **Dependencies**: Module 2 (DID), Module 4 (Verification), Module 7 (Blockchain)

**Functional Requirements Mapping:**
- FR-CRED-001 to FR-CRED-008

**Credential Schema:**
```javascript
{
  credentialId: "cred_123",
  issuer: "did:ethr:0x...",
  subject: "did:ethr:0x...",
  type: "IdentityCredential",
  claims: {
    fullName: "...",
    dateOfBirth: "...",
    nationality: "..."
  },
  issuedAt: Date,
  expiresAt: Date,
  proof: {
    type: "EcdsaSecp256k1Signature2019",
    created: Date,
    proofPurpose: "assertionMethod",
    verificationMethod: "did:ethr:0x...#key-1",
    jws: "..."
  }
}
```

---

#### **Module 6: Selective Disclosure & QR Code Module**

**Module ID:** MOD-QR-006  
**Priority:** Medium  
**Owner:** Frontend + Backend Team  
**Status:** Active

**Purpose:**  
Enables users to share specific identity attributes with verifiers through QR codes, supporting privacy-preserving selective disclosure.

**Components:**
- QR code generator
- Attribute selector
- QR code encoder/decoder
- Share link generator
- Time-limited share manager
- Verification interface
- Access logger

**Sub-modules:**
- **6.1 QR Code Generator Service**: Creates QR codes from credential data
- **6.2 Attribute Selector**: UI component for selecting attributes to share
- **6.3 QR Code Verification Service**: Verifies credentials from scanned QR codes
- **6.4 Share Management Service**: Manages share permissions and expiry

**Key Technologies:**
- QRCode.js library
- Base64 encoding
- JWT for time-limited shares
- React for UI components

**Interfaces:**
- **Input**: Credential ID, selected attributes, expiry time
- **Output**: QR code image, share URL, verification result
- **Dependencies**: Module 5 (Credential Management)

**Functional Requirements Mapping:**
- FR-DISC-001 to FR-DISC-008

**Selective Disclosure Example:**
```
Full Credential: {name, dob, nationality, address}
Shared Attributes: {age > 18, nationality}
```

---

#### **Module 7: Blockchain Integration Module**

**Module ID:** MOD-BLOCKCHAIN-007  
**Priority:** High  
**Owner:** Blockchain Team  
**Status:** Active

**Purpose:**  
Provides unified interface for all blockchain interactions including smart contract deployment, transaction management, and event listening.

**Components:**
- Smart contract deployer
- Contract interaction layer
- Transaction builder
- Transaction signer
- Gas optimizer
- Event listener
- Multi-network manager
- Block explorer integration

**Sub-modules:**
- **7.1 DID Registry Contract**: Solidity contract for DID management
- **7.2 Credential Registry Contract**: Solidity contract for credential storage
- **7.3 Blockchain Service Layer**: Abstraction layer for blockchain operations
- **7.4 Transaction Manager**: Handles transaction lifecycle
- **7.5 Event Listener Service**: Listens for blockchain events

**Key Technologies:**
- Solidity (^0.8.0)
- Hardhat development framework
- Ethers.js v6
- Ethereum (Sepolia testnet / Mainnet)

**Interfaces:**
- **Input**: Contract method calls, transaction data
- **Output**: Transaction hashes, event data, contract state
- **Dependencies**: Module 2 (DID), Module 5 (Credentials)

**Smart Contracts:**

**DIDRegistry.sol:**
```solidity
function registerDID(string memory publicKey) external
function deactivateDID() external
function getDID(address _address) external view returns (DIDDocument)
```

**CredentialRegistry.sol:**
```solidity
function issueCredential(bytes32 credentialHash, uint256 expiresAt) external
function revokeCredential(bytes32 credentialHash) external
function verifyCredential(bytes32 credentialHash) external view returns (Credential)
```

**Gas Optimization:**
- Batch operations where possible
- Optimized storage patterns
- Event emission for off-chain indexing

---

### 4.3 Supporting Modules

#### **Module 8: User Dashboard & Interface Module**

**Module ID:** MOD-UI-008  
**Priority:** Medium  
**Owner:** Frontend Team  
**Status:** Active

**Purpose:**  
Provides user-facing web interface for all system operations including landing page, dashboard, verification flow, and settings.

**Components:**
- Landing page
- User dashboard
- Verification wizard
- Credential gallery
- Activity feed
- Settings panel
- Navigation system
- Responsive layout system

**Sub-modules:**
- **8.1 Landing Page Component**: Marketing and onboarding
- **8.2 Dashboard Component**: User overview and stats
- **8.3 Verification Wizard Component**: Step-by-step verification flow
- **8.4 Credential Gallery Component**: Display and manage credentials
- **8.5 Settings Component**: User preferences and privacy controls

**Key Technologies:**
- Next.js 16 with App Router
- React 19
- TypeScript
- Framer Motion (animations)
- Tailwind CSS (if needed) or vanilla CSS

**Interfaces:**
- **Input**: User interactions, form data
- **Output**: UI state changes, API calls
- **Dependencies**: All backend modules via API Gateway

**Functional Requirements Mapping:**
- FR-DASH-001 to FR-DASH-008
- FR-SET-001 to FR-SET-006

**Page Structure:**
```
/                 → Landing Page
/dashboard        → User Dashboard
/verify           → Verification Flow
/credentials      → Credential Management
/scan             → QR Scanner
/settings         → User Settings
/activity         → Activity Logs
```

---

#### **Module 9: Security & Privacy Module**

**Module ID:** MOD-SEC-009  
**Priority:** High  
**Owner:** Security Team  
**Status:** Active

**Purpose:**  
Implements cross-cutting security concerns including encryption, access control, input validation, and privacy compliance.

**Components:**
- Encryption/decryption engine
- Access control manager
- Input sanitizer
- Rate limiter
- CORS handler
- XSS/CSRF protection
- Security headers middleware
- Privacy compliance manager
- Audit logger

**Sub-modules:**
- **9.1 Encryption Service**: AES-256 encryption for sensitive data
- **9.2 Access Control Service**: Role-based and attribute-based access control
- **9.3 Security Middleware**: Express middleware for security headers
- **9.4 Privacy Compliance Manager**: GDPR/CCPA compliance features
- **9.5 Audit Logger**: Comprehensive audit trail

**Key Technologies:**
- Node.js crypto module
- Helmet.js for security headers
- Express-rate-limit
- CORS middleware
- DOMPurify for XSS protection

**Interfaces:**
- **Input**: Data to encrypt, requests to validate
- **Output**: Encrypted data, security headers, audit logs
- **Dependencies**: All modules (cross-cutting concern)

**Security Measures:**
- TLS 1.3 for all communications
- AES-256-GCM for data encryption
- Rate limiting: 100 requests/min per IP
- JWT expiry: 24 hours
- CORS: Whitelist frontend origin only
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)

**Privacy Features:**
- Right to access (data export)
- Right to erasure (delete documents)
- Right to rectification (update data)
- Data minimization
- Purpose limitation
- Storage limitation

---

#### **Module 10: Data Storage & Persistence Module**

**Module ID:** MOD-STORAGE-010  
**Priority:** High  
**Owner:** Backend Team  
**Status:** Active

**Purpose:**  
Manages all data persistence across MongoDB, IPFS, and blockchain, providing unified data access layer.

**Components:**
- MongoDB connection manager
- Mongoose model definitions
- IPFS node connection
- Database migration tools
- Backup manager
- Cache layer (Redis - future)
- Connection pool manager

**Sub-modules:**
- **10.1 User Data Repository**: User accounts and metadata
- **10.2 Document Repository**: Document metadata and references
- **10.3 Verification Repository**: Verification results and logs
- **10.4 IPFS Storage Service**: Decentralized file storage
- **10.5 Database Connection Manager**: Connection pooling and failover

**Key Technologies:**
- MongoDB 5.0+
- Mongoose ODM
- IPFS (Kubo)
- MongoDB Atlas (production)

**Interfaces:**
- **Input**: Data objects, queries
- **Output**: Persisted data, query results
- **Dependencies**: All modules requiring data persistence

**Data Models:**
- User Model
- Document Model
- Verification Model
- Credential Model
- Session Model
- Audit Log Model

**Storage Strategy:**
| Data Type | Storage | Encryption | Backup |
|-----------|---------|------------|--------|
| User Metadata | MongoDB | No | Daily |
| Documents | IPFS | AES-256 | Pinned |
| Credentials | MongoDB + Blockchain | Hash only on-chain | Daily |
| Sessions | MongoDB | No | None |
| Audit Logs | MongoDB | No | Weekly |

---

#### **Module 11: API Gateway & Integration Module**

**Module ID:** MOD-API-011  
**Priority:** High  
**Owner:** Backend Team  
**Status:** Active

**Purpose:**  
Provides unified REST API gateway for all client-server communication with request validation, routing, and response formatting.

**Components:**
- Express.js router
- Request validator (Joi/Zod)
- Response formatter
- Error handler
- API versioning system
- Rate limiter
- Request logger
- CORS middleware

**Sub-modules:**
- **11.1 Authentication Routes**: /api/v1/auth/*
- **11.2 DID Routes**: /api/v1/did/*
- **11.3 Document Routes**: /api/v1/documents/*
- **11.4 Verification Routes**: /api/v1/verification/*
- **11.5 Credential Routes**: /api/v1/credentials/*
- **11.6 Middleware Stack**: Authentication, validation, logging

**Key Technologies:**
- Express.js 5.x
- Joi for validation
- Morgan for logging
- Express-async-errors

**Interfaces:**
- **Input**: HTTP requests
- **Output**: JSON responses
- **Dependencies**: All backend modules

**API Structure:**
```
/api/v1/auth/*          → Authentication endpoints
/api/v1/did/*           → DID management
/api/v1/documents/*     → Document operations
/api/v1/verification/*  → Verification endpoints
/api/v1/credentials/*   → Credential management
/api/v1/health          → Health check
```

**Middleware Pipeline:**
```
Request → CORS → Rate Limit → Auth → Validation → Route → Response
```

---

#### **Module 12: Notification & Communication Module**

**Module ID:** MOD-NOTIF-012  
**Priority:** Low  
**Owner:** Backend Team  
**Status:** Planned

**Purpose:**  
Handles user notifications, alerts, and real-time communication for verification status updates.

**Components:**
- Email service
- In-app notification manager
- WebSocket server (future)
- Notification queue
- Template engine
- Push notification service (future)

**Sub-modules:**
- **12.1 Email Service**: Transactional emails via SendGrid/AWS SES
- **12.2 Notification Manager**: In-app notification system
- **12.3 WebSocket Service**: Real-time updates (planned)
- **12.4 Alert System**: Critical system alerts

**Key Technologies:**
- Nodemailer
- SendGrid / AWS SES
- Socket.io (planned)
- Bull queue (planned)

**Notification Types:**
- Verification started
- Verification completed
- Credential issued
- Credential expiring soon
- Security alerts

---

#### **Module 13: Analytics & Monitoring Module**

**Module ID:** MOD-ANALYTICS-013  
**Priority:** Medium  
**Owner:** DevOps Team  
**Status:** Active

**Purpose:**  
Monitors system health, tracks performance metrics, provides analytics, and enables observability.

**Components:**
- Health check endpoints
- Performance metrics collector
- Usage analytics tracker
- Error tracking service
- Audit log analyzer
- Compliance reporter
- Dashboard visualizations

**Sub-modules:**
- **13.1 Health Check Service**: System uptime and component health
- **13.2 Analytics Service**: User and usage analytics
- **13.3 Error Tracking Service**: Error logging and alerting
- **13.4 Audit Logger**: Compliance and security logs
- **13.5 Compliance Reporter**: GDPR/regulatory reports

**Key Technologies:**
- Winston for logging
- Prometheus (planned)
- Grafana (planned)
- Sentry (error tracking)

**Metrics Tracked:**
- API response times
- Verification success rates
- System uptime
- Error rates
- User activity
- Blockchain transaction costs

---

#### **Module 14: Admin & Management Module**

**Module ID:** MOD-ADMIN-014  
**Priority:** Low  
**Owner:** Backend Team  
**Status:** Planned

**Purpose:**  
Provides administrative interface for system management, user support, and configuration.

**Components:**
- Admin dashboard
- User management interface
- System configuration panel
- Verification review tool
- Support ticketing system
- Report generator
- System diagnostics

**Sub-modules:**
- **14.1 Admin Dashboard**: Overview and controls
- **14.2 User Management Service**: User administration
- **14.3 System Configuration Manager**: Environment and settings
- **14.4 Support Ticket System**: User support (future)

**Access Control:**
- Role: Admin
- Permissions: Full system access
- Authentication: Separate admin credentials

---

#### **Module 15: Testing & Quality Assurance Module**

**Module ID:** MOD-TEST-015  
**Priority:** Medium  
**Owner:** QA Team  
**Status:** Active

**Purpose:**  
Ensures code quality through comprehensive testing at unit, integration, E2E, and performance levels.

**Components:**
- Unit test suite
- Integration test suite
- E2E test suite
- Performance test suite
- Security test suite
- Test fixtures and mocks
- CI/CD test automation

**Sub-modules:**
- **15.1 Unit Test Suite**: Jest/Mocha tests
- **15.2 Integration Test Suite**: API and service tests
- **15.3 E2E Test Suite**: Playwright/Cypress tests
- **15.4 Performance Test Suite**: Load and stress tests

**Key Technologies:**
- Jest (unit tests)
- Supertest (API tests)
- Playwright (E2E tests)
- K6 (performance tests)

**Test Coverage Targets:**
- Unit tests: ≥ 80%
- Integration tests: Critical paths
- E2E tests: Main user flows
- Performance: Response time benchmarks

---

### 4.4 Module Dependencies

**Module Dependency Graph:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Module Dependency Flow                       │
└─────────────────────────────────────────────────────────────────┘

┌───────────┐
│  Module 8 │ User Dashboard & Interface
│  (UI)     │
└─────┬─────┘
      │ (calls all modules via API)
      ▼
┌───────────┐
│ Module 11 │ API Gateway
│ (API)     │
└─────┬─────┘
      │
      ├──────────────────┬──────────────────┬──────────────────┐
      ▼                  ▼                  ▼                  ▼
┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐
│  Module 1 │      │  Module 3 │      │  Module 5 │      │  Module 6 │
│   Auth    │      │   Docs    │      │   Creds   │      │    QR     │
└─────┬─────┘      └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  │
┌───────────┐      ┌───────────┐      ┌───────────┐          │
│  Module 2 │      │  Module 4 │      │  Module 7 │          │
│    DID    │      │    AI     │      │Blockchain │          │
└─────┬─────┘      └─────┬─────┘      └───────────┘          │
      │                  │                                    │
      └──────────────────┴────────────────────────────────────┘
                         │
                         ▼
                  ┌───────────┐
                  │ Module 10 │ Storage & Persistence
                  │ (Storage) │
                  └───────────┘

Cross-Cutting Modules (used by all):
- Module 9: Security & Privacy
- Module 13: Analytics & Monitoring
```

**Direct Dependencies:**

| Module | Depends On |
|--------|-----------|
| Module 1 (Auth) | Module 2 (DID), Module 10 (Storage) |
| Module 2 (DID) | Module 7 (Blockchain), Module 10 (Storage) |
| Module 3 (Docs) | Module 10 (Storage), Module 9 (Security) |
| Module 4 (AI) | Module 3 (Docs) |
| Module 5 (Creds) | Module 2 (DID), Module 4 (AI), Module 7 (Blockchain) |
| Module 6 (QR) | Module 5 (Creds) |
| Module 7 (Blockchain) | None (infrastructure) |
| Module 8 (UI) | Module 11 (API) |
| Module 9 (Security) | None (cross-cutting) |
| Module 10 (Storage) | None (infrastructure) |
| Module 11 (API) | All business modules (1-7) |
| Module 12 (Notif) | Module 10 (Storage) |
| Module 13 (Analytics) | None (cross-cutting) |
| Module 14 (Admin) | All modules |
| Module 15 (Testing) | All modules |

---

### 4.5 Module Interaction Matrix

**Module Communication Patterns:**

| From / To | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 |
|-----------|----|----|----|----|----|----|----|----|----|----|-----|
| **M1** Auth | - | ✓ | - | - | - | - | - | - | ✓ | ✓ | - |
| **M2** DID | - | - | - | - | - | - | ✓ | - | ✓ | ✓ | - |
| **M3** Docs | - | - | - | ✓ | - | - | - | - | ✓ | ✓ | - |
| **M4** AI | - | - | ✓ | - | ✓ | - | - | - | - | ✓ | - |
| **M5** Creds | - | ✓ | - | - | - | - | ✓ | - | ✓ | ✓ | - |
| **M6** QR | - | - | - | - | ✓ | - | - | - | - | ✓ | - |
| **M7** Blockchain | - | ✓ | - | - | ✓ | - | - | - | - | - | - |
| **M8** UI | - | - | - | - | - | - | - | - | - | - | ✓ |
| **M11** API | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | - | - | - |

**Legend:**
- ✓ = Direct interaction/dependency
- \- = No direct interaction

**Communication Protocols:**

1. **Synchronous REST API**: Frontend ↔ Backend
2. **Asynchronous Events**: Blockchain → Backend
3. **HTTP Internal**: Backend ↔ AI Service
4. **Direct Library Calls**: Modules within same process
5. **Database Queries**: Modules ↔ Storage Module

**Data Flow Example (Complete Verification):**

```
1. User (M8) → Upload Document → API Gateway (M11)
2. API Gateway (M11) → Authenticate → Auth Module (M1)
3. Auth Module (M1) → Validate DID → DID Module (M2)
4. API Gateway (M11) → Store Document → Doc Module (M3)
5. Doc Module (M3) → Encrypt & Upload → IPFS (M10)
6. API Gateway (M11) → Start Verification → AI Module (M4)
7. AI Module (M4) → Face/Liveness/OCR → Return Results
8. API Gateway (M11) → Create Credential → Cred Module (M5)
9. Cred Module (M5) → Store on Blockchain → Blockchain Module (M7)
10. Blockchain Module (M7) → Return TX Hash
11. Cred Module (M5) → Store Metadata → Storage Module (M10)
12. API Gateway (M11) → Return Success → User (M8)
```

**Error Handling Flow:**

```
Error Occurs → Security Module (M9) → Log to Analytics (M13)
              → Return to API Gateway (M11)
              → Format Error Response
              → Send to UI (M8)
```

---

**Module Integration Points:**

| Integration Point | Modules Involved | Protocol | Data Format |
|------------------|------------------|----------|-------------|
| Wallet Auth | M1, M8 | Web3 Provider | JSON-RPC |
| Document Upload | M3, M8, M11 | HTTP Multipart | Binary + JSON |
| AI Verification | M4, M11 | HTTP REST | JSON (Base64 images) |
| Blockchain Write | M7, M2, M5 | Ethers.js | ABI-encoded |
| QR Generation | M6, M5 | Internal | Base64 |
| Data Persistence | M10, All | Mongoose/IPFS API | BSON/Binary |

---

**Module Development Roadmap:**

| Phase | Modules | Status |
|-------|---------|--------|
| **Phase 1 (Core)** | M1, M2, M3, M7, M10, M11 | ✅ Complete |
| **Phase 2 (AI)** | M4 | ✅ Complete |
| **Phase 3 (Credentials)** | M5, M6 | ✅ Complete |
| **Phase 4 (UI)** | M8 | ✅ Complete |
| **Phase 5 (Security)** | M9, M13 | 🔄 In Progress |
| **Phase 6 (Advanced)** | M12, M14, M15 | 📋 Planned |

---

## 5. External Interface Requirements

### 5.1 User Interfaces

**UI-001: Landing Page**
- Hero section with system overview
- Feature highlights
- Call-to-action buttons
- Responsive design for mobile/tablet/desktop
- Dark theme with modern aesthetics

**UI-002: Authentication**
- MetaMask connection button
- Wallet address display
- Network selection
- Connection status indicator

**UI-003: Verification Flow**
- Step-by-step wizard interface
- Document upload interface with drag-and-drop
- Webcam capture for selfie
- Liveness check interface with real-time feedback
- Progress indicators
- Success/failure result screens

**UI-004: Dashboard**
- Navigation menu
- DID display
- Credentials list with cards
- Verification status badges
- Quick action buttons
- Statistics and charts

**UI-005: QR Code Display**
- QR code generator
- Attribute selection checkboxes
- Share link generation
- Copy to clipboard functionality

**UI-006: Settings Page**
- Profile information form
- Privacy controls
- Theme selector
- Language preferences
- Data management options

### 5.2 Hardware Interfaces

**HW-001: Webcam**
- Interface: WebRTC API
- Purpose: Capture selfie and liveness video
- Requirements: 720p minimum resolution, 30fps

**HW-002: Document Scanner (Optional)**
- Interface: File upload or scanning APIs
- Purpose: High-quality document capture
- Requirements: 300 DPI minimum

### 5.3 Software Interfaces

**SW-001: MetaMask Wallet**
- Interface: Web3 Provider API
- Purpose: Wallet authentication and transaction signing
- Version: Latest stable

**SW-002: MongoDB Database**
- Interface: Mongoose ODM
- Purpose: Metadata and session storage
- Version: >= 5.0
- Connection: MongoDB URI with authentication

**SW-003: IPFS Network**
- Interface: IPFS HTTP API
- Purpose: Decentralized document storage
- Version: Latest stable
- Connection: Local node or Pinata/Infura gateway

**SW-004: Ethereum Blockchain**
- Interface: Ethers.js library
- Purpose: Smart contract interaction
- Network: Ethereum Mainnet / Sepolia Testnet
- Provider: Infura, Alchemy, or local node

**SW-005: AI Libraries**
- DeepFace (Face Verification)
- MediaPipe (Liveness Detection)
- Tesseract OCR (Document Extraction)
- OpenCV (Image Processing)

### 5.4 Communication Interfaces

**COM-001: HTTP/HTTPS Protocol**
- RESTful API communication
- JSON data format
- TLS 1.3 encryption
- CORS enabled for frontend origin

**COM-002: WebSocket (Future)**
- Real-time verification status updates
- Live liveness check feedback

**COM-003: IPFS Protocol**
- InterPlanetary File System protocol
- Content addressing
- P2P file transfer

**COM-004: Ethereum JSON-RPC**
- Blockchain interaction
- Smart contract calls
- Transaction broadcasting

---

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                         │
│                     Port: 3000                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Landing    │  │  Dashboard   │  │   Verify     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Backend API (Express.js)                        │
│                     Port: 5000                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │   DID    │  │Documents │  │Credentials│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│ AI Service│  │  MongoDB  │  │   IPFS    │  │ Ethereum  │
│   :8000   │  │  :27017   │  │   :5001   │  │ Blockchain│
└───────────┘  └───────────┘  └───────────┘  └───────────┘
```

### 6.2 Component Architecture

**Frontend Layer:**
- Next.js 16 with App Router
- React 19
- TypeScript
- Framer Motion (animations)
- Ethers.js (Web3 integration)
- Axios (HTTP client)

**Backend Layer:**
- Express.js API Gateway
- JWT authentication
- Multer file uploads
- Winston logging
- Helmet security
- CORS middleware
- Rate limiting

**AI Service Layer:**
- Flask microservice
- DeepFace for face verification
- MediaPipe for liveness
- Tesseract for OCR
- OpenCV for image processing

**Blockchain Layer:**
- Solidity smart contracts
- DIDRegistry contract
- CredentialRegistry contract
- Hardhat development framework

**Storage Layer:**
- MongoDB: User metadata, sessions, verification logs
- IPFS: Encrypted documents
- Blockchain: Credential hashes, DID records

### 6.3 Data Flow

**Verification Flow:**
1. User uploads document → Frontend
2. Frontend sends to Backend API
3. Backend encrypts and stores on IPFS
4. Backend forwards to AI Service
5. AI Service performs verification
6. Results returned to Backend
7. Backend creates credential hash
8. Hash stored on blockchain via smart contract
9. Transaction hash returned to Frontend
10. User sees verification complete

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

- **NFR-PERF-001**: API endpoints shall respond within 500ms (excluding AI processing)
- **NFR-PERF-002**: AI face verification shall complete within 5 seconds
- **NFR-PERF-003**: Liveness detection shall complete within 10 seconds
- **NFR-PERF-004**: OCR extraction shall complete within 3 seconds
- **NFR-PERF-005**: System shall support 1000 concurrent users
- **NFR-PERF-006**: Database queries shall execute within 100ms
- **NFR-PERF-007**: File uploads up to 16MB shall complete within 30 seconds
- **NFR-PERF-008**: Page load time shall be under 2 seconds

### 7.2 Safety Requirements

- **NFR-SAFE-001**: System shall backup data daily
- **NFR-SAFE-002**: System shall implement disaster recovery plan
- **NFR-SAFE-003**: System shall log all critical operations
- **NFR-SAFE-004**: System shall validate all inputs
- **NFR-SAFE-005**: System shall handle errors gracefully without data loss

### 7.3 Security Requirements

- **NFR-SEC-001**: All communications shall use HTTPS/TLS 1.3
- **NFR-SEC-002**: Documents shall be encrypted with AES-256
- **NFR-SEC-003**: No PII shall be stored on blockchain
- **NFR-SEC-004**: API endpoints shall implement rate limiting (100 req/min)
- **NFR-SEC-005**: JWT tokens shall expire after 24 hours
- **NFR-SEC-006**: Passwords shall never be stored (wallet-based auth only)
- **NFR-SEC-007**: System shall implement CORS protection
- **NFR-SEC-008**: System shall sanitize all inputs against XSS
- **NFR-SEC-009**: System shall protect against CSRF attacks
- **NFR-SEC-010**: System shall implement Content Security Policy
- **NFR-SEC-011**: Smart contracts shall be audited before deployment
- **NFR-SEC-012**: Private keys shall never leave client browser

### 7.4 Quality Attributes

**Reliability:**
- **NFR-REL-001**: System uptime shall be 99.5%
- **NFR-REL-002**: Mean time between failures (MTBF) >= 720 hours
- **NFR-REL-003**: Mean time to recovery (MTTR) <= 1 hour

**Scalability:**
- **NFR-SCALE-001**: System shall scale horizontally
- **NFR-SCALE-002**: Architecture shall support microservices deployment
- **NFR-SCALE-003**: Database shall support sharding

**Maintainability:**
- **NFR-MAINT-001**: Code shall follow ESLint/Prettier standards
- **NFR-MAINT-002**: Code coverage shall be >= 80%
- **NFR-MAINT-003**: Documentation shall be updated with each release
- **NFR-MAINT-004**: APIs shall be versioned (v1, v2, etc.)

**Usability:**
- **NFR-USE-001**: System shall be accessible (WCAG 2.1 Level AA)
- **NFR-USE-002**: UI shall be responsive for mobile/tablet/desktop
- **NFR-USE-003**: Error messages shall be user-friendly
- **NFR-USE-004**: System shall provide inline help

**Portability:**
- **NFR-PORT-001**: Frontend shall work on Chrome, Firefox, Safari, Edge
- **NFR-PORT-002**: System shall support Docker deployment
- **NFR-PORT-003**: Backend shall be OS-agnostic (Linux/Windows/macOS)

---

## 8. Data Requirements

### 8.1 Data Models

**User Model (MongoDB):**
```javascript
{
  walletAddress: String,
  did: String,
  publicKey: String,
  createdAt: Date,
  lastLogin: Date,
  verificationStatus: String,
  credentialIds: [String]
}
```

**Document Model (MongoDB):**
```javascript
{
  userId: ObjectId,
  type: String, // 'passport' | 'driver_license' | 'national_id'
  ipfsHash: String,
  encryptionKey: String (encrypted),
  status: String, // 'uploaded' | 'verified' | 'rejected'
  uploadedAt: Date,
  verifiedAt: Date
}
```

**Verification Model (MongoDB):**
```javascript
{
  userId: ObjectId,
  documentId: ObjectId,
  status: String,
  faceVerification: {
    match: Boolean,
    confidence: Number,
    model: String
  },
  livenessDetection: {
    isLive: Boolean,
    confidence: Number,
    challenge: String
  },
  documentOCR: {
    extracted: Boolean,
    data: Object,
    confidence: Object
  },
  credentialHash: String,
  blockchainTxHash: String,
  createdAt: Date,
  completedAt: Date
}
```

**Credential Model (MongoDB):**
```javascript
{
  userId: ObjectId,
  verificationId: ObjectId,
  type: String,
  status: String, // 'active' | 'revoked' | 'expired'
  attributes: [String],
  hash: String,
  blockchainTxHash: String,
  issuedAt: Date,
  expiresAt: Date
}
```

### 8.2 Smart Contract Data

**DIDRegistry.sol:**
```solidity
struct DIDDocument {
    address controller;
    string publicKey;
    uint256 createdAt;
    bool isActive;
}

mapping(address => DIDDocument) public dids;
```

**CredentialRegistry.sol:**
```solidity
struct Credential {
    bytes32 credentialHash;
    address issuer;
    address subject;
    uint256 issuedAt;
    uint256 expiresAt;
    bool isRevoked;
}

mapping(bytes32 => Credential) public credentials;
```

### 8.3 Data Storage Strategy

| Data Type | Storage Location | Encryption | Retention |
|-----------|-----------------|------------|-----------|
| User Metadata | MongoDB | No | Permanent |
| Session Data | MongoDB | No | 24 hours |
| Documents | IPFS | AES-256 | User-controlled |
| Verification Logs | MongoDB | No | 7 years (compliance) |
| Credential Hashes | Blockchain | N/A | Immutable |
| DID Records | Blockchain | N/A | Immutable |
| Private Keys | User Browser | User-managed | Never stored |

### 8.4 Data Privacy

- **GDPR Compliance**: Right to access, rectify, delete personal data
- **Data Minimization**: Only necessary data collected
- **Purpose Limitation**: Data used only for stated purposes
- **Off-chain Deletion**: Documents and metadata can be deleted
- **On-chain Immutability**: Only hashes on blockchain (not reversible to PII)

---

## 9. API Specifications

### 9.1 Backend API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

#### Authentication Endpoints

**POST /auth/nonce**
- **Description:** Get authentication nonce for wallet signature
- **Request Body:**
  ```json
  {
    "walletAddress": "0x..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "nonce": "Sign this message...",
    "walletAddress": "0x..."
  }
  ```

**POST /auth/verify**
- **Description:** Verify signed nonce and issue JWT
- **Request Body:**
  ```json
  {
    "walletAddress": "0x...",
    "signature": "0x...",
    "nonce": "Sign this message..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "jwt_token",
    "user": {
      "walletAddress": "0x...",
      "did": "did:ethr:0x...",
      "createdAt": "2026-01-24T00:00:00Z"
    }
  }
  ```

#### DID Endpoints

**GET /did/:address**
- **Description:** Retrieve DID document
- **Response:**
  ```json
  {
    "success": true,
    "did": {
      "id": "did:ethr:0x...",
      "controller": "0x...",
      "publicKey": "...",
      "createdAt": "2026-01-24T00:00:00Z",
      "status": "active"
    }
  }
  ```

**POST /did/register**
- **Description:** Register new DID
- **Request Body:**
  ```json
  {
    "walletAddress": "0x...",
    "publicKey": "..."
  }
  ```

#### Document Endpoints

**POST /documents/upload**
- **Description:** Upload identity document
- **Content-Type:** multipart/form-data
- **Request:** File upload
- **Response:**
  ```json
  {
    "success": true,
    "document": {
      "id": "doc_123",
      "ipfsHash": "Qm...",
      "encryptedAt": "2026-01-24T00:00:00Z"
    }
  }
  ```

**GET /documents/:userId**
- **Description:** Get user documents
- **Headers:** Authorization: Bearer {token}

#### Verification Endpoints

**POST /verification/start**
- **Description:** Start verification process
- **Request Body:**
  ```json
  {
    "userId": "user_123",
    "documentId": "doc_123"
  }
  ```

**GET /verification/:verificationId**
- **Description:** Get verification status

#### Credential Endpoints

**GET /credentials/:userId**
- **Description:** Get user credentials

**POST /credentials/verify**
- **Description:** Verify credential from QR code

### 9.2 AI Service API Endpoints

**Base URL:** `http://localhost:8000/api/v1`

**POST /face/verify**
- **Description:** Face verification
- **Request Body:**
  ```json
  {
    "document_image": "base64...",
    "selfie_image": "base64..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "verification": {
      "match": true,
      "confidence": 0.95,
      "threshold": 0.80,
      "model": "ArcFace"
    }
  }
  ```

**POST /liveness/detect**
- **Description:** Liveness detection
- **Request Body:**
  ```json
  {
    "frames": ["base64...", "base64..."],
    "challenge_type": "blink"
  }
  ```

**POST /ocr/extract**
- **Description:** Document OCR
- **Request Body:**
  ```json
  {
    "image": "base64...",
    "document_type": "passport"
  }
  ```

**POST /verify/complete**
- **Description:** Complete verification pipeline

---

## 10. Appendix

### 10.1 Glossary

- **DID (Decentralized Identifier)**: A globally unique identifier that does not require a centralized registration authority
- **Verifiable Credential**: A tamper-evident credential with authorship that can be cryptographically verified
- **Self-Sovereign Identity**: Identity that is controlled by the individual, not a centralized authority
- **Liveness Detection**: Technology to ensure a real person is present, not a photo or video
- **IPFS**: InterPlanetary File System, a peer-to-peer distributed file system
- **Smart Contract**: Self-executing code on blockchain
- **Hash**: Fixed-size cryptographic output from variable-size input
- **MRZ**: Machine Readable Zone on passports and ID cards

### 10.2 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js | 16.1.1 | Web application framework |
| Frontend | React | 19.2.3 | UI library |
| Frontend | TypeScript | 5.x | Type safety |
| Frontend | Ethers.js | 6.16.0 | Web3 integration |
| Backend | Express.js | 5.2.1 | API server |
| Backend | Node.js | >= 18.0.0 | Runtime environment |
| Backend | MongoDB | >= 5.0 | Database |
| Backend | Mongoose | 9.1.2 | ODM |
| AI Service | Flask | 3.0 | Python web framework |
| AI Service | Python | >= 3.10 | Programming language |
| AI Service | DeepFace | Latest | Face verification |
| AI Service | MediaPipe | Latest | Liveness detection |
| AI Service | Tesseract | Latest | OCR |
| Blockchain | Solidity | Latest | Smart contracts |
| Blockchain | Hardhat | Latest | Development framework |
| Storage | IPFS | Latest | Decentralized storage |

### 10.3 Use Cases

**Use Case 1: Bank KYC Verification**
- Customer creates DID
- Uploads passport and takes selfie
- AI verifies identity
- Bank receives verifiable credential
- Customer approved for account

**Use Case 2: University Admission**
- Student creates DID
- Verifies educational documents
- Shares selective credentials (name, graduation status)
- University verifies authenticity
- Admission processed

**Use Case 3: Job Application**
- Applicant creates DID
- Verifies professional credentials
- Shares with employer via QR code
- Employer verifies blockchain credential
- Background check completed

**Use Case 4: Age Verification**
- User creates DID
- Verifies government ID
- Shares age attribute only (not full DOB)
- Service verifies minimum age requirement
- Access granted

### 10.4 Future Enhancements

- Zero-Knowledge Proofs for enhanced privacy
- Multi-chain support (Polygon, Solana, etc.)
- Mobile native applications (iOS/Android)
- Biometric authentication (fingerprint, iris scan)
- Multi-language support
- Healthcare credential verification
- Educational credential verification
- Professional license verification
- Social recovery mechanisms
- Decentralized reputation system

### 10.5 Compliance and Regulations

- **GDPR**: Right to access, rectify, delete, portability
- **CCPA**: California Consumer Privacy Act compliance
- **eIDAS**: Electronic identification and trust services
- **KYC/AML**: Financial institution requirements
- **NIST**: Digital identity guidelines
- **ISO 27001**: Information security management

### 10.6 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| AI model inaccuracy | Medium | High | Regular model updates, human review option |
| Blockchain network downtime | Low | High | Multi-provider setup, fallback mechanisms |
| IPFS data loss | Low | High | Data pinning services, redundancy |
| Smart contract vulnerability | Low | Critical | Security audits, formal verification |
| Privacy breach | Low | Critical | End-to-end encryption, no on-chain PII |
| Regulatory changes | Medium | Medium | Monitoring, flexible architecture |

---

**Document Version:** 1.0  
**Last Updated:** January 24, 2026  
**Status:** Draft for Review  

---

**Approval Signatures:**

- Product Owner: _______________  Date: _______________
- Technical Lead: _______________  Date: _______________
- Security Officer: _______________  Date: _______________
- Quality Assurance: _______________  Date: _______________

---

*This document is subject to change and will be updated as the project evolves.*
