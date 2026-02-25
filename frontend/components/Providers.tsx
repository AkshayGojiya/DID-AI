"use client";

/**
 * Providers
 * =========
 * Client-side wrapper that supplies all React context providers.
 * Imported into layout.tsx (a server component) to bridge the
 * server/client boundary cleanly.
 */

import { ReactNode } from "react";
import { Web3Provider } from "@/contexts/Web3Context";

export default function Providers({ children }: { children: ReactNode }) {
    return <Web3Provider>{children}</Web3Provider>;
}
