```yaml
title: 1. Layer 2 基础
tags:

- ethereum
- layer 2
- rollup
- zk
- zksync
```

# WTF zkSync极简入门: 1. Layer 2 基础

这个系列教程帮助开发者入门 zkSync 开发。
推特：[@0xAA_Science](https://twitter.com/0xAA_Science)｜[@WTFAcademy_](https://twitter.com/WTFAcademy_) 社区：[Discord](https://discord.gg/5akcruXrsk)｜[微信群](https://docs.google.com/forms/d/e/1FAIpQLSe4KGT8Sh6sJ7hedQRuIYirOoZK_85miz3dw7vA1-YjodgJ-A/viewform?usp=sf_link)｜[官网 wtf.academy](https://wtf.academy) 所有代码和教程开源在 github: [github.com/WTFAcademy/WTF-zkSync](https://github.com/WTFAcademy/WTF-zkSync)

---

这一讲，我们将介绍 zkSync 和 Ethereum 的不同点，以及 zkSync 的生态和一些常用的工具。

### 1. 与以太坊的区别

zkSync Era 可以处理绝大多数基于以太坊虚拟机（EVM）的智能合约，并坚守严格的安全标准，从而极大程度地降低了重复进行安全审计的必要性。然而，我们仍需认识到以下几点存在的差异。

#### 1.1 EVM 指令

- `CREATE、CREATE2`：zkSync Era 中的合约部署是通过向 **ContractDeployer*** 系统合约传入合约字节码（**EIP712** 的 **factoryDeps** 中包含）的哈希值来实现的。

- `CALL、STATICCALL、DELEGATEALL`：zkSync Era 调用时的内存增长发生在调用结束后，这导致了返回数据的拷贝仅在调用结束后进行。

- `MSTORE、MLOAD`：在 zkEVM 中，内存增长是按字节计算的，而不是像 EVM 上是按字数计算的。

- `CALLDATALOAD、CALLDATACOPY`：在 zkEVM 内部，**calldatacopy(to, offset, len)** 实际上是一个循环，每次迭代都会执行 **calldataload** 和 **mstore**。

- `RETURN、STOP`：如果在构造函数中使用 **assembly** 并添加了 **return** 或 **stop()**，将导致 immutable 的变量初始化失败。

- `TIMESTAMP、MUMBER`：

- `COINBASE`：返回 **Bootloader** 合约的地址。

- `DIFFICULTY、PREVRANDAO`：在 zkEVM 中会返回常量 `2500000000000000`。

- `BASEFEE`：zkSync Era中的 gas 价格不是固定的，而是由费用模型定义的。通常情况下，gas 价格为0.25 gwei，但在 L1 的 gas 价格非常高时，可能会上涨。

- `SELFDESTRUCT`：在 zkEVM 编译器会产生编译时错误。

- `CALLCODE`：在 zkEVM 编译器会产生编译时错误。

- `PC`：在 zkEVM 编译器会产生编译时错误。

- `CODESIZE`：
  
  - 部署代码：构造器参数大小。
  
  - 运行时代码：合约大小。

- `CODECOPY`：
  
  - 部署代码：复制构造器参数。
  
  - 运行时代码（旧 EVM）：将内存清零。
  
  - 运行时代码（新 EVM）：编译时错误。

- `EXTCODECOPY`：在 zkEVM 架构中，合约字节码不可访问，只能通过 CODESIZE 和 EXTCODESIZE 获取其大小。此外，尝试使用 EXTCODECOPY 指令会导致 zkEVM 编译器产生编译时错误，因此无法在 zkEVM 架构中执行这一操作。

- `DATASIZE、DATAOFFSET、DATACOPY`：在 zkEVM 协议中，合约部署由两部分处理：编译器前端和名为 ContractDeployer 的系统合约。在编译器前端，部署合约的代码被其哈希替换，然后通过调用 ContractDeployer 合约传递给它。

- `SETIMMUTABLE、LOADIMMUTABLE`：在 zkEVM 中，无法直接访问合约的字节码，因此不可变值的行为通过系统合约进行模拟。

#### 1.2 Nonces

- zkSync 引入了两种不同的 Nonce：`交易 Nonce` 和 `部署 Nonce`。交易 Nonce 用于交易验证，而部署 Nonce 在合约部署时增加。这样，账户可以通过仅跟随一个 Nonce 值发送多个交易，而合约可以部署许多其他合约而不会与交易 Nonce 冲突。

- 新创建的合约在 zkSync 中的部署 Nonce 值为 0，而在以太坊中，根据 EIP161 规范，新创建的合约的 Nonce 从 1 开始。

- 在 zkSync 中，仅在部署成功时才会增加部署 Nonce。而在以太坊中，即使创建失败，部署时 Nonce 也会更新。

#### 1.3 库

- **库内联依赖 solc 优化器**：zkSync 依赖 solc 优化器进行库内联。只有在优化器内联了库时，库才能在不部署的情况下使用

- **部署的库地址需在项目配置中设置**

- **所有链接发生在编译时**：不支持部署时链接。

#### 1.4 预编译

- **部分 EVM 加密预编译不可用**：特别是配对和 RSA 等一些 EVM 加密预编译目前不可用。但是，允许在不修改的情况下部署 Hyperchains 和 Aztec/Dark Forest 等。

- **支持以太坊密码原语作为预编译**：支持 ecrecover、keccak256、sha256、ecadd 和 ecmul 等。

#### 1.5 原生抽象账户 vs EIP 4337

zkSync 的原生抽象账户和以太坊的 EIP4337 都旨在增强账户的灵活性和用户体验，但他们也有一些不同的地方：

- **实现**：zkSync 的抽象账户集成在协议层面。

- **账户类型**：在 zkSync 中智能合约账户和普通账户都是 `first-class citizens`。

- **交易处理**：zkSync Era 对来自外部账户（EOAs）和智能合约账户的交易统一使用一个内存池。

### 2. 生态&工具

#### 2.1 区块链浏览器

**zkSync Era Block Explorer** ( https://explorer.zksync.io/ )

zkSync Era Block Explorer 提供 zkSync 网络上所有交易、区块、合约等信息。

#### 2.2 zkSync 水龙头

**Chainstack Faucet** ( https://faucet.chainstack.com/zksync-testnet-faucet )

#### 2.3 zkSync CLI

**zkSync CLI** ( https://github.com/matter-labs/zksync-cli ) 是一个用于简化 zkSync 开发与交互的命令行工具。它提供了诸如管理本地开发环境、与合约交互、管理令牌等功能的命令。

##### 2.3.1 所需环境

- [nodejs@18 及以上]( https://nodejs.org/en )

- [Git]( https://git-scm.com/downloads )

- [Docker](https://www.docker.com/get-started/)

##### 2.3.2 使用

```
npx zksync-cli dev start
```

首次运行时需要选择**节点类型**和**附加的模块**（后续可通过 `npx zksync-cli dev config` 修改）。

- Node to use
  
  - In memory node：使用内存建立本地测试环境，只有 L2 节点，[测试账户地址和私钥](https://docs.zksync.io/build/test-and-debug/era-test-node.html#use-pre-configured-rich-wallets)。
  
  - Dockerized node：使用 Docker 建立本地测试环境，包含 L1 和 L2 节点。

- Additional modules to use
  
  - Portal：添加钱包和跨链桥相关功能。
  
  - Block Explorer：添加 zkSync 区块链浏览器 UI 和 API 相关功能。

> 后续演示环境：`In memory node` 且 `不安装附加模块`。

#### 2.4 zkSync Remix

[Remix IDE](https://remix.ethereum.org/) 也支持 zkSync 合约开发，只需要我们安装对应插件即可。下面我们将演示如何结合 `zksync-cli` 搭建本地开发环境，并部署一个最简单的合约。

##### 2.4.1 开启本地开发环境

在命令行工具中执行 `npx zksync-cli dev start`（需要启动 docker ）。

##### 2.4.2 安装插件

点击左边菜单栏底部的 `插件管理` 选项，搜索 `ZKSYNC` 并启用插件。启用成功后可以在左边菜单栏中看到 zkSync 的Logo，我们点击它进入 zkSync 的开发环境。

<img title="" src="./img/remix01.png" alt="插件下载" data-align="center">

##### 2.4.3 案例测试

1. 新建文件 `HelloZkSync.sol`。

2. 编辑合约。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract HelloZkSync {
    string public str = "Hello zkSync!";
}
```

3. 编译合约，点击 `Compile HelloZkSync.sol` 进行编译。

4. 部署合约，在下方 `Environment selection` 中选择 `Local Devnet`，并部署 `HelloZkSync` 合约。

<img src="./img/remix02.png" title="" alt="环境选择" data-align="center">

5. 合约交互，部署成功后，点击 `str` 即可在控制台中看到 `"Hello zkSync!"` 输出。至此，我们就完成了使用 [Remix IDE](https://remix.ethereum.org/) 开发一个简单的智能合约。

#### 2.5 Hardhat plugins

zkSync 官方也提供了 Hardhat 支持，并且我们可以使用 `zksync-cli` 快速创建 Hardhat 项目。

```
npx zksync-cli create
```

根据提示输入项目名称，选择 `Contracts` 选项，根据自己的需求选择 `Ethers` 版本（v6 / v5）、 `智能合约语言`（Solidity / Vyper）、部署私钥（可选）和依赖包管理方式。创建完成后即可使用 Hardhat 在 zkSync 上开发智能合约。

#### 2.6 Foundry with zkSync

[foundry-zksync](https://github.com/matter-labs/foundry-zksync) 允许用户使用 foundry 在 zkSync 上进行智能合约开发，引入 `zkforge` 和 `zkcast` 扩展了原有的 `forge` 和 `cast` 使开发人员能更加便捷地在 zkSync 进行开发。

#### 2.7 In-Memory node

`In-Memory node` 使用内存数据库来存储状态信息，并使用简化的 hashmaps 来跟踪区块和交易。使用 `npx zksync-cli dev start` 可以快速启动 `In-Memory node`。

#### 2.8 zksync-ethers

[zksync-ethers](https://github.com/zksync-sdk/zksync-ethers) 扩展了 `ethers` 库以支持 zkSync 特有的功能（如账户抽象）。

##### 2.8.1 安装

```
pnpm i zksync-ethers ethers@6
```

##### 2.8.2 连接到 zkSync Era 网络

```js
import { Provider, utils, types } from "zksync-ethers";
import { ethers } from "ethers";

const provider = Provider.getDefaultProvider(types.Network.Sepolia); // zkSync Era testnet (L2)
const ethProvider = ethers.getDefaultProvider("sepolia"); // Sepolia testnet (L1)
```

#### 2.9 垮链桥

[zkSync Bridge | Transfer funds between zkSync and Ethereum](https://portal.zksync.io/bridge/)

#### 2.10 其他社区工具
