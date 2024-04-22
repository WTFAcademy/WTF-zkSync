import { PAYMASTER_ADDRESS, TOKEN_ABI, TOKEN_ADDRESS } from "@/constants/contract";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { Contract, Web3Provider } from "zksync-ethers"
import { ethers } from "ethers";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import usePaymaster from "./use-paymaster";
import { useMemo } from "react";


const useToken = () => {
    const { isConnected, address } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()

    const { customData } = usePaymaster();

    const contract = useMemo(() => {
        if (!isConnected) return null;

        const ethersProvider = new Web3Provider(walletProvider!)
        const signer = ethersProvider.getSigner();
        return new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    }, [isConnected, address])

    const getTokenMintEstimate = async () => {
        const ethersProvider = new Web3Provider(walletProvider!)
        const erc20Contract = contract!;
        const gasEstimate = await erc20Contract.estimateGas.mint(address, ethers.utils.parseEther("1000"));
        const gasPrice = await ethersProvider.getGasPrice();
        const cost = gasPrice.mul(gasEstimate);

        return {
            gas: ethers.utils.formatEther(gasEstimate).toString(),
            gasPrice: ethers.utils.formatEther(gasPrice).toString(),
            cost: ethers.utils.formatEther(cost).toString()
        }
    }

    const { data: tokenBalance, refetch: refetchToken } = useQuery(
        ["token", address],
        async () => {
            const erc20Contract = contract!;
            const balance = await erc20Contract.balanceOf(address);
            return ethers.utils.formatEther(balance).toString();
        },
        {
            enabled: isConnected,
            refetchInterval: 0
        }
    )

    const {data: allowance, refetch: refetchAllowance} = useQuery(["tokenAllowance", address], async () => {
        const erc20Contract = contract!;
        const allowance = await erc20Contract.allowance(address, customData.paymasterParams.paymaster);
        return allowance;
    }, {
        enabled: isConnected,
        refetchInterval: 0
    })

    const { data: mintTx, isLoading: isMintLoading, mutateAsync: mint } = useMutation(
        ["mint", address],
        async () => {
            const erc20Contract = contract!;
            const tx = await erc20Contract.mint(address, ethers.utils.parseEther("1000"), {
                customData: ethers.utils.parseEther(tokenBalance!) > ethers.utils.parseEther("1") ? customData : undefined
            });
            await tx.wait();
            return tx;
        },
        {
            onSuccess: () => {
                refetchToken();
                toast.success("mint 1000 token success");
            },
            onError: (error: any) => {
                console.log(error);
                toast.error(error.data.message);
            }
        }
    )

    const { 
        data: approvePaymasterTx, 
        isLoading: isApprovePaymasterLoading, 
        mutateAsync: approvePaymaster
    } = useMutation("approve", async () => {
        const erc20Contract = contract!;
        const tx = await erc20Contract.approve(
            PAYMASTER_ADDRESS,
            ethers.constants.MaxUint256
        );
        await tx.wait();
        return tx;
    }, {
        onSuccess: () => {
            toast.success("approve paymaster success");
            refetchAllowance();
        }
    })

    return {
        tokenBalance,
        refetchToken,
        mint,
        mintTx,
        isMintLoading,
        getTokenMintEstimate,
        isAllowancePaymaster: allowance?.gte(ethers.utils.parseEther("1")),
        approvePaymaster,
        isApprovePaymasterLoading,
        approvePaymasterTx,
        canNonGas: tokenBalance ? ethers.utils.parseEther(tokenBalance!) > ethers.utils.parseEther("1") : false
    }
}

export default useToken;
