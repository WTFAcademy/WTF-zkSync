"use client";
import { createAppKit } from "@reown/appkit/react";
import { zkSyncSepoliaTestnet } from "@reown/appkit/networks";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
if (projectId) {
    createAppKit({
        adapters: [new EthersAdapter()],
        networks: [zkSyncSepoliaTestnet],
        defaultNetwork: zkSyncSepoliaTestnet,
        metadata: { name: "WTF zkSync", description: "zkSync Sepolia tutorial", url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", icons: [] },
        projectId,
        features: { analytics: false, email: false, socials: false },
    });
}

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
    if (!projectId) {
        return (
            <main className="mx-auto max-w-xl p-6">
                Set <code>NEXT_PUBLIC_REOWN_PROJECT_ID</code> and restart the app to connect a wallet.
            </main>
        );
    }
    return <>{children}</>;
}
