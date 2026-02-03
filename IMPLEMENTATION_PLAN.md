# 🚀 VerifyX Implementation Plan

**Last Updated:** February 3, 2026  
**Project Status:** In Development  

---

## 📊 Current Status Assessment

### ✅ What's Completed
- **Frontend UI**: Beautiful, responsive landing page with animations
- **Backend Skeleton**: Express server with mock API endpoints  
- **AI Service**: Flask app with endpoint stubs (face, liveness, OCR)
- **Folder Structure**: Project organized with proper separation

### ⚠️ What's Partially Done (Needs Implementation)
- **Backend**: All endpoints return mock data, need real logic
- **AI Service**: Endpoints exist but AI models not integrated
- **Blockchain**: Empty contract files (DIDRegistry.sol, CredentialRegistry.sol)
- **Database**: No MongoDB connection
- **Frontend**: UI exists but no Web3 integration

### ❌ What's Not Started
- Smart contract implementation
- MongoDB schemas and models
- AI model integration (DeepFace, MediaPipe, Tesseract)
- IPFS file storage
- Web3 wallet connection (MetaMask)
- JWT authentication
- File encryption/decryption
- End-to-end verification workflow

---

## 🎯 Implementation Phases (In Order)

We'll follow a **bottom-up approach**: Build the foundation first, then layer on top.

---

## 📅 PHASE 1: Database & Data Models (Foundation)
**Time:** 1-2 days  
**Why First?** Everything needs a place to store data.

### Step 1.1: MongoDB Setup & Connection
**Location:** `backend/`

#### Tasks:
- [ ] **1.1.1** Install MongoDB locally or set up MongoDB Atlas
- [ ] **1.1.2** Create `.env` file with MongoDB URI
  ```env
  MONGODB_URI=mongodb://localhost:27017/verifyx
  # OR for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/verifyx
  ```
- [ ] **1.1.3** Create `backend/config/database.js`:
  ```js
  const mongoose = require('mongoose');
  
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Connected');
    } catch (error) {
      console.error('❌ MongoDB Connection Failed:', error);
      process.exit(1);
    }
  };
  
  module.exports = connectDB;
  ```
- [ ] **1.1.4** Update `backend/index.js`: Import and call `connectDB()`

#### Verification:
```bash
cd backend
node index.js
# Should see: "✅ MongoDB Connected"
```

---

### Step 1.2: Create Database Models
**Location:** `backend/models/`

#### Tasks:
- [ ] **1.2.1** Create `backend/models/User.js`:
  ```js
  const mongoose = require('mongoose');
  
  const UserSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, unique: true, lowercase: true },
    nonce: { type: String, required: true },
    did: { type: String, unique: true },
    role: { type: String, enum: ['user', 'verifier', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
  });
  
  module.exports = mongoose.model('User', UserSchema);
  ```

- [ ] **1.2.2** Create `backend/models/Document.js`:
  ```js
  const mongoose = require('mongoose');
  
  const DocumentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['passport', 'driving_license', 'national_id'], required: true },
    ipfsHash: { type: String, required: true },
    encryptionKey: { type: String, required: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    uploadedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Document', DocumentSchema);
  ```

- [ ] **1.2.3** Create `backend/models/Verification.js`
- [ ] **1.2.4** Create `backend/models/Credential.js`

#### Verification:
- Models should export cleanly
- No MongoDB errors when server starts

---

## 📅 PHASE 2: Blockchain Smart Contracts (Trust Layer)
**Time:** 2-3 days  
**Why Second?** Backend will need to interact with these contracts.

### Step 2.1: Hardhat Setup
**Location:** `blockchain/`

#### Tasks:
- [ ] **2.1.1** Initialize Hardhat (if not done):
  ```bash
  cd blockchain
  npx hardhat init
  # Choose "Create a TypeScript project"
  ```
- [ ] **2.1.2** Install dependencies:
  ```bash
  npm install --save @openzeppelin/contracts dotenv @nomiclabs/hardhat-ethers ethers
  ```
- [ ] **2.1.3** Create `blockchain/hardhat.config.ts`:
  ```ts
  import { HardhatUserConfig } from "hardhat/config";
  import "@nomiclabs/hardhat-ethers";
  
  const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
      hardhat: {
        chainId: 31337
      },
      localhost: {
        url: "http://127.0.0.1:8545"
      }
    }
  };
  
  export default config;
  ```

---

### Step 2.2: Write Smart Contracts

#### Tasks:
- [ ] **2.2.1** Create `blockchain/contracts/DIDRegistry.sol`:
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.20;
  
  contract DIDRegistry {
      struct DIDDocument {
          address controller;
          string publicKey;
          uint256 createdAt;
          bool isActive;
      }
      
      mapping(address => DIDDocument) private dids;
      
      event DIDRegistered(address indexed owner, uint256 timestamp);
      event DIDUpdated(address indexed owner, uint256 timestamp);
      
      function registerDID(string memory _publicKey) external {
          require(dids[msg.sender].createdAt == 0, "DID already exists");
          
          dids[msg.sender] = DIDDocument({
              controller: msg.sender,
              publicKey: _publicKey,
              createdAt: block.timestamp,
              isActive: true
          });
          
          emit DIDRegistered(msg.sender, block.timestamp);
      }
      
      function getDID(address _owner) external view returns (DIDDocument memory) {
          require(dids[_owner].createdAt != 0, "DID not found");
          return dids[_owner];
      }
  }
  ```

- [ ] **2.2.2** Create `blockchain/contracts/CredentialRegistry.sol`:
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.20;
  
  contract CredentialRegistry {
      struct Credential {
          bytes32 credentialHash;
          address subject;
          uint256 issuedAt;
          uint256 expiresAt;
          bool isRevoked;
      }
      
      mapping(bytes32 => Credential) private credentials;
      
      event CredentialIssued(bytes32 indexed hash, address indexed subject, uint256 expiresAt);
      event CredentialRevoked(bytes32 indexed hash, uint256 timestamp);
      
      function issueCredential(
          bytes32 _credentialHash,
          address _subject,
          uint256 _expiresAt
      ) external {
          require(credentials[_credentialHash].issuedAt == 0, "Credential already exists");
          
          credentials[_credentialHash] = Credential({
              credentialHash: _credentialHash,
              subject: _subject,
              issuedAt: block.timestamp,
              expiresAt: _expiresAt,
              isRevoked: false
          });
          
          emit CredentialIssued(_credentialHash, _subject, _expiresAt);
      }
      
      function verifyCredential(bytes32 _credentialHash) external view returns (bool) {
          Credential memory cred = credentials[_credentialHash];
          return cred.issuedAt != 0 && 
                 !cred.isRevoked && 
                 block.timestamp < cred.expiresAt;
      }
      
      function revokeCredential(bytes32 _credentialHash) external {
          require(credentials[_credentialHash].subject == msg.sender, "Not authorized");
          credentials[_credentialHash].isRevoked = true;
          emit CredentialRevoked(_credentialHash, block.timestamp);
      }
  }
  ```

---

### Step 2.3: Deploy Contracts

#### Tasks:
- [ ] **2.3.1** Create `blockchain/scripts/deploy.ts`:
  ```ts
  import { ethers } from "hardhat";
  
  async function main() {
    console.log("🚀 Deploying contracts...");
    
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    const didRegistry = await DIDRegistry.deploy();
    await didRegistry.deployed();
    console.log("✅ DIDRegistry deployed to:", didRegistry.address);
    
    const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
    const credentialRegistry = await CredentialRegistry.deploy();
    await credentialRegistry.deployed();
    console.log("✅ CredentialRegistry deployed to:", credentialRegistry.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  ```

- [ ] **2.3.2** Start local Hardhat node (Terminal 1):
  ```bash
  cd blockchain
  npx hardhat node
  # Keep this running
  ```

- [ ] **2.3.3** Deploy contracts (Terminal 2):
  ```bash
  cd blockchain
  npx hardhat run scripts/deploy.ts --network localhost
  # Save the contract addresses!
  ```

#### Verification:
- Hardhat node running on `http://127.0.0.1:8545`
- Contract addresses printed in console
- Save addresses to `.env` file

---

## 📅 PHASE 3: Backend Implementation (Logic Layer)
**Time:** 3-4 days  
**Why Third?** Now we have database and contracts to work with.

### Step 3.1: Authentication System

#### Tasks:
- [ ] **3.1.1** Install ethers.js in backend:
  ```bash
  cd backend
  npm install ethers jsonwebtoken
  ```

- [ ] **3.1.2** Create `backend/utils/auth.js`:
  ```js
  const { ethers } = require('ethers');
  const jwt = require('jsonwebtoken');
  
  const verifySignature = (message, signature, address) => {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      return false;
    }
  };
  
  const generateJWT = (walletAddress) => {
    return jwt.sign(
      { walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  };
  
  module.exports = { verifySignature, generateJWT };
  ```

- [ ] **3.1.3** Create `backend/middleware/authMiddleware.js`
- [ ] **3.1.4** Update `backend/routes/auth.js` with real signature verification

---

### Step 3.2: Blockchain Integration

#### Tasks:
- [ ] **3.2.1** Create `backend/services/blockchainService.js`:
  ```js
  const { ethers } = require('ethers');
  
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const DIDRegistryABI = require('../../blockchain/artifacts/contracts/DIDRegistry.sol/DIDRegistry.json').abi;
  const didRegistryAddress = process.env.DID_REGISTRY_ADDRESS;
  
  const didRegistry = new ethers.Contract(didRegistryAddress, DIDRegistryABI, provider);
  
  const registerDIDOnChain = async (walletAddress, publicKey, privateKey) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = didRegistry.connect(wallet);
    const tx = await contract.registerDID(publicKey);
    await tx.wait();
    return tx.hash;
  };
  
  module.exports = { registerDIDOnChain, didRegistry };
  ```

---

### Step 3.3: File Upload & IPFS

#### Tasks:
- [ ] **3.3.1** Install dependencies:
  ```bash
  cd backend
  npm install multer ipfs-http-client crypto
  ```

- [ ] **3.3.2** Set up Pinata or local IPFS
- [ ] **3.3.3** Create `backend/services/ipfsService.js`
- [ ] **3.3.4** Create `backend/utils/encryption.js`:
  ```js
  const crypto = require('crypto');
  
  const encryptFile = (buffer) => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    
    return {
      encrypted,
      key: key.toString('hex'),
      iv: iv.toString('hex')
    };
  };
  
  module.exports = { encryptFile };
  ```

- [ ] **3.3.5** Implement real `/api/v1/documents/upload` endpoint

---

## 📅 PHASE 4: AI Service Implementation (Intelligence Layer)
**Time:** 4-5 days  
**Why Fourth?** Most complex part, needs working backend.

### Step 4.1: Python Environment Setup

#### Tasks:
- [ ] **4.1.1** Create virtual environment (if not exists):
  ```bash
  cd ai-service
  python -m venv venv
  venv\Scripts\activate   # Windows
  # source venv/bin/activate  # Mac/Linux
  ```

- [ ] **4.1.2** Create `ai-service/requirements.txt`:
  ```txt
  flask==3.0.0
  flask-cors==4.0.0
  deepface==0.0.79
  mediapipe==0.10.8
  opencv-python==4.8.1.78
  pytesseract==0.3.10
  Pillow==10.1.0
  numpy==1.24.3
  python-dotenv==1.0.0
  ```

- [ ] **4.1.3** Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

- [ ] **4.1.4** Install Tesseract OCR binary:
  - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
  - Mac: `brew install tesseract`
  - Linux: `sudo apt-get install tesseract-ocr`

---

### Step 4.2: Face Verification

#### Tasks:
- [ ] **4.2.1** Create `ai-service/services/face_verification.py`:
  ```python
  from deepface import DeepFace
  import base64
  import numpy as np
  from PIL import Image
  from io import BytesIO
  
  def decode_base64_image(base64_str):
      img_data = base64.b64decode(base64_str)
      img = Image.open(BytesIO(img_data))
      return np.array(img)
  
  def verify_faces(img1_base64, img2_base64):
      try:
          img1 = decode_base64_image(img1_base64)
          img2 = decode_base64_image(img2_base64)
          
          result = DeepFace.verify(
              img1, img2,
              model_name='ArcFace',
              distance_metric='cosine'
          )
          
          return {
              'match': result['verified'],
              'confidence': 1 - result['distance'],
              'threshold': result['threshold'],
              'model': 'ArcFace'
          }
      except Exception as e:
          raise Exception(f"Face verification failed: {str(e)}")
  ```

- [ ] **4.2.2** Update `app.py` to use real face verification

---

### Step 4.3: Liveness Detection

#### Tasks:
- [ ] **4.3.1** Create `ai-service/services/liveness_detection.py`:
  ```python
  import mediapipe as mp
  import cv2
  import numpy as np
  
  mp_face_mesh = mp.solutions.face_mesh
  
  def detect_liveness(frames_base64, challenge_type='blink'):
      # Implement blink detection using eye aspect ratio
      # Implement head turn using head pose estimation
      # Return confidence score
      pass
  ```

- [ ] **4.3.2** Implement blink detection logic
- [ ] **4.3.3** Implement head turn detection logic
- [ ] **4.3.4** Update `/api/v1/liveness/detect` endpoint

---

### Step 4.4: OCR Service

#### Tasks:
- [ ] **4.4.1** Create `ai-service/services/ocr_service.py`:
  ```python
  import pytesseract
  from PIL import Image
  import re
  
  def extract_passport_data(image):
      text = pytesseract.image_to_string(image)
      
      # Parse MRZ lines
      mrz_lines = extract_mrz(text)
      
      # Extract fields
      data = {
          'full_name': extract_name(mrz_lines),
          'passport_number': extract_passport_number(mrz_lines),
          'nationality': extract_nationality(mrz_lines),
          'date_of_birth': extract_dob(mrz_lines),
          'expiry_date': extract_expiry(mrz_lines)
      }
      
      return data
  ```

- [ ] **4.4.2** Implement MRZ parsing logic
- [ ] **4.4.3** Implement field extraction with regex
- [ ] **4.4.4** Add confidence scoring

---

## 📅 PHASE 5: Frontend Integration (Experience Layer)
**Time:** 3-4 days  
**Why Fifth?** Connect everything together.

### Step 5.1: Web3 Wallet Connection

#### Tasks:
- [ ] **5.1.1** Install ethers.js in frontend:
  ```bash
  cd frontend
  npm install ethers
  ```

- [ ] **5.1.2** Create `frontend/contexts/Web3Context.tsx`:
  ```tsx
  import { createContext, useState, useEffect } from 'react';
  import { ethers } from 'ethers';
  
  export const Web3Context = createContext({});
  
  export const Web3Provider = ({ children }) => {
    const [address, setAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    
    const connectWallet = async () => {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      setAddress(accounts[0]);
      setProvider(provider);
    };
    
    return (
      <Web3Context.Provider value={{ address, connectWallet }}>
        {children}
      </Web3Context.Provider>
    );
  };
  ```

- [ ] **5.1.3** Update `frontend/app/layout.tsx` to wrap with Web3Provider
- [ ] **5.1.4** Update `Navbar.tsx` Connect Wallet button

---

### Step 5.2: Verification Flow

#### Tasks:
- [ ] **5.2.1** Create `frontend/app/verify/page.tsx`
- [ ] **5.2.2** Implement multi-step form:
  - Step 1: Personal Info
  - Step 2: Document Upload
  - Step 3: Selfie Capture
  - Step 4: Liveness Check
  - Step 5: Results
- [ ] **5.2.3** Install react-webcam:
  ```bash
  npm install react-webcam
  ```
- [ ] **5.2.4** Implement webcam capture component

---

### Step 5.3: API Integration

#### Tasks:
- [ ] **5.3.1** Create `frontend/lib/api.ts`:
  ```ts
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  export const api = {
    auth: {
      getNonce: (walletAddress: string) => 
        fetch(`${API_URL}/api/v1/auth/nonce`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress })
        }).then(r => r.json()),
      
      verify: (walletAddress: string, signature: string, nonce: string) =>
        fetch(`${API_URL}/api/v1/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress, signature, nonce })
        }).then(r => r.json())
    },
    
    documents: {
      upload: (formData: FormData, token: string) =>
        fetch(`${API_URL}/api/v1/documents/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }).then(r => r.json())
    }
  };
  ```

---

## 📅 PHASE 6: Testing & Integration
**Time:** 2-3 days

### Step 6.1: End-to-End Testing

#### Tasks:
- [ ] **6.1.1** Test complete flow:
  1. Connect MetaMask
  2. Authenticate with signature
  3. Upload document
  4. Capture selfie
  5. Complete liveness check
  6. Receive credential
  7. View in dashboard

- [ ] **6.1.2** Test error scenarios
- [ ] **6.1.3** Test mobile responsiveness

---

## 🔄 IMPLEMENTATION WORKFLOW (Step-by-Step)

### Week 1: Foundation

**Day 1-2: Database Setup**
1. ✅ Install MongoDB
2. ✅ Create database connection
3. ✅ Create all models (User, Document, Verification, Credential)
4. ✅ Test MongoDB connection

**Day 3-4: Smart Contracts**
5. ✅ Set up Hardhat
6. ✅ Write DIDRegistry.sol
7. ✅ Write CredentialRegistry.sol
8. ✅ Deploy to local Hardhat node
9. ✅ Save contract addresses

**Day 5: Backend Auth**
10. ✅ Implement signature verification
11. ✅ Implement JWT generation
12. ✅ Create auth middleware
13. ✅ Update auth endpoints

---

### Week 2: Core Features

**Day 6-7: Blockchain Integration**
14. ✅ Create blockchain service
15. ✅ Test DID registration
16. ✅ Test credential issuance

**Day 8-9: File Upload & IPFS**
17. ✅ Set up IPFS (Pinata)
18. ✅ Implement file encryption
19. ✅ Implement document upload endpoint
20. ✅ Test file upload end-to-end

**Day 10-11: AI - Face Verification**
21. ✅ Install DeepFace
22. ✅ Implement face verification
23. ✅ Test with sample images
24. ✅ Update Flask endpoint

---

### Week 3: AI & Frontend

**Day 12-13: AI - Liveness & OCR**
25. ✅ Implement liveness detection
26. ✅ Implement OCR extraction
27. ✅ Test AI services

**Day 14-15: Frontend Web3**
28. ✅ Create Web3Context
29. ✅ Implement wallet connection
30. ✅ Implement authentication flow

**Day 16-17: Verification Flow**
31. ✅ Build multi-step verification form
32. ✅ Implement webcam capture
33. ✅ Connect to backend APIs

---

### Week 4: Integration & Polish

**Day 18-19: End-to-End Integration**
34. ✅ Test complete verification flow
35. ✅ Fix bugs
36. ✅ Add loading states
37. ✅ Add error handling

**Day 20-21: Dashboard & Credentials**
38. ✅ Build dashboard page
39. ✅ Display user credentials
40. ✅ Implement QR code generation
41. ✅ Test credential verification

---

## 🎯 Quick Start Commands (Copy-Paste Ready)

### Start All Services:

**Terminal 1 - MongoDB:**
```bash
mongod --dbpath=/path/to/data
```

**Terminal 2 - Hardhat Node:**
```bash
cd blockchain
npx hardhat node
```

**Terminal 3 - Backend:**
```bash
cd backend
node index.js
```

**Terminal 4 - AI Service:**
```bash
cd ai-service
venv\Scripts\activate
python app.py
```

**Terminal 5 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📝 Environment Variables Needed

### Backend `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/verifyx
JWT_SECRET=your_super_secret_key_change_this
FRONTEND_URL=http://localhost:3000
DID_REGISTRY_ADDRESS=0x... (from deployment)
CREDENTIAL_REGISTRY_ADDRESS=0x... (from deployment)
PINATA_API_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret
```

### AI Service `.env`:
```env
FLASK_DEBUG=true
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

### Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

---

## 🚨 Critical Path (Must Do In This Order)

1. **MongoDB → Backend Models** (Can't store data without this)
2. **Smart Contracts → Deploy** (Backend needs contract addresses)
3. **Backend Auth → JWT** (Frontend needs authentication)
4. **IPFS Setup → File Upload** (Documents need storage)
5. **AI Models → Services** (Verification needs AI)
6. **Frontend Web3 → Connect Wallet** (Entry point for users)
7. **Verification Flow → Integration** (Connects everything)

---

## ✅ Next Immediate Actions (Start Here)

1. **Right Now:** Set up MongoDB connection
2. **Next:** Create database models
3. **Then:** Write smart contracts
4. **Then:** Deploy contracts to local Hardhat
5. **Then:** Implement backend authentication

---

## 📊 Progress Tracker

- [ ] Phase 1: Database (0/4 steps)
- [ ] Phase 2: Blockchain (0/3 steps)
- [ ] Phase 3: Backend (0/3 steps)
- [ ] Phase 4: AI Service (0/4 steps)
- [ ] Phase 5: Frontend (0/3 steps)
- [ ] Phase 6: Testing (0/1 steps)

**Estimated Total Time:** 4-5 weeks
**Current Status:** Ready to start Phase 1

---

## 🎓 Learning Resources

- **MongoDB:** https://mongoosejs.com/docs/guide.html
- **Hardhat:** https://hardhat.org/tutorial
- **DeepFace:** https://github.com/serengil/deepface
- **MediaPipe:** https://google.github.io/mediapipe/
- **Ethers.js:** https://docs.ethers.org/v6/

---

**Let's build this! Start with Phase 1, Step 1.1 🚀**
