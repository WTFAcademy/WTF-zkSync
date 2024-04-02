---
title: 6. 合约测试
tags:
  - ethereum
  - layer 2
  - rollup
  - zk
  - zksync
  - testing
  - hardhat
---
# WTF zkSync极简入门: 6. 合约测试

这个系列教程帮助开发者入门 zkSync 开发。
推特：[@0xAA_Science](https://twitter.com/0xAA_Science)｜[@WTFAcademy_](https://twitter.com/WTFAcademy_) 社区：[Discord](https://discord.gg/5akcruXrsk)｜[微信群](https://docs.google.com/forms/d/e/1FAIpQLSe4KGT8Sh6sJ7hedQRuIYirOoZK_85miz3dw7vA1-YjodgJ-A/viewform?usp=sf_link)｜[官网 wtf.academy](https://wtf.academy) 所有代码和教程开源在 github: [github.com/WTFAcademy/WTF-zkSync](https://github.com/WTFAcademy/WTF-zkSync)

---
在开发 zkSync 合约时，编写测试程序是验证合约逻辑正确性的关键一环。这一讲将引导你了解如何在 zkSync 合约中编写测试程序。

## 准备工作

在开始前，请确保你已经配置好了 zkSync 环境。你需要安装 Node.js、NPM 以及Hardhat，这是一个以太坊开发环境，能够让你编译、部署和测试你的智能合约。

如果你还没有安装 Hardhat，可以通过以下命令安装：

```shell
npm install -D hardhat
```

接下来，创建一个新的 Hardhat 项目：

```shell
npx hardhat
```

按照提示完成项目设置后，你的 zkSync 开发环境就准备完成了。

## 编写智能合约

在 `contracts` 文件夹中创建一个新的 Solidity 智能合约文件 `MyContract.sol`。这里，我们将简单地编写一个存储和更新数字的合约作为例子：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    uint public myNumber;

    function setMyNumber(uint _myNumber) external {
        myNumber = _myNumber;
    }

    function getMyNumber() external view returns (uint) {
        return myNumber;
    }
}
```

## 编写测试程序

测试编写的智能合约是保证其按预期工作的重要步骤。Hardhat 使用 Mocha 测试框架和 Waffle 断言库来编写测试。在 `test` 文件夹中，创建一个新的测试文件 `MyContract.test.js`。

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyContract", function () {

    it("Should return the new number once it's changed", async function () {
        const MyContract = await ethers.getContractFactory("MyContract");
        const myContract = await MyContract.deploy();
        await myContract.deployed();

        const setTx = await myContract.setMyNumber(7);

        // 等待交易完成
        await setTx.wait();

        expect(await myContract.getMyNumber()).to.equal(7);
    });
});
```

这段测试代码初看可能有些复杂，但其步骤可以简单分为：
1. 部署合约。
2. 调用 `setMyNumber` 函数更新状态。
3. 验证合约的状态是否如我们所预期。

## 执行测试

一切准备就绪后，你可以通过运行以下命令来执行测试：

```shell
npx hardhat test
```

当测试顺利通过时，你会看到一个绿色的复选框以及测试通过的信息，表明你的合约按预期工作。

## 总结

编写测试程序是智能合约开发中的重要一环，尤其是当你的合约逻辑变得复杂时。本教程简单介绍了如何在 zkSync 合约开发环境中编写和执行测试。实践中，你可能会需要编写更多的测试用例以覆盖各种场景，确保合约的健壮性。