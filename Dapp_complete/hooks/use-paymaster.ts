import { PAYMASTER_ADDRESS, TOKEN_ADDRESS } from "@/constants/contract";
import { useQuery } from "@tanstack/react-query";
import { formatEther, parseEther } from "ethers";
import { utils } from "zksync-ethers";
import useZkSyncWallet from "./use-zksync-wallet";

export default function usePaymaster() {
    const { provider, isReady } = useZkSyncWallet();
    const { isLoading, data: paymasterBalance } = useQuery({
        queryKey: ["paymaster", PAYMASTER_ADDRESS],
        enabled: isReady,
        refetchInterval: 3000,
        queryFn: async () => {
            if (!provider) throw new Error("Connect your wallet first.");
            return formatEther(await provider.getBalance(PAYMASTER_ADDRESS));
        },
    });
    return {
        paymasterBalance, isLoading,
        customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: utils.getPaymasterParams(PAYMASTER_ADDRESS, {
                type: "ApprovalBased", token: TOKEN_ADDRESS, minimalAllowance: parseEther("1"), innerInput: new Uint8Array(),
            }),
        },
    };
}
