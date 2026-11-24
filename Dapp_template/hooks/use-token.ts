import { PAYMASTER_ADDRESS, TOKEN_ABI, TOKEN_ADDRESS } from "@/constants/contract";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Contract } from "zksync-ethers";
import { formatEther, parseEther } from "ethers";
import { toast } from "sonner";
import usePaymaster from "./use-paymaster";
import useZkSyncWallet from "./use-zksync-wallet";

const minimum = parseEther("1");

export default function useToken() {
    const { address, provider, isReady, getSigner, estimateCost } = useZkSyncWallet();
    const { customData } = usePaymaster();
    const { data: balance, refetch: refetchToken } = useQuery({
        queryKey: ["token", address], enabled: isReady,
        queryFn: async (): Promise<bigint> => new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider).balanceOf(address),
    });
    const { data: allowance, refetch: refetchAllowance } = useQuery({
        queryKey: ["tokenAllowance", address], enabled: isReady,
        queryFn: async (): Promise<bigint> => new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider).allowance(address, PAYMASTER_ADDRESS),
    });
    const canNonGas = (balance ?? BigInt(0)) >= minimum;

    async function getTokenMintEstimate() {
        const contract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, await getSigner());
        const result = await estimateCost(await contract.mint.estimateGas(address, parseEther("1000")));
        return { gas: result.gas.toString(), gasPrice: formatEther(result.gasPrice), cost: formatEther(result.cost) };
    }

    const mint = useMutation({
        mutationFn: async () => {
            const contract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, await getSigner());
            const tx = await contract.mint(address, parseEther("1000"), { customData: canNonGas ? customData : undefined });
            await tx.wait();
            return tx;
        },
        onSuccess: () => { refetchToken(); toast.success("Tokens minted"); },
        onError: (error) => toast.error(error.message),
    });
    const approve = useMutation({
        mutationFn: async () => {
            const contract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, await getSigner());
            const tx = await contract.approve(PAYMASTER_ADDRESS, minimum);
            await tx.wait();
            return tx;
        },
        onSuccess: () => { refetchAllowance(); toast.success("Paymaster approved"); },
        onError: (error) => toast.error(error.message),
    });

    return {
        tokenBalance: balance === undefined ? undefined : formatEther(balance),
        refetchToken,
        mint: mint.mutateAsync,
        mintTx: mint.data,
        isMintLoading: mint.isPending,
        getTokenMintEstimate,
        isAllowancePaymaster: (allowance ?? BigInt(0)) >= minimum,
        approvePaymaster: approve.mutateAsync,
        isApprovePaymasterLoading: approve.isPending,
        approvePaymasterTx: approve.data,
        canNonGas,
    };
}
