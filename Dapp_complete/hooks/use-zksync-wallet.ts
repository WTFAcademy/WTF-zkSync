import { useMemo } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import type { Eip1193Provider } from "ethers";
import { BrowserProvider } from "zksync-ethers";

export default function useZkSyncWallet() {
    const { address, isConnected, caipAddress } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider<Eip1193Provider>("eip155");
    const isReady = !!(isConnected && address && caipAddress?.startsWith("eip155:300:") && walletProvider);
    const provider = useMemo(() => isReady && walletProvider ? new BrowserProvider(walletProvider) : null, [isReady, walletProvider]);

    async function getSigner() {
        if (!provider || !address || (await provider.getNetwork()).chainId !== BigInt(300)) {
            throw new Error("Connect your wallet to zkSync Sepolia first.");
        }
        return provider.getSigner(address);
    }

    async function estimateCost(gas: bigint) {
        if (!provider) throw new Error("Connect your wallet first.");
        const { gasPrice } = await provider.getFeeData();
        if (gasPrice === null) throw new Error("The provider did not supply a gas price.");
        return { gas, gasPrice, cost: gas * gasPrice };
    }

    return { address, provider, isReady, getSigner, estimateCost };
}
