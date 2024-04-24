"use client";

import {Icons} from "@/components/icons";

const StepConnectWallet = ({next}: {next: () => void}) => {

     // 1. Use web3modal hook to obtain wallet connection status
     // 2. If not connected, click the Connect Wallet button to open the link.
     // 3. If connected, execute next and jump to the next step.

     const handleClick = () => {
         next();
     }

     return (
         <div className="px-10 py-8 bg-[#ffffff] rounded-lg shadow flex items-center justify-center">
             <button className="rounded-lg border-px border-border" onClick={handleClick}>
                 <div className="flex items-center gap-3 justify-center">
                     <Icons.wallet className="w-4 h-4" />
                     <span>Connect wallet</span>
                 </div>
             </button>
         </div>
     )
}

export default StepConnectWallet;
