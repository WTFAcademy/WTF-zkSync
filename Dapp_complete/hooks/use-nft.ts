import { NFT_ABI, NFT_ADDRESS } from "@/constants/contract";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { useMemo } from "react";
import { useMutation, useQuery } from "react-query";
import { Contract, Web3Provider } from "zksync-ethers";
import useToken from "./use-token";
import usePaymaster from "./use-paymaster";
import { ethers } from "ethers";
import { toast } from "sonner";


const useNft = () => {
    const { isConnected, address } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()

    const { canNonGas } = useToken();
    const { customData } = usePaymaster();

    const contract = useMemo(() => {
        if (!isConnected) return null;

        const ethersProvider = new Web3Provider(walletProvider!)
        const signer = ethersProvider.getSigner();
        return new Contract(NFT_ADDRESS, NFT_ABI, signer);
    }, [isConnected, address])

    const getNFTMintEstimate = async () => {
        const ethersProvider = new Web3Provider(walletProvider!)
        const nftContract = contract!;
        const gasEstimate = await nftContract.estimateGas.mint(address, "Space Stone");
        const gasPrice = await ethersProvider.getGasPrice();
        const cost = gasPrice.mul(gasEstimate);

        return {
            gas: ethers.utils.formatEther(gasEstimate).toString(),
            gasPrice: ethers.utils.formatEther(gasPrice).toString(),
            cost: ethers.utils.formatEther(cost).toString()
        }
    }

    const { data: nftBalance, refetch } = useQuery(["nftBalance", address], async () => {
        if (!contract) return null;
        const balance = await contract.balanceOf(address);
        return balance.toString();
    }, {
        enabled: isConnected,
        refetchInterval: 0
    })

    const {
        data: mintTx,
        isLoading: isMintLoading,
        mutateAsync: mint
    } = useMutation(["mintNft", address], async () => {
        if (!contract) return null;
        const tx = await contract.mint(address, "Space Stone", {
            customData: canNonGas ? customData : undefined
        });
        await tx.wait();
        return tx;
    }, {
        onSuccess: () => {
            toast.success("NFT minted successfully");
            refetch();
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    })

    return {
        nftBalance,
        mintTx,
        isMintLoading,
        mint,
        getNFTMintEstimate
    }
}

export default useNft;