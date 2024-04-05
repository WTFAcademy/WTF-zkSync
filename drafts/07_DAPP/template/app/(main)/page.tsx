"use client";

import {useState} from "react";
import StepConnectWallet from "@/app/(main)/step-connect-wallet";
import StepMint from "@/app/(main)/step-mint";

enum EStep {
    CONNECT,
    MINT
}

export default function Home() {
    const [step, setStep] = useState(EStep.CONNECT);

    const next = () => {
        setStep(EStep.MINT);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {step === EStep.CONNECT && (
                <StepConnectWallet next={next} />
            )}
            {step === EStep.MINT && (
                <StepMint/>
            )}
        </main>
    );
}
