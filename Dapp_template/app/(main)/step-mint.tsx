"use client";

import MintNFTModal from "@/components/mint-nft-modal";
import MintTokenModal from "@/components/mint-token-modal";
import usePaymaster from "@/hooks/use-paymaster";
import useToken from "@/hooks/use-token";

const StepMint = () => {
    const { paymasterBalance } = usePaymaster();
    const { tokenBalance } = useToken();

    return (
        <div className="px-10 py-8 bg-[#1E1E1E] rounded-lg shadow text-[#ffffff] flex flex-col gap-4">
            <div className="text-[#29BC38] font-bold text-xl">
                WTF zkSync NFT Mint
            </div>
            <div className="space-y-3">
                <div className="space-x-1">
                    <span className="text-gray-400">Paymaster 余额：</span>
                    <span>{paymasterBalance} ETH</span>
                </div>
                <div className="space-x-1">
                    <span className="text-gray-400">Paymaster 指定Token余额: </span>
                    <span>{tokenBalance}</span>
                    <MintTokenModal />
                </div>
                <div className="space-x-1">
                    <span className="text-gray-400">NFT铸造：</span>
                    <MintNFTModal />
                </div>
            </div>
        </div>
    );
};

export default StepMint;
