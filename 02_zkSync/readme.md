---
title: 2. zkSync基础
tags:
  - zksync
---

# WTF zkSync极简入门: 2. zkSync 基础

这个系列教程帮助开发者入门 zkSync 开发。
推特：[@0xAA_Science](https://twitter.com/0xAA_Science)｜[@WTFAcademy_](https://twitter.com/WTFAcademy_) 社区：[Discord](https://discord.gg/5akcruXrsk)｜[微信群](https://docs.google.com/forms/d/e/1FAIpQLSe4KGT8Sh6sJ7hedQRuIYirOoZK_85miz3dw7vA1-YjodgJ-A/viewform?usp=sf_link)｜[官网 wtf.academy](https://wtf.academy) 所有代码和教程开源在 github: [github.com/WTFAcademy/WTF-zkSync](https://github.com/WTFAcademy/WTF-zkSync)

---

这一讲，我们将介绍 zkSync 相关的基础知识。

## 1. zkSync 背景和发展

### 1.1 什么是 zkSync

zkSync 是以太坊的第二层（Layer 2）扩展解决方案，zkSync 构建在 ZK Rollup 架构之上，通过将大量交易批量处理并将结果提交到以太坊主链来实现高性能和低成本的交易。

### 1.2 zkSync 工作原理

### 1.3 zkSync 团队

[Matter labs](https://matter-labs.io/) 是一家德国的区块链技术公司，致力于以太坊扩展，主要开发和创新零知识证明技术。

### 1.4 zkSync1.0、zkSync2.0

- zkSync1.0 ( `zkSync Lite` )：于2020年6月在以太坊主网上启动，zkSync1.0 是 zkSync 的轻量级版本，它提供了简化的支付和资产转移场景。但是它并不兼容以太坊虚拟机（EVM）。

- zkSync2.0 ( `zkSync Era` )：于2023年3月启动，zkSync2.0 对比 1.0 最大的特点就是兼容 EVM，可以执行 Solidity 或以太坊开发中使用的其他高级语言编写的智能合约，极大的降低了开发成本。

## 2. zkSync 的优势

### 2.1 安全性

zkSync 使用零知识证明技术，确保了交易的隐私和安全性。zkSync 的安全模型不依赖于欺诈证明或博弈论，而是建立在独特的安全机制之上。这种模型达到以太坊主网级别的安全，为用户提供高度可信的交易环境。

### 2.2 兼容 EVM

zkSync Era 可以处理几乎所有基于以太坊虚拟机（EVM）的智能合约。在保证高安全的前提下，极大的降低了开发和维护成本。

### 2.3 抽象账户

zkSync Era 是第一个实现原生账户抽象的 EVM 兼容链。其账户可以发起交易，如EOA，但也可以在其中实现任意逻辑，如智能合约。并且通过引入智能帐户和 Paymaster 的概念，从根本上改变了帐户的操作方式。智能帐户是完全可编程的，允许进行各种自定义，例如签名方案、本机多重签名功能、支出限制和特定于应用程序的限制。Paymaster 可以为用户赞助交易，使用户能够用 ERC20 代币支付交易费用。这种创新的账户管理方法显着增强了用户体验、安全性和灵活性，为更广泛采用区块链技术铺平了道路。
