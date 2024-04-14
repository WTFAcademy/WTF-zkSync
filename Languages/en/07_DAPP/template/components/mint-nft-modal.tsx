"use client";

import { NFT_ADDRESS } from "@/constants/contract";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useState } from "react";
import { Button } from "./ui/button";
import Checkout from "./checkout";

const MintNFTModal = () => {
     const [openModal, setOpenModal] = useState<boolean>(false);

     // 1. Use useNft hook to obtain nftBalance, mint and other execution functions and status
     // 2. Calculate fee, GasPrice, actual expenditure
     // 3. Use the Checkout component to display payment information
     // 4. Add execution button

     return (
         <Dialog open={openModal} onOpenChange={setOpenModal}>
             <DialogTrigger>
                 <a className="text-blue-600 cursor-pointer">Mint</a>
             </DialogTrigger>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>Minting NFT</DialogTitle>
                     <DialogDescription>WTF test coins can be used as handling fees to mint NFT</DialogDescription>
                 </DialogHeader>
                 <div className="flex flex-col gap-4 mb-4">
                     <div className="text-sm">NFT contract address: {NFT_ADDRESS}</div>
                     <div className="text-sm">Current account holds NFT: 0</div>
                     <Checkout
                         gas={"0"}
                         gasPrice={"0"}
                         cost={"0"}
                         nonGas={false}
                         transaction="Mint (amount = 1)"
                     />
                 </div>
                 <DialogFooter>
                     <Button
                         size="sm"
                         className="w-full"
                     >Start execution</Button>
                 </DialogFooter>
             </DialogContent>
         </Dialog>
     )
}

export default MintNFTModal;
