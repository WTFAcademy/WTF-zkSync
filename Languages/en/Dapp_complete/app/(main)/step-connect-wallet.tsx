"use client";

import {Icons} from "@/components/icons";
import {useEffect} from "react";
import {truncate} from "@/lib/utils";
import { useSwitchNetwork, useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers5/react";

const StepConnectWallet = ({next}: {next: () => void}) => {
    const { open } = useWeb3Modal();
    const {address, isConnected} = useWeb3ModalAccount();

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
                            <span>Connected</span>
                            <span className="text-[#000000] text-sm">{truncate(address!)}</span>
                        </span>
                    ) : "Connect wallet"}</span>
                </div>
            </button>
        </div>
    )
}

export default StepConnectWallet;
