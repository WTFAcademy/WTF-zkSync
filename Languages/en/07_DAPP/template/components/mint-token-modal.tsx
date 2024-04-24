"use client";

import { TOKEN_ADDRESS } from "@/constants/contract";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import useToken from "@/hooks/use-token";
import { useQuery } from "react-query";
import { useState } from "react";
import { Button } from "./ui/button";
import Checkout from "./checkout";

const MintTokenModal = () => {
     const [openModal, setOpenModal] = useState<boolean>(false);
   
     // 1. Use useToken hook to obtain tokenBalance, mint and other execution functions and status
     // 2. Calculate fee, GasPrice, actual expenditure
     // 3. Use the Checkout component to display payment information
     // 4. Add execution and authorization buttons

     return (
         <Dialog open={openModal} onOpenChange={setOpenModal}>
             <DialogTrigger>
                 <a className="text-blue-600">Mint</a>
             </DialogTrigger>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>Receive payment tokens</DialogTitle>
                     <DialogDescription>Token used to pay handling fees</DialogDescription>
                 </DialogHeader>
                 <div className="flex flex-col gap-4 mb-4">
                     <div className="text-sm">Token contract address: {TOKEN_ADDRESS}</div>
                     <div className="text-sm">Current account token balance: 0 WTF</div>
                     <Checkout
                         gas={"0"}
                         gasPrice={"0"}
                         cost={"0"}
                         nonGas={false}
                         transaction="Mint (amount = 1000 WTF)"
                     />
                 </div>
                 <DialogFooter>
                     {/* Add execution and authorization buttons */}
                 </DialogFooter>
             </DialogContent>
         </Dialog>
     )
}

export default MintTokenModal;
