"use client";

import { NFT_ADDRESS } from "@/constants/contract";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useState } from "react";
import { Button } from "./ui/button";
import Checkout from "./checkout";

const MintNFTModal = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);

    // 1. 使用 useNft hook 获取 nftBalance,mint等执行函数和状态
    // 2. 计算fee, GasPrice, 实际支出
    // 3. 使用Checkout组件展示支付信息
    // 4. 新增执行按钮    

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger>
                <a className="text-blue-600 cursor-pointer">Mint</a>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>铸造NFT</DialogTitle>
                    <DialogDescription>可使用WTF测试币作为手续费铸造NFT</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="text-sm">NFT合约地址：{NFT_ADDRESS}</div>
                    <div className="text-sm">当前账户持有NFT：0</div>
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
                    >开始执行</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default MintNFTModal;