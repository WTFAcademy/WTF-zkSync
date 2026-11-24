"use client";

import {Icons} from "@/components/icons";
import {useEffect} from "react";
import {truncate} from "@/lib/utils";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

const StepConnectWallet = ({next}: {next: () => void}) => {
    const { open } = useAppKit();
    const {address, isConnected} = useAppKitAccount();

    const handleClick = () => {
        open().catch(console.error);
    }

    useEffect(() => {
        if (isConnected) {
            next();
        }
    }, [isConnected]);

    return (
        <div className="px-10 py-8 bg-[#ffffff] rounded-lg shadow flex items-center justify-center">
            <button className="rounded-lg border-px border-border" onClick={handleClick}>
                <div className="flex items-center gap-3 justify-center">
                    <Icons.wallet className="w-4 h-4" />
                    <span>{isConnected ? (
                        <span className="flex items-center gap-2">
                            <span>已连接</span>
                            <span className="text-[#000000] text-sm">{truncate(address!)}</span>
                        </span>
                    ) : "连接钱包"}</span>
                </div>
            </button>
        </div>
    )
}

export default StepConnectWallet;
