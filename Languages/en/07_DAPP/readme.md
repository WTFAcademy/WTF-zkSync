---
title: 7. Dapp
tags:
   - ethereum
   - layer 2
   - rollup
   - zk
   - zksync
   - testing
   - hardhat
---

# 7. Build a zkSync DApp

This lesson connects a wallet on zkSync Sepolia, reads balances, mints an ERC-20 test token, then uses it to cover an NFT mint through a paymaster. The examples use ethers 6, `zksync-ethers` 6, TanStack Query 5, Reown AppKit 2, Next.js 16, and React 19.

## Run the example

1. Open [Dapp_template](../../Dapp_template), or use the [completed example](../../Dapp_complete).
2. Use Node.js 22.12 or newer and run `npm ci`.
3. Set `NEXT_PUBLIC_REOWN_PROJECT_ID` to your Reown project ID. Set `NEXT_PUBLIC_APP_URL` when deploying outside `http://localhost:3000`.
4. Run `npm run dev`. Connect a test wallet and select zkSync Sepolia (chain ID 300). Verify the contract addresses in [`constants/contract.ts`](../../Dapp_template/constants/contract.ts) before sending any test transactions.

## How the pieces fit

- [Wallet setup](../../Dapp_template/context/web3-modal.tsx) registers the ethers adapter and the test network. The [wallet hook](../../Dapp_template/hooks/use-zksync-wallet.ts) validates the network before getting an ethers v6 signer.
- The [token hook](../../Dapp_template/hooks/use-token.ts) reads the balance and allowance with TanStack Query, compares native `bigint` values, mints test tokens and can approve the minimum allowance.
- The [paymaster hook](../../Dapp_template/hooks/use-paymaster.ts) builds `ApprovalBased` parameters. The [NFT hook](../../Dapp_template/hooks/use-nft.ts) attaches them as `customData` when the wallet has sufficient tokens. Both wait for a receipt before updating the displayed balance.

Use `npm run build` to check the application or inspect the [zkSync ethers v6 docs](https://docs.zksync.io/zksync-era/sdk/js/ethers).
