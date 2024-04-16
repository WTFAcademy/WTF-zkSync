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
        isApprovePaymasterLoading,
    } = useToken();

    const {
        data: tokenMintEstimate,
        isLoading: isTokenMintEstimateLoading,
    } = useQuery("tokenMintEstimate", getTokenMintEstimate, {
        enabled: openModal,
    });

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger>
                <a className="text-blue-600">Mint</a>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        领取支付代币 {canNonGas && "(无GAS版)"}
                    </DialogTitle>
                    <DialogDescription>用于支付手续费的代币</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="text-sm">代币合约地址：{TOKEN_ADDRESS}</div>
                    <div className="text-sm">
                        当前账户代币余额：{tokenBalance || 0} WTF
                    </div>
                    <Checkout
                        gas={tokenMintEstimate?.gas}
                        gasPrice={tokenMintEstimate?.gasPrice}
                        cost={tokenMintEstimate?.cost}
                        nonGas={canNonGas}
                        transaction="Mint (amount = 1000 WTF)"
                    />
                </div>
                <DialogFooter>
                    {isAllowancePaymaster ? (
                        <Button
                            size="sm"
                            className="w-full"
                            disabled={isMintLoading}
                            onClick={() => mint()}
                        >
                            开始执行
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="w-full"
                            disabled={isApprovePaymasterLoading}
                            onClick={() => approvePaymaster()}
                        >
                            授权代币作为手续费支付
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MintTokenModal;