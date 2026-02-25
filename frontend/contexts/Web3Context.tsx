"use client";

/**
 * Web3Context
 * ===========
 * Provides wallet connection, authentication, and ethers.js state
 * to the entire application.
 *
 * Auth flow:
 *   1. connectWallet() — triggers MetaMask, sets provider/signer/address
 *   2. login()         — gets nonce from backend, signs it, gets JWT
 *   3. JWT stored in localStorage; restored on page refresh
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { ethers } from "ethers";

// ---- Window type extension for MetaMask ----
declare global {
    interface Window {
        ethereum?: any;
    }
}

// ---- Types ----
export interface Web3ContextType {
    /** Connected wallet address (lowercase) */
    address: string | null;
    /** ethers BrowserProvider */
    provider: ethers.BrowserProvider | null;
    /** ethers JsonRpcSigner */
    signer: ethers.JsonRpcSigner | null;
    /** Current chain ID */
    chainId: number | null;
    /** True while MetaMask connection is in progress */
    isConnecting: boolean;
    /** True when wallet is connected AND JWT is present */
    isAuthenticated: boolean;
    /** JWT returned by backend after signature verification */
    token: string | null;
    /** Connect MetaMask wallet */
    connectWallet: () => Promise<void>;
    /** Clear all wallet + auth state */
    disconnectWallet: () => void;
    /** Sign nonce and get JWT from backend. Returns the JWT on success. */
    login: () => Promise<string>;
}

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const TOKEN_KEY   = "verifyx_token";
const ADDRESS_KEY = "verifyx_address";

// ---- Context ----
const Web3Context = createContext<Web3ContextType | null>(null);

export function useWeb3(): Web3ContextType {
    const ctx = useContext(Web3Context);
    if (!ctx) throw new Error("useWeb3 must be used inside <Web3Provider>");
    return ctx;
}

// ---- Provider ----
export function Web3Provider({ children }: { children: ReactNode }) {
    const [address, setAddress]       = useState<string | null>(null);
    const [provider, setProvider]     = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner]         = useState<ethers.JsonRpcSigner | null>(null);
    const [chainId, setChainId]       = useState<number | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [token, setToken]           = useState<string | null>(null);

    // ---- Restore session on mount ----
    useEffect(() => {
        const savedToken   = localStorage.getItem(TOKEN_KEY);
        const savedAddress = localStorage.getItem(ADDRESS_KEY);

        if (!savedToken || !savedAddress) return;

        setToken(savedToken);
        setAddress(savedAddress);

        // Re-attach provider silently if MetaMask is still unlocked
        if (typeof window !== "undefined" && window.ethereum) {
            const prov = new ethers.BrowserProvider(window.ethereum);
            prov.listAccounts()
                .then(async (accounts) => {
                    const match = accounts.find(
                        (a) => a.address.toLowerCase() === savedAddress
                    );
                    if (match) {
                        const s = await prov.getSigner();
                        const net = await prov.getNetwork();
                        setProvider(prov);
                        setSigner(s);
                        setChainId(Number(net.chainId));
                    }
                })
                .catch(() => {});
        }
    }, []);

    // ---- Listen for MetaMask account/chain changes ----
    useEffect(() => {
        if (typeof window === "undefined" || !window.ethereum) return;

        const onAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else if (accounts[0].toLowerCase() !== address) {
                // User switched accounts — force re-auth
                disconnectWallet();
            }
        };

        const onChainChanged = () => {
            // Reload is the safest way to reset provider state on chain switch
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", onAccountsChanged);
            window.ethereum.removeListener("chainChanged", onChainChanged);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);

    // ---- connectWallet ----
    const connectWallet = useCallback(async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert(
                "MetaMask is not installed.\nPlease install it from https://metamask.io"
            );
            return;
        }

        setIsConnecting(true);
        try {
            const prov = new ethers.BrowserProvider(window.ethereum);
            await prov.send("eth_requestAccounts", []);

            const s    = await prov.getSigner();
            const addr = (await s.getAddress()).toLowerCase();
            const net  = await prov.getNetwork();

            setProvider(prov);
            setSigner(s);
            setAddress(addr);
            setChainId(Number(net.chainId));

            localStorage.setItem(ADDRESS_KEY, addr);
        } catch (err: any) {
            // Code 4001 = user rejected the request — don't show an error
            if (err?.code !== 4001) {
                console.error("Wallet connection failed:", err);
                alert("Failed to connect wallet: " + (err?.message ?? "Unknown error"));
            }
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // ---- disconnectWallet ----
    const disconnectWallet = useCallback(() => {
        setAddress(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADDRESS_KEY);
    }, []);

    // ---- login (sign nonce → get JWT) ----
    const login = useCallback(async (): Promise<string> => {
        if (!signer || !address) {
            throw new Error("Wallet not connected. Call connectWallet() first.");
        }

        // 1. Request a one-time nonce from backend
        const nonceRes = await fetch(`${BACKEND_URL}/api/v1/auth/nonce`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ walletAddress: address }),
        });
        if (!nonceRes.ok) {
            const err = await nonceRes.json().catch(() => ({}));
            throw new Error(err.message || "Failed to get nonce from server");
        }
        const { nonce } = await nonceRes.json();

        // 2. Sign the nonce with the connected wallet
        const message   = `Sign this message to authenticate with VerifyX.\n\nNonce: ${nonce}`;
        const signature = await signer.signMessage(message);

        // 3. Verify signature on backend — receive JWT
        // Backend expects `message` (the full signed string) so it can call message.includes(nonce)
        const verifyRes = await fetch(`${BACKEND_URL}/api/v1/auth/verify`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ walletAddress: address, signature, message }),
        });
        if (!verifyRes.ok) {
            const err = await verifyRes.json().catch(() => ({}));
            throw new Error(err.message || "Authentication failed");
        }
        const { token: jwt } = await verifyRes.json();

        setToken(jwt);
        localStorage.setItem(TOKEN_KEY, jwt);
        return jwt;
    }, [signer, address]);

    const isAuthenticated = Boolean(token && address);

    return (
        <Web3Context.Provider
            value={{
                address,
                provider,
                signer,
                chainId,
                isConnecting,
                isAuthenticated,
                token,
                connectWallet,
                disconnectWallet,
                login,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
}
