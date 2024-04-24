"use client";

import MintNFTModal from "@/components/mint-nft-modal";
import MintTokenModal from "@/components/mint-token-modal";

const StepMint = () => {

     // 1. Use useToken to get the balance
     // 2. Use usePaymaster to get the remaining balance in the contract. If the balance is not enough, you can donate some for testing.

     return (
         <div className="px-10 py-8 bg-[#1E1E1E] rounded-lg shadow text-[#ffffff] flex flex-col gap-4">
             <div className="text-[#29BC38] font-bold text-xl">WTF zkSync NFT Mint</div>
             <div className="space-y-3">
                 <div className="space-x-1">
                     <span className="text-gray-400">Paymaster balance:</span>
                     <span>0 ETH</span>
                 </div>
                 <div className="space-x-1">
                     <span className="text-gray-400">Paymaster specifies Token balance: </span>
                     <span>0</span>
                     <MintTokenModal />
                 </div>
                 <div className="space-x-1">
                     <span className="text-gray-400">NFT casting:</span>
                     <MintNFTModal />
                 </div>
             </div>
         </div>
     )
}

export default StepMint;
