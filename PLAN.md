# 🔐 AI-Enhanced Decentralized Identity Verification System

An end-to-end **Decentralized Identity Verification System** that combines **Artificial Intelligence** and **Blockchain** to provide secure, privacy-preserving, and user-owned digital identity verification.

---

## 📌 Problem Statement

Traditional identity verification systems:
- Store sensitive user data in centralized databases
- Are vulnerable to data breaches
- Require repeated KYC processes
- Do not give users control over their identity

---

## 🎯 Solution Overview

This project introduces a **Decentralized Identity (DID)** system where:
- Users own and control their identity
- AI verifies identity documents and face authenticity
- Blockchain ensures trust, immutability, and auditability
- No sensitive data is stored on-chain

---

## 🧠 Key Features

- ✅ User-owned Decentralized Identity (DID)
- ✅ AI-based face verification
- ✅ Liveness detection (anti-spoofing)
- ✅ OCR-based document verification
- ✅ Blockchain-based credential hashing
- ✅ IPFS-based encrypted document storage
- ✅ Selective identity disclosure (QR-based)
- ✅ Tamper-proof audit logs

---

## 🧱 System Architecture

Next.js Frontend
|
v
Node.js Backend (API Gateway)
|
+--> AI Service (Flask + DeepFace + MediaPipe)
|
+--> IPFS (Encrypted Documents)
|
+--> MongoDB (Metadata)
|
+--> Ethereum Blockchain (DID + Credential Hash)


---

## 🛠️ Tech Stack

### Frontend
- Next.js (React)
- TypeScript
- MetaMask (Wallet Integration)
- Ethers.js

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Multer (File Uploads)

### AI / ML
- DeepFace (Face Verification)
- MediaPipe (Liveness Detection)
- OpenCV
- Tesseract OCR
- Flask (Microservices)

### Blockchain
- Ethereum (Local via Hardhat)
- Solidity (Smart Contracts)
- Ethers.js

### Storage & Security
- IPFS (Decentralized Storage)
- AES + RSA Encryption
- Environment Variables (.env)

---

## 📁 Project Folder Structure

did-ai-system/
│
├── frontend/ # Next.js Frontend
├── backend/ # Node.js Backend
├── ai-service/ # Python AI Services
├── blockchain/ # Solidity Smart Contracts
├── ipfs/ # IPFS configs
├── docs/ # PPT, diagrams
└── README.md


---

## 🔁 Complete Workflow

1. User connects MetaMask wallet
2. System generates DID from wallet address
3. User uploads identity documents
4. Documents are encrypted and stored on IPFS
5. AI service performs:
   - Face verification
   - Liveness detection
   - OCR document validation
6. Verification result is generated
7. Credential hash is stored on blockchain
8. User shares identity proof via QR code
9. Verifier validates credential from blockchain

---

## 🧠 AI Modules

### 1. Face Verification
- Uses DeepFace (ArcFace model)
- Compares live selfie with document photo
- Returns confidence score

### 2. Liveness Detection
- Uses MediaPipe Face Mesh
- Detects real-time facial movement
- Prevents photo/video spoofing

### 3. Document OCR
- Uses Tesseract OCR
- Extracts name, DOB, ID number
- Used for validation and matching

---

## ⛓️ Blockchain Modules

### Smart Contracts
- DID Registry Contract
- Credential Hash Registry
- Verification Log Contract

### On-chain Data
- DID public key
- Credential hash
- Timestamp

> ⚠️ No personal data is stored on-chain

---

## 🗄️ Data Storage Strategy

| Data Type | Storage |
|---------|--------|
Documents | IPFS (Encrypted) |
Metadata | MongoDB |
Hashes | Blockchain |
Keys | User Wallet |

---

## 🔐 Security & Privacy

- End-to-end encryption
- No centralized identity storage
- User-controlled access
- GDPR-compliant (off-chain deletion)
- Tamper-proof verification logs

---

## ▶️ Local Setup Summary

### Run Frontend
```bash
cd frontend
npm run dev
```

### Run Backend
```bash
cd backend
node index.js
```
### Run AI Service
```bash
cd ai-service
venv\Scripts\activate
python app.py
```
### Run Blockchain
```bash
cd blockchain
npx hardhat node
```
🌍 Real-World Use Cases

Bank KYC verification

University admissions

Job onboarding

Government identity services

Healthcare access

Digital voting systems

🚀 Future Enhancements

Zero Knowledge Proofs (ZKP)

Mobile app integration

Multi-chain support

Biometric authentication

Cloud deployment (Docker + AWS)