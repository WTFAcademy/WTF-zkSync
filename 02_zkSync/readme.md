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

zkSync 背后的公司 [Matter labs](https://matter-labs.io/)  总部位于德国，由 Alex Gluchowski 于 2018 年创立，并迅速发展到拥有 50 多名员工。该团队由经验丰富的区块链开发人员、研究人员和企业家组成，他们齐心协力创造一种更高效、更具成本效益且更安全的以太坊交易方式。以下是一些核心成员：

- Alex Gluchowski：Matter Labs的联合创始人和CEO，是zkSync项目的主要负责人之一，拥有丰富的区块链和密码学经验。

- Alex Vlasov：Matter Labs的联合创始人和CTO，是zkSync项目的主要技术负责人之一，拥有深厚的技术背景和丰富的经验。

- Dmitry Khovratovich：Matter Labs的首席科学家，是密码学领域的知名专家之一，曾在多个国际密码学会议上发表过重要的论文。

团队的融资信息如下：

- 2019/09，种子轮融资 200 万美元
- 2021/02，A轮融资600万美元（Binance、Aave、Curve 和 Coinbase Ventures）
- 2021/11，B轮融资5000万美元（a16z Crypto 领投）
- 2022/01，融资2亿美元（BitDAO）
- 2022/11，C轮融资2 亿美元（Dragonfly 和 Blockchain Capital 领投）

### 1.4 zkSync1.0、zkSync2.0

- zkSync1.0 ( `zkSync Lite` )：于2020年6月在以太坊主网上启动，zkSync1.0 是 zkSync 的轻量级版本，它提供了简化的支付和资产转移场景。但是它并不兼容以太坊虚拟机（EVM）。
- zkSync2.0 ( `zkSync Era` )：于2023年3月启动，zkSync2.0 对比 1.0 最大的特点就是兼容 EVM，可以执行 Solidity 或以太坊开发中使用的其他高级语言编写的智能合约，极大的降低了开发成本。

1.0和2.0的主要区别如下：

- 智能合约

  - zkSync 1.0提供了简化的支付和资产转移场景，并不支持以太坊虚拟机兼容的智能合约。

  - zkSync 2.0提供了对 EVM 兼容智能合约的完全支持，开发者可以在zkSync 2.0上轻松地部署以太坊智能合约 。

- 账户抽象

  - zkSync 2.0 提供了账户抽象的新功能，允许用户使用任何签名方案与智能合约进行交互，简化了用户和智能合约之间的交互，从而提高了用户体验。

- 可组合性

  - zkSync 1.0 仅支持有限的跨合约交互

  - zkSync 2.0 通过保留关键 EVM 功能（如智能合约可组合性）提高了协议间互操作性，这使得 zkSync 2.0 更适合构建复杂的去中心化金融（DeFi）应用程序。

- 开发工具
  - zkSync 2.0 配备了包括 CLI（命令行界面）和 SDK（软件开发工具包）等开发者工具，使开发者能够更轻松地构建和部署基于 zkSync 的应用程序。

## 2. zkSync 的优势

### 2.1 安全性

zkSync 使用零知识证明技术，确保了交易的隐私和安全性。zkSync 的安全模型不依赖于欺诈证明或博弈论，而是建立在独特的安全机制之上。这种模型达到以太坊主网级别的安全，为用户提供高度可信的交易环境。

### 2.2 兼容 EVM

zkSync Era 可以处理几乎所有基于以太坊虚拟机（EVM）的智能合约。在保证高安全的前提下，极大的降低了开发和维护成本。

### 2.3 抽象账户

zkSync Era 是第一个实现原生账户抽象的 EVM 兼容链。其账户可以发起交易，如EOA，但也可以在其中实现任意逻辑，如智能合约。并且通过引入智能帐户和 Paymaster 的概念，从根本上改变了帐户的操作方式。智能帐户是完全可编程的，允许进行各种自定义，例如签名方案、本机多重签名功能、支出限制和特定于应用程序的限制。Paymaster 可以为用户赞助交易，使用户能够用 ERC20 代币支付交易费用。这种创新的账户管理方法显着增强了用户体验、安全性和灵活性，为更广泛采用区块链技术铺平了道路。
