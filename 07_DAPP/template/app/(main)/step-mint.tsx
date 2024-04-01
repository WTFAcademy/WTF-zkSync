"use client";

import MintNFTModal from "@/components/mint-nft-modal";
import MintTokenModal from "@/components/mint-token-modal";

const StepMint = () => {

    // 1. 使用useToken获取余额
    // 2. 使用usePaymaster获取合约内所剩余额，余额不够可以捐赠一些用于测试

    return (
        <div className="px-10 py-8 bg-[#1E1E1E] rounded-lg shadow text-[#ffffff] flex flex-col gap-4">
            <div className="text-[#29BC38] font-bold text-xl">WTF zkSync NFT Mint</div>
            <div className="space-y-3">
                <div className="space-x-1">
                    <span className="text-gray-400">Paymaster 余额：</span>
                    <span>0 ETH</span>
                </div>
                <div className="space-x-1">
                    <span className="text-gray-400">Paymaster 指定Token余额: </span>
                    <span>0</span>
                    <MintTokenModal />
                </div>
                <div className="space-x-1">
                    <span className="text-gray-400">NFT铸造：</span>
                    <MintNFTModal />
                </div>
            </div>
        </div>
    )
}

export default StepMint;
