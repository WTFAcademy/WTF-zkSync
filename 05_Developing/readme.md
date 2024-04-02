---
title: 5. 合约开发
tags:
  - ethereum
  - layer 2
  - rollup
  - zk
  - zksync
  - hardhat
  - ethers
---

# WTF zkSync极简入门: 5. 合约开发

这个系列教程帮助开发者入门 zkSync 开发。

推特：[@0xAA_Science](https://twitter.com/0xAA_Science)｜[@WTFAcademy_](https://twitter.com/WTFAcademy_)

社区：[Discord](https://discord.gg/5akcruXrsk)｜[微信群](https://docs.google.com/forms/d/e/1FAIpQLSe4KGT8Sh6sJ7hedQRuIYirOoZK_85miz3dw7vA1-YjodgJ-A/viewform?usp=sf_link)｜[官网 wtf.academy](https://wtf.academy)

所有代码和教程开源在 github: [github.com/WTFAcademy/WTF-zkSync](https://github.com/WTFAcademy/WTF-zkSync)

---

这一讲，我们将介绍如何在zkSync上进行合约开发。

我们将会使用官方的zksync-cli进行项目创建并使用初始项目自带的合约进行编译、部署与交互。

## 1. 准备工作

* 请确保您的机器上有完整的[Node.js](https://nodejs.org/en/download)环境。
* 请确保您的钱包在ZkSync Sepolia网络上有余额。

### Faucet

[Chainstack Faucet](https://faucet.chainstack.com/zksync-testnet-faucet)

### Bridge

[ZkSync Bridge](https://portal.zksync.io/bridge/?network=sepolia)

### 与以太坊的区别

zkSync Era 可以处理绝大多数基于以太坊虚拟机（EVM）的智能合约，并维持高安全标准，从而减少了重复进行安全审计的需求。但是，我们还是需要了解以下差异。

> 必要情况下还请阅读[差异文档](https://docs.zksync.io/build/developer-reference/differences-with-ethereum.html)。

#### EVM 指令

- `CREATE、CREATE2`：zkSync Era 中的合约部署是通过向 **ContractDeployer** 系统合约传入合约字节码（**EIP712** 的 **factoryDeps** 中包含）的哈希值来实现的。

- `CALL、STATICCALL、DELEGATECALL`：zkSync Era 调用时的内存增长发生在调用结束后，这导致了返回数据的拷贝仅在调用结束后进行。

- `MSTORE、MLOAD`：在 zkEVM 中，内存增长是按字节计算的，而不是像 EVM 上是按字数计算的。

- `CALLDATALOAD、CALLDATACOPY`：在 zkEVM 内部，**calldatacopy(to, offset, len)** 实际上是一个循环，每次迭代都会执行 **calldataload** 和 **mstore**。

- `RETURN、STOP`：如果在构造函数中使用 **assembly** 并添加了 **return** 或 **stop()**，将导致 immutable 的变量初始化失败。

- `TIMESTAMP、NUMBER`：获取 zkSync 上当前区块的时间戳（单位为秒）、区块高度（如果处于 padding 状态则为 null）

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

#### Nonces

- zkSync 引入了两种不同的 Nonce：`交易 Nonce` 和 `部署 Nonce`。交易 Nonce 主要是用于验证交易的唯一性和顺序，确保交易不会被重复执行或篡改。而部署 Nonce 则在合约部署时递增，用以区分和标识每一次的合约部署操作。通过这种机制，账户能够连续发送多个交易，仅需关注并遵循单一的 Nonce 值。同时，合约能够部署多个其他合约，而不会与交易的 Nonce 发生混淆或冲突，从而确保了交易和合约部署的有序性和安全性。

- 在 zkSync 中，新创建的合约起始部署 Nonce 值设定为0，而在以太坊生态系统中，遵循 EIP161 规范，新部署的合约的 Nonce 起始值则是从1开始计算。

- 在 zkSync 中，部署 Nonce 仅在合约部署成功时才会进行递增。然而，在以太坊中，即使合约创建操作未能成功，部署时的 Nonce 值依然会进行更新。

#### 库

- **库内联依赖 solc 优化器**：zkSync 依赖 solc 优化器进行库内联。只有当优化器成功地将库进行内联处理后，库才能够在未进行单独部署的情况下得以运用。

- **部署的库地址需在项目配置中设置**

- **所有链接发生在编译时**：不支持部署时链接。

#### 预编译

- **部分 EVM 加密预编译不可用**：特别是配对和 RSA 等一些 EVM 加密预编译目前不可用。但是，允许在不修改的情况下部署 Hyperchains 和 Aztec/Dark Forest 等。

- **支持以太坊密码原语作为预编译**：支持 ecrecover、keccak256、sha256、ecadd 和 ecmul 等。

#### 原生抽象账户 vs EIP 4337

zkSync 的原生抽象账户和以太坊的 EIP4337 都旨在增强账户的灵活性和用户体验，但他们也有一些不同的地方：

- **实现**：zkSync 的抽象账户集成在协议层面。而 EIP4337 则避免了在协议层面实施。

- **账户类型**：在 zkSync 中智能合约账户和基础账户都是一等公民。

- **交易处理**：zkSync Era 使用统一的内存池来处理基础账户（EOA）和智能合约账户的交易。

## 2. 创建项目

在终端中使用此命令来创建一个初始项目：

```shell
npx zksync-cli create hello-zksync
```

创建项目时相关可选配置参考如下：

> 部分网络环境下使用npm可能会导致项目依赖安装过慢，请根据自己的实际情况切换到[bun](https://bun.sh/)/[yarn](https://classic.yarnpkg.com/en/docs/install)/[pnpm](https://pnpm.io/next/installation)。

```shell
➜ npx zksync-cli create hello-zksync
Need to install the following packages:
zksync-cli@1.6.0
Ok to proceed? (y) y
? What type of project do you want to create? Contracts
? Ethereum framework Ethers v6
? Template Hardhat + Solidity
? Private key of the wallet responsible for deploying contracts (optional) ****************************************************************
? Package manager npm
```

## 3. 项目结构

初始项目有以下内容较为重要：

* `contracts` 存放合约的目录，初始化的项目中包含了部分示例，如ERC20、NFT及ZkSync独有的Paymaster。
* `deploy` 存放合约部署脚本的目录。
* `hardhat.config.ts` 项目的hardhat配置文件。

接下来我们将通过初始项目中的Greeter合约来演示其余的操作。

## 4. 编译合约

```shell
npm run compile
```

执行后你将看到如下输出, 并出现两个新目录（artifacts-zk、cache-zk）：

```shell
(base) ➜  hello-zksync npm run compile

> compile
> hardhat compile

Downloading zksolc 1.4.0
zksolc version 1.4.0 successfully downloaded
Compiling contracts for zkSync Era with zksolc v1.4.0 and solc v0.8.17
Compiling 48 Solidity files
Successfully compiled 48 Solidity files
```

## 5. 部署与验证合约

```shell
npm run deploy
```

执行后我们将看到如下输出，其中可以看到合约所部署的地址，与此同时，部署脚本会自动将合约在区块浏览器上进行验证。

比如这里所部署的合约地址为：0xEf975420c0E946273e1D05eAB139D75bEbc785d9

区块浏览器地址为：https://sepolia.explorer.zksync.io/address/0xEf975420c0E946273e1D05eAB139D75bEbc785d9

如果您自己操作后并未在区块浏览器中搜索到，稍等片刻即可。

```
(base) ➜  hello-zksync npm run deploy

> deploy
> hardhat deploy-zksync --script deploy.ts


Starting deployment process of "Greeter"...
Estimated deployment cost: 0.0001367424 ETH

"Greeter" was successfully deployed:
 - Contract address: 0xEf975420c0E946273e1D05eAB139D75bEbc785d9
 - Contract source: contracts/Greeter.sol:Greeter
 - Encoded constructor arguments: 0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000094869207468657265210000000000000000000000000000000000000000000000

Requesting contract verification...
Your verification ID is: 9774
Contract successfully verified on zkSync block explorer!
```

## 6. 与合约交互

初始项目中还附带了一个与合约交互的示例(`deploy/interact.ts`),您可以将上一步所得到的合约地址填入此文件的`CONTRACT_ADDRESS`变量，并执行如下命令进行交互：

```shell
npm run interact
```

交互输出如下：

```
(base) ➜  hello-zksync npm run interact

> interact
> hardhat deploy-zksync --script interact.ts

Running script to interact with contract 0xEf975420c0E946273e1D05eAB139D75bEbc785d9
Current message is: Hi there!
Transaction hash of setting new message: 0x64b84eaa7a1bea44936d84ce73af8316cc5840d22d6403edcb1e421758f6bc55
The message now is: Hello people!
```

该交互读取了合约当前所使用的message为`Hi there!`，并发送交易调用合约将message修改为`Hello people!`。

## 7. 注意

以上所使用的`部署`与`交互`命令是项目预先定义在`package.json`文件中的，在开发其他合约时请按照自己的需求对`package.json`中的文件参数（`--script deploy.ts`）进行修改。

## 8. 总结

这一节我们尝试了在ZkSync上进行合约开发的主要流程。

下一讲我们将对合约的测试环节进行实践。