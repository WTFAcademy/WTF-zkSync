"use client";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "4986dafb8fd2cc85b484ee880807bea5"; // 自行申请一个

// 2. Set chains
export const zkSyncSepoliaTestnet = {
    chainId: 300,
    name: "zkSync Sepolia Testnet",
    currency: "ETH",
    explorerUrl: "https://sepolia.explorerzksync.io/",
    rpcUrl: "https://sepolia.era.zksync.dev",
};

// 3. Create modal
const metadata = {
    name: "Web3Modal",
    description: "Web3Modal ZkSync Example",
    url: "https://web3modal.com", // origin must match your domain & subdomain
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const { getWalletProvider } = createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [zkSyncSepoliaTestnet],
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export function Web3ModalProvider({
    children,
}: {
    children: React.ReactNode,
}) {
    return children;
}