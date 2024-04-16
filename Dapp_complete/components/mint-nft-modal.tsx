"use client";

import { NFT_ADDRESS } from "@/constants/contract";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useQuery } from "react-query";
import { useState } from "react";
import { Button } from "./ui/button";
import Checkout from "./checkout";
import useNft from "@/hooks/use-nft";
import useToken from "@/hooks/use-token";

const MintNFTModal = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const {
        nftBalance,
        getNFTMintEstimate,
        mint,
        isMintLoading
    } = useNft();

    const { canNonGas } = useToken();

    const {
        data: nftMintEstimate,
        isLoading: isTokenMintEstimateLoading
    } = useQuery("nftMintEstimate", getNFTMintEstimate, {
        enabled: openModal
    })

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger>
                <a className="text-blue-600 cursor-pointer">Mint</a>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>领取支付代币 {canNonGas && "(无GAS版)"}</DialogTitle>
                    <DialogDescription>用于支付手续费的代币</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="text-sm">NFT合约地址：{NFT_ADDRESS}</div>
                    <div className="text-sm">当前账户持有NFT：{nftBalance || 0}</div>
                    <Checkout
                        gas={nftMintEstimate?.gas}
                        gasPrice={nftMintEstimate?.gasPrice}
                        cost={nftMintEstimate?.cost}
                        nonGas={canNonGas}
                        transaction="Mint (amount = 1)"
                    />
                </div>
                <DialogFooter>
                    <Button
                        size="sm"
                        className="w-full"
                        disabled={isMintLoading}
                        onClick={() => mint()}
                    >开始执行</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default MintNFTModal;