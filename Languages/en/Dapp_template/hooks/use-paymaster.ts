import { PAYMASTER_ADDRESS, TOKEN_ADDRESS } from "@/constants/contract"
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers5/react"
import { Web3Provider, utils } from "zksync-ethers";
import { ethers } from "ethers"
import { useQuery } from "react-query"

const usePaymaster = () => {
    const { isConnected } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()

    const {isLoading, data: paymasterBalance} = useQuery("paymaster", async () => {
        const ethersProvider = new Web3Provider(walletProvider!)
        const balance = await ethersProvider.getBalance(PAYMASTER_ADDRESS);
        return ethers.utils.formatEther(balance);
    }, {
        enabled: isConnected,
        refetchInterval: 3000
    })

    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
        type: "ApprovalBased",
        token: TOKEN_ADDRESS,
        // set minimalAllowance as we defined in the paymaster contract
        minimalAllowance: ethers.utils.parseEther("1"),
        // empty bytes as testnet paymaster does not use innerInput
        innerInput: new Uint8Array(),
    });

    return {
        paymasterBalance,
        isLoading,
        customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams,
        }
    }
}

export default usePaymaster;
