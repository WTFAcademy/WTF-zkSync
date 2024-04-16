import { Icons } from "@/components/icons";
import { truncate } from "@/lib/utils";
import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers5/react";
import { useEffect } from "react";

const StepConnectWallet = ({ next }: { next: () => void }) => {
    const { open } = useWeb3Modal();
    const { address, isConnected } = useWeb3ModalAccount();

    const handleClick = () => {
        open().catch(console.error);
    };

    useEffect(() => {
        if (isConnected) {
            next();
        }
    }, [isConnected]);

    return (
        <div className="px-10 py-8 bg-[#ffffff] rounded-lg shadow flex items-center justify-center">
            <button
                className="rounded-lg border-px border-border"
                onClick={handleClick}
            >
                <div className="flex items-center gap-3 justify-center">
                    <Icons.wallet className="w-4 h-4" />
                    <span>
                        {isConnected ? (
                            <span className="flex items-center gap-2">
                                <span>已连接</span>
                                <span className="text-[#000000] text-sm">
                                    {truncate(address!)}
                                </span>
                            </span>
                        ) : (
                            "连接钱包"
                        )}
                    </span>
                </div>
            </button>
        </div>
    );
};

export default StepConnectWallet;