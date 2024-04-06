---
title: 3. 账户抽象（AA）
tags:
  - zksync
  - AA
---

# WTF zkSync极简入门: 3. 账户抽象（AA）

这一讲，我们将深入探讨 zkSync 中实现的账户抽象（AA）特性。

## 1. 账户抽象

账户抽象（Account Abstraction，AA）是一种将用户账户的操作和特性从底层区块链平台的具体实现中分离出来的设计思想。通过这种方式，用户和开发者可以以更加简便、直观的方式与区块链互动，同时能够享受到定制化服务和更用户友好的操作。

### 1.1 账户分类

传统的以太坊网络中，主要存在两类账户：

- **外部拥有账户（EOA）**：由私钥控制，可以直接发起交易。
- **合约账户**：由部署在区块链上的智能合约代码控制，能够执行更复杂的操作。

尽管这两类账户都能持有和转移资产，它们的功能和限制各不相同。下面是它们的对比。

**EOA**：

- 免费创建。
- 能够直接发起交易。
- 主要进行ETH和代币转移。
- 由一对密钥控制。

**合约账户**：

- 部署需消耗gas。
- 仅在接收到交易时能发起交易。
- 可以执行多样化的逻辑，如多签钱包。
- 无私钥，完全由代码逻辑控制。

### 1.2 账户抽象化的优势

账户抽象化将EOA和合约账户的特性统一，允许账户既能自主发起交易，又能承载复杂的逻辑。这极大地扩展了区块链账户的应用范围，使得例如智能合约钱包等应用成为可能，同时简化了用户的操作流程。

## 2. zkSync 中的账户抽象化实现

zkSync 通过提供一个统一的账户模型来实现账户抽象化，该模型结合了EOA和合约账户的特点。

- **发送交易**：zkSync上的合约账户可以像EOA一样直接发起交易。
- **可编程性**：同时，它们还拥有合约账户的可编程性，能够在账户内实现复杂逻辑。

这种融合使得zkSync账户不仅具备高效率和灵活性，还能提供更好的用户体验和安全性。

### 2.1 主要特性

- **签名抽象（Signature Abstraction）**：允许使用多种签名方案，为用户提供更广泛的安全选项。
- **支付抽象（Payment Abstraction）**：支持多种支付方式，如使用ERC-20代币支付交易费用，或第三方支付交易费用。

## 3. zkSync 账户抽象化的应用

### 3.1 简化交易流程

zkSync 的账户抽象化简化了交易流程，用户可以更容易地与智能合约交互，无需担心底层的复杂性。

### 3.2 定制化服务

开发者可以为用户提供定制化服务，如自动交易、资产管理策略等，提升了应用的灵活性和功能性。

### 3.3 增强的安全性

通过支持多种签名方案和支付方式，账户抽象化为用户和应用提供了更强的安全性和更多样的交易支付选项。这不仅使得交易过程更加安全，还能够根据用户的特定需求提供更加灵活的支付解决方案。

## 3.4 探索新的应用场景

账户抽象化为区块链应用开发开辟了新的可能性，比如：

- **智能合约钱包**：结合用户友好的操作界面和后台的智能合约逻辑，提供更智能的资产管理和保护策略。
- **去中心化金融（DeFi）应用**：用户可以直接从其账户中执行复杂的金融操作，如借贷、杠杆交易等，无需转移到外部合约。
- **自动化支付和订阅**：定制智能合约以自动执行定期支付，支持订阅服务和定期费用支付，无需用户手动介入。
- **多签名和安全控制**：实现更复杂的访问和控制逻辑，如多签名验证，为企业和团队管理提供更高级的安全措施。

## 4. Paymaster：zkSync 中的支付中继

在 zkSync 的账户抽象化框架内，`Paymaster` 起着中心角色，使得交易发起者可以通过第三方支付交易费用，或使用非原生代币（如ERC-20代币）支付费用。

### 4.1 Paymaster 的工作原理

- 用户发起交易时，可以指定一个`Paymaster`合约来负责支付交易费用。
- `Paymaster`合约在接到支付请求后，会根据内部逻辑验证请求的有效性，并决定是否支付交易费用。
- 如果`Paymaster`同意支付，它会向网络支付所需的费用，使用户交易得以执行。

### 4.2 Paymaster 的应用场景

- **用户免费交易**：对于希望吸引用户参与的应用，可以通过`Paymaster`支付用户交易费用，降低用户参与门槛。
- **代币支付交易费**：用户可以使用特定的代币支付交易费，而`Paymaster`负责将这些代币转换成网络接受的费用形式。
- **企业和应用赞助**：企业或应用开发者可以作为`Paymaster`，为其用户群体支付交易费用，提升用户体验。

## 5. 抽象账户合约

这里我们介绍与zkSync抽象账户相关的两个接口合约： `IAccount` 和 `IPaymaster`。我们会在之后的教程中介绍如何实现它们。

### 5.1 IAccount

`IAccount`是抽象账户的接口合约，主要包含`5`个函数：

1. `validateTransaction`（必须实现）：由引导程序调用，用于验证账户是否同意处理交易（并可能支付费用）。它的参数分别为用于在浏览器中使用的交易哈希 `txHash`，由EOAs签名的交易哈希 `_suggestedSignedHash`，交易对象本身 `_transaction`（包含交易类型，发送者等数据）。若验证成功，则返回一个magic值 `ACCOUNT_VALIDATION_SUCCESS_MAGIC`。

2. `executeTransaction`（必须实现）：向用户收取费用后系统会调用，并执行交易。参数与 `validateTransaction` 函数一致。

3. `payForTransaction`（可选）：如果交易没有其他地址支付gas，系统将调用它，用合约中的ETH支付gas。如果这个账户总是依赖paymaster支付gas，则不需要实现它。

4. `prepareForPaymaster`（可选）：如果交易有其他地址支付付款，系统将调用它。此方法应用于准备与付款人的交互，比如让付款人批准 ERC-20 代币以支付gas。

5. `executeTransactionFromOutside`（可选）：该函数不是强制实现的，但我们强烈鼓励这样做，因为在优先模式的情况下（例如，如果运营商没有响应），则需要从EOA帐户开始交易。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../libraries/TransactionHelper.sol";

bytes4 constant ACCOUNT_VALIDATION_SUCCESS_MAGIC = IAccount.validateTransaction.selector;

interface IAccount {
    function validateTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable returns (bytes4 magic);

    function executeTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable;

    function executeTransactionFromOutside(Transaction calldata _transaction) external payable;

    function payForTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable;

    function prepareForPaymaster(
        bytes32 _txHash,
        bytes32 _possibleSignedHash,
        Transaction calldata _transaction
    ) external payable;
}
```

### 5.2 IPaymaster

与ERC4337的Paymaster一样，zkSync的抽象账户体系支持其他账户帮忙支付gas。`IPaymaster`是Paymaster的接口合约，主要包含`2`个函数。

1. `validateAndPayForPaymasterTransaction`（必须实现）：由引导程序调用，以验证支付方是否同意支付交易的费用。如果支付人愿意为交易付款，则此它必须至少发送`tx.gasprice * tx.gasLimit`给运营商。若验证成功，则返回magic值 `PAYMASTER_VALIDATION_SUCCESS_MAGIC`和交易上下文`context`（最多1024字节长度的字节数组，将传递给`postTransaction`方法）。

2. `postTransaction`（可选）：在事务执行后调用。请注意，与EIP4337不同，zkSync抽象账户不能保证一定会调用此方法：比如事务因out of gas错误而失败，则不会调用此方法。它的参数分别为：的上下文`_context`、交易对象`_transaction`、交易哈希`_txHash`，由EOAs签名的交易哈希 `_suggestedSignedHash`，交易执行的结果`_txResult`，以及付款人可能收到Gas退款的最大值`_maxRefundedGas`。


```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../libraries/TransactionHelper.sol";

enum ExecutionResult {
    Revert,
    Success
}

bytes4 constant PAYMASTER_VALIDATION_SUCCESS_MAGIC = IPaymaster.validateAndPayForPaymasterTransaction.selector;

interface IPaymaster {
    function validateAndPayForPaymasterTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable returns (bytes4 magic, bytes memory context);

    function postTransaction(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        ExecutionResult _txResult,
        uint256 _maxRefundedGas
    ) external payable;
}
```

## 6. 总结

这一讲，我们介绍了zkSync的账户抽象特性。zkSync提供了原生原生账户抽象，极大地提升了用户体验，简化了交易流程，并为开发者打造用户友好的应用提供了基础。通过探索账户抽象和`Paymaster`的各种应用，zkSync正在推动区块链技术的边界，开拓去中心化世界的新未来。