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
    const {
        tokenBalance,
        getTokenMintEstimate,
        mint,
        isMintLoading,
        canNonGas,
        isAllowancePaymaster,
        approvePaymaster,
        isApprovePaymasterLoading
    } = useToken();

    const {
        data: tokenMintEstimate,
        isLoading: isTokenMintEstimateLoading
    } = useQuery("tokenMintEstimate", getTokenMintEstimate, {
        enabled: openModal
    })

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger>
                <a className="text-blue-600">Mint</a>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Receive payment tokens {canNonGas && "(No GAS version)"}</DialogTitle>
                    <DialogDescription>Token used to pay fees</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="text-sm">Token contract address：{TOKEN_ADDRESS}</div>
                    <div className="text-sm">Current account token balance：{tokenBalance || 0} WTF</div>
                    <Checkout
                        gas={tokenMintEstimate?.gas}
                        gasPrice={tokenMintEstimate?.gasPrice}
                        cost={tokenMintEstimate?.cost}
                        nonGas={canNonGas}
                        transaction="Mint (amount = 1000 WTF)"
                    />
                </div>
                <DialogFooter>
                    {
                        isAllowancePaymaster ? (
                            <Button
                                size="sm"
                                className="w-full"
                                disabled={isMintLoading}
                                onClick={() => mint()}
                            >Start execution</Button>
                        ) : (
                            <Button
                                size="sm"
                                className="w-full"
                                disabled={isApprovePaymasterLoading}
                                onClick={() => approvePaymaster()}
                            >Authorize tokens to be paid as handling fees</Button>
                        )
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default MintTokenModal;
