"use client";
import { Web3ModalProvider } from "@/context/web3-modal";
import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <Web3ModalProvider>{children}</Web3ModalProvider>
        </QueryClientProvider>
    );
}