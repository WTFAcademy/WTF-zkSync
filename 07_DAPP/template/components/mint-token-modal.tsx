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
   
    // 1. 使用 useToken hook 获取 tokenBalance,mint等执行函数和状态
    // 2. 计算fee, GasPrice, 实际支出
    // 3. 使用Checkout组件展示支付信息
    // 4. 新增执行和授权按钮

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger>
                <a className="text-blue-600">Mint</a>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>领取支付代币</DialogTitle>
                    <DialogDescription>用于支付手续费的代币</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="text-sm">代币合约地址：{TOKEN_ADDRESS}</div>
                    <div className="text-sm">当前账户代币余额: 0 WTF</div>
                    <Checkout
                        gas={"0"}
                        gasPrice={"0"}
                        cost={"0"}
                        nonGas={false}
                        transaction="Mint (amount = 1000 WTF)"
                    />
                </div>
                <DialogFooter>
                    {/* 新增执行和授权按钮 */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default MintTokenModal;