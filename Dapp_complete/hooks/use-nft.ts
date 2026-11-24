import { NFT_ABI, NFT_ADDRESS } from "@/constants/contract";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatEther } from "ethers";
import { Contract } from "zksync-ethers";
import { toast } from "sonner";
import useToken from "./use-token";
import usePaymaster from "./use-paymaster";
import useZkSyncWallet from "./use-zksync-wallet";

export default function useNft() {
    const { isReady, address, provider, getSigner, estimateCost } = useZkSyncWallet();
    const { canNonGas } = useToken();
    const { customData } = usePaymaster();
    const { data: nftBalance, refetch } = useQuery({
        queryKey: ["nftBalance", address], enabled: isReady,
        queryFn: async () => (await new Contract(NFT_ADDRESS, NFT_ABI, provider).balanceOf(address)).toString(),
    });

    async function getNFTMintEstimate() {
        const contract = new Contract(NFT_ADDRESS, NFT_ABI, await getSigner());
        const result = await estimateCost(await contract.mint.estimateGas(address, "Space Stone"));
        return { gas: result.gas.toString(), gasPrice: formatEther(result.gasPrice), cost: formatEther(result.cost) };
    }

    const mint = useMutation({
        mutationFn: async () => {
            const contract = new Contract(NFT_ADDRESS, NFT_ABI, await getSigner());
            const tx = await contract.mint(address, "Space Stone", { customData: canNonGas ? customData : undefined });
            await tx.wait();
            return tx;
        },
        onSuccess: () => { refetch(); toast.success("NFT minted"); },
        onError: (error) => toast.error(error.message),
    });
    return { nftBalance, mintTx: mint.data, isMintLoading: mint.isPending, mint: mint.mutateAsync, getNFTMintEstimate };
}
