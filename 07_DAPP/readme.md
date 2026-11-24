---
title: 7. Dapp开发教程
tags:
  - ethereum
  - layer 2
  - rollup
  - zk
  - zksync
  - dapp
---

# WTF zkSync 第 7 讲：DApp

本讲在 zkSync Sepolia 上连接钱包、读取余额、铸造测试 ERC-20，并用 Paymaster 支付 NFT 铸造的费用。示例使用 ethers 6、`zksync-ethers` 6、TanStack Query 5、Reown AppKit 2、Next.js 16 和 React 19。

## 运行示例

1. 进入 [Dapp_template](../Dapp_template)，也可以查看[完整示例](../Dapp_complete)。
2. 使用 Node.js 22.12 或更新版本，运行 `npm ci`。
3. 从 Reown 控制台取得项目 ID，设置 `NEXT_PUBLIC_REOWN_PROJECT_ID`。部署到其他域名时，设置 `NEXT_PUBLIC_APP_URL`。
4. 运行 `npm run dev`。连接测试钱包并选择 zkSync Sepolia（链 ID 300）。发送测试交易前，在 [`constants/contract.ts`](../Dapp_template/constants/contract.ts) 中核对本讲的合约地址。

## 阅读代码

- [钱包配置](../Dapp_template/context/web3-modal.tsx) 注册 Ethers 适配器和链。[钱包 hook](../Dapp_template/hooks/use-zksync-wallet.ts) 在创建 signer 前验证当前链。
- [Token hook](../Dapp_template/hooks/use-token.ts) 查询余额和授权，用 `bigint` 比较测试币数量，执行铸造和最小额度授权。
- [Paymaster hook](../Dapp_template/hooks/use-paymaster.ts) 创建 `ApprovalBased` 参数。[NFT hook](../Dapp_template/hooks/use-nft.ts) 在满足条件时通过 `customData` 传入参数，并在交易确认后刷新余额。

运行 `npm run build` 检查前端构建。SDK 的参数说明见 [zkSync ethers v6 文档](https://docs.zksync.io/zksync-era/sdk/js/ethers)。
