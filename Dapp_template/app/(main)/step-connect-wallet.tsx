"use client";

import {Icons} from "@/components/icons";

const StepConnectWallet = ({next}: {next: () => void}) => {

    // 1. 使用web3modal hook获取钱包连接状态
    // 2. 若未连接点击连接钱包按钮，打开链接
    // 3. 若已连接执行next跳到下一步

    const handleClick = () => {
        next();
    }

    return (
        <div className="px-10 py-8 bg-[#ffffff] rounded-lg shadow flex items-center justify-center">
            <button className="rounded-lg border-px border-border" onClick={handleClick}>
                <div className="flex items-center gap-3 justify-center">
                    <Icons.wallet className="w-4 h-4" />
                    <span>连接钱包</span>
                </div>
            </button>
        </div>
    )
}

export default StepConnectWallet;
