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

## 与Ethereum的差异

尽管大部分内容都与Ethereum并无太大差异，但必要情况下还请阅读[差异文档](https://docs.zksync.io/build/developer-reference/differences-with-ethereum.html)或本系列教程的上一讲。

## 2. 创建项目

在终端中使用此命令来创建一个初始项目：
``` shell
npx zksync-cli create hello-zksync
```

创建项目时相关可选配置参考如下：
> 部分网络环境下使用npm可能会导致项目依赖安装过慢，请根据自己的实际情况切换到[bun](https://bun.sh/)/[yarn](https://classic.yarnpkg.com/en/docs/install)/[pnpm](https://pnpm.io/next/installation)。
``` shell
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

``` shell
npm run compile
```
执行后你将看到如下输出, 并出现两个新目录（artifacts-zk、cache-zk）：
``` shell
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

``` shell
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

``` shell
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