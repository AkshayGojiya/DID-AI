"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Define the context type
interface Web3ContextType {
    address: string | null;
    provider: BrowserProvider | null;
    signer: JsonRpcSigner | null;
    isConnected: boolean;
    isConnecting: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    error: string | null;
}

// Create context with default values
export const Web3Context = createContext<Web3ContextType>({
    address: null,
    provider: null,
    signer: null,
    isConnected: false,
    isConnecting: false,
    connectWallet: async () => { },
    disconnectWallet: () => { },
    error: null,
});

// Custom hook to use Web3 context
export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within Web3Provider');
    }
    return context;
};

interface Web3ProviderProps {
    children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
    const [address, setAddress] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if wallet is already connected on mount
    useEffect(() => {
        checkConnection();

        // Listen for account changes
        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        return () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, []);

    const checkConnection = async () => {
        if (typeof window === 'undefined' || !window.ethereum) return;

        try {
            const provider = new BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();

            if (accounts.length > 0) {
                const signer = await provider.getSigner();
                const address = await signer.getAddress();

                setProvider(provider);
                setSigner(signer);
                setAddress(address);
            }
        } catch (err) {
            console.error('Error checking connection:', err);
        }
    };

    const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            // User disconnected wallet
            disconnectWallet();
        } else {
            // User switched accounts
            setAddress(accounts[0]);
            checkConnection();
        }
    };

    const handleChainChanged = () => {
        // Reload the page when chain changes (recommended by MetaMask)
        window.location.reload();
    };

    const connectWallet = async () => {
        setError(null);
        setIsConnecting(true);

        try {
            // Check if MetaMask is installed
            if (typeof window === 'undefined' || !window.ethereum) {
                throw new Error('Please install MetaMask to use this feature!');
            }

            // Request account access
            const provider = new BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);

            // Get signer and address
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            // Get network info
            const network = await provider.getNetwork();
            console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);

            // Update state
            setProvider(provider);
            setSigner(signer);
            setAddress(address);

            console.log('✅ Wallet connected:', address);
        } catch (err: any) {
            console.error('Error connecting wallet:', err);

            if (err.code === 4001) {
                setError('Connection rejected. Please approve the connection request.');
            } else if (err.code === -32002) {
                setError('Connection request already pending. Please check MetaMask.');
            } else {
                setError(err.message || 'Failed to connect wallet');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAddress(null);
        setProvider(null);
        setSigner(null);
        setError(null);
        console.log('🔌 Wallet disconnected');
    };

    const value: Web3ContextType = {
        address,
        provider,
        signer,
        isConnected: !!address,
        isConnecting,
        connectWallet,
        disconnectWallet,
        error,
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};