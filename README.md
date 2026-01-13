# VerifyX - Decentralized Identity Verification

<div align="center">

![VerifyX Logo](https://via.placeholder.com/150x150/6366f1/ffffff?text=V)

### 🔐 AI-Powered Decentralized Identity Verification

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express)](https://expressjs.com/)

*Secure, privacy-preserving, user-owned digital identity verification powered by AI and blockchain.*

[Demo](https://verifyx.demo) • [Documentation](./docs) • [Report Bug](./issues) • [Request Feature](./issues)

</div>

---

## ✨ Features

- 🔐 **Self-Sovereign Identity** - You own and control your identity
- 🤖 **AI-Powered Verification** - Face matching, liveness detection, OCR
- ⛓️ **Blockchain Secured** - Immutable credential storage on Ethereum
- 🔒 **Privacy First** - No personal data stored on-chain
- 📱 **QR Code Sharing** - Selective disclosure of identity attributes
- 🌐 **Decentralized Storage** - Documents encrypted on IPFS

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                    localhost:3000                                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend API (Express)                        │
│                    localhost:5000/api/v1                         │
└─────────────────────────────────────────────────────────────────┘
           │                      │                      │
           ▼                      ▼                      ▼
    ┌───────────┐          ┌───────────┐          ┌───────────┐
    │ AI Service│          │  MongoDB  │          │   IPFS    │
    │   :8000   │          │   :27017  │          │   :5001   │
    └───────────┘          └───────────┘          └───────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.10
- **MongoDB** (local or Atlas)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/verifyx.git
cd verifyx
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# AI Service
cd ../ai-service
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# AI Service
cp ai-service/.env.example ai-service/.env
# Edit ai-service/.env with your configuration
```

### 4. Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
→ Opens at http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
→ API at http://localhost:5000

**Terminal 3 - AI Service:**
```bash
cd ai-service
venv\Scripts\activate  # or source venv/bin/activate
python app.py
```
→ AI API at http://localhost:8000

---

## 📁 Project Structure

```
verifyx/
├── frontend/               # Next.js 16 Frontend
│   ├── app/               # App Router pages
│   │   ├── page.tsx       # Landing page
│   │   ├── dashboard/     # User dashboard
│   │   ├── verify/        # Verification flow
│   │   └── credentials/   # Credentials management
│   ├── components/        # Reusable components
│   └── lib/               # Utilities
│
├── backend/                # Express.js API
│   ├── index.js           # Main server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # MongoDB models
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Auth, validation
│   └── tests/             # Jest tests
│
├── ai-service/            # Flask AI Microservice
│   ├── app.py             # Main Flask app
│   ├── src/
│   │   ├── face_verification.py
│   │   ├── liveness_detection.py
│   │   └── ocr_service.py
│   └── tests/             # Pytest tests
│
├── blockchain/            # Solidity Smart Contracts
│   ├── DIDRegistry.sol
│   ├── CredentialRegistry.sol
│   └── scripts/           # Deployment scripts
│
├── docs/                  # Documentation
└── docker-compose.yml     # Container orchestration
```

---

## 🔌 API Endpoints

### Backend API (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/auth/nonce` | Get auth nonce |
| POST | `/api/v1/auth/verify` | Verify signature |
| GET | `/api/v1/did/:address` | Get DID document |
| POST | `/api/v1/did/register` | Register new DID |
| POST | `/api/v1/verification/start` | Start verification |
| GET | `/api/v1/credentials/:userId` | Get user credentials |

### AI Service API (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/face/verify` | Face comparison |
| POST | `/api/v1/liveness/detect` | Liveness detection |
| POST | `/api/v1/ocr/extract` | Document OCR |
| POST | `/api/v1/verify/complete` | Full verification |

---

## 🔐 Security

- **Wallet-based Authentication** - No passwords, sign with your wallet
- **End-to-End Encryption** - AES-256 for documents
- **No On-chain PII** - Only hashes stored on blockchain
- **Rate Limiting** - Protection against abuse
- **CORS Protection** - Configured cross-origin policies

---

<!-- ## 🛣️ Roadmap

- [x] Core frontend UI with animations
- [x] Backend API structure
- [x] AI service skeleton
- [ ] Complete AI model integration
- [ ] IPFS integration
- [ ] Smart contract deployment
- [ ] Wallet connection (MetaMask)
- [ ] MongoDB integration
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production deployment

--- -->

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

**VerifyX Team** - [@verifyx](https://github.com/AkshayGojiya/DID-AI)

Project Link: [https://github.com/AkshayGojiya/DID-AI](https://github.com/AkshayGojiya/DID-AI)

---

<div align="center">

Made with ❤️ by the Akshay Gojiya

</div>
