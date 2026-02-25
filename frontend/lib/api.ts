/**
 * API Client
 * ==========
 * Typed wrappers for all backend and AI service endpoints.
 */

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const AI      = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

// ---------- helpers ----------

async function post<T = any>(url: string, body: object, token?: string): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
}

async function put<T = any>(url: string, body: object, token?: string): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
}

async function get<T = any>(url: string, token?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
}

// ---------- Auth API ----------

export const authApi = {
    /** Get a one-time nonce for signature authentication */
    getNonce: (walletAddress: string) =>
        post(`${BACKEND}/api/v1/auth/nonce`, { walletAddress }),

    /** Verify wallet signature and receive JWT */
    verify: (walletAddress: string, signature: string, message: string) =>
        post(`${BACKEND}/api/v1/auth/verify`, { walletAddress, signature, message }),

    /** Get the current authenticated user */
    me: (token: string) =>
        get(`${BACKEND}/api/v1/auth/me`, token),
};

// ---------- Credentials API ----------

export const credentialsApi = {
    /** List all credentials for the authenticated user */
    list: (token: string) =>
        get<{
            success: boolean;
            count: number;
            credentials: Array<{
                id: string;
                credentialId: string;
                type: string;
                issuer: { did: string; name: string };
                issuedAt: string;
                expiresAt: string;
                status: string;
                hash: string;
                blockchain: { stored: boolean; txHash: string | null };
                claims: Record<string, any>;
                includedClaims: string[];
                usage: { shareCount: number; verifyCount: number };
            }>;
        }>(`${BACKEND}/api/v1/credentials`, token),

    /** Get a single credential by ID */
    getById: (id: string, token: string) =>
        get(`${BACKEND}/api/v1/credentials/${id}`, token),

    /** Issue a new credential after AI verification */
    create: (
        data: {
            documentId: string;
            claims?: Record<string, any>;
            includedClaims?: string[];
            aiResults?: Record<string, any>;
        },
        token: string,
    ) =>
        post<{
            success: boolean;
            credential: {
                id: string;
                credentialId: string;
                type: string;
                issuedAt: string;
                expiresAt: string;
                hash: string;
                status: string;
            };
        }>(`${BACKEND}/api/v1/credentials`, data, token),

    /** Revoke a credential */
    revoke: (id: string, reason: string, token: string) =>
        put(`${BACKEND}/api/v1/credentials/${id}/revoke`, { reason }, token),

    /** Verify a credential by its hash (public — no auth needed) */
    verifyByHash: (hash: string) =>
        get<{
            success: boolean;
            verified: boolean;
            credential: {
                credentialId: string;
                type: string;
                issuer: { did: string; name: string };
                subject: { did: string };
                issuedAt: string;
                expiresAt: string;
                status: string;
                claims: Record<string, any>;
                blockchain: { stored: boolean; txHash: string | null };
            };
        }>(`${BACKEND}/api/v1/credentials/verify/${hash}`),
};

// ---------- Documents API ----------

export const documentsApi = {
    /** Upload a document file (multipart/form-data) — returns IPFS hash + doc id */
    upload: async (formData: FormData, token: string) => {
        const res = await fetch(`${BACKEND}/api/v1/documents/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data;
    },

    /** List user's documents */
    list: (token: string) =>
        get(`${BACKEND}/api/v1/documents`, token),

    /** Get a specific document */
    getById: (id: string, token: string) =>
        get(`${BACKEND}/api/v1/documents/${id}`, token),
};

// ---------- Activity API ----------

export const activityApi = {
    /** Aggregated activity log for the authenticated user */
    list: (token: string) =>
        get<{
            success: boolean;
            events: Array<{
                id: string;
                type: string;
                title: string;
                description: string;
                date: string;
                meta: Record<string, any>;
            }>;
            stats: {
                total: number;
                documents: number;
                credentials: number;
                scans: number;
            };
        }>(`${BACKEND}/api/v1/activity`, token),
};

// ---------- AI Service API ----------

export const aiApi = {
    // ---- Liveness ----

    /** Fetch a random liveness challenge */
    getChallenge: () =>
        get<{
            success: boolean;
            challenge: { type: string; instruction: string };
            timeout_seconds: number;
            min_frames: number;
        }>(`${AI}/api/v1/liveness/challenge`),

    /** Analyse frames for liveness and anti-spoofing */
    detectLiveness: (frames: string[], challengeType: string) =>
        post<{
            success: boolean;
            liveness: {
                is_live: boolean;
                confidence: number;
                challenge_completed: boolean;
                challenge_type: string;
            };
            anti_spoofing: {
                is_real_face: boolean;
                confidence: number;
                spoof_type_detected: string | null;
            };
            details: Record<string, number | null>;
            frames_analyzed: number;
            frames_with_face: number;
            processing_time_ms: number;
        }>(`${AI}/api/v1/liveness/detect`, {
            frames,
            challenge_type: challengeType,
        }),

    // ---- Face Verification ----

    /** Compare document photo against selfie using ArcFace */
    verifyFace: (documentImage: string, selfieImage: string) =>
        post<{
            success: boolean;
            verification: {
                match: boolean;
                confidence: number;
                threshold: number;
                model: string;
                distance_metric: string;
            };
            processing_time_ms: number;
        }>(`${AI}/api/v1/face/verify`, {
            document_image: documentImage,
            selfie_image:   selfieImage,
        }),

    // ---- OCR ----

    /** Extract text and structured fields from a document image */
    extractOCR: (image: string, documentType: string) =>
        post<{
            success: boolean;
            document_type: string;
            extracted_data: Record<string, string>;
            confidence_scores: Record<string, number>;
            document_quality: Record<string, any>;
            mrz_found: boolean;
            checks_passed: string[];
            checks_failed: string[];
            ocr_confidence: number;
            processing_time_ms: number;
        }>(`${AI}/api/v1/ocr/extract`, {
            image,
            document_type: documentType,
        }),

    /** Check AI service health */
    health: () =>
        get(`${AI}/health`),
};
