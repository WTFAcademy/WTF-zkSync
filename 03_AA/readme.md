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
- 主要进行 ETH 和代币转移。
- 由一对密钥控制。

**合约账户**：

- 部署需消耗 gas。
- 仅在接收到交易时能发起交易。
- 可以执行多样化的逻辑，如多签钱包，社交恢复，代付 gas 费用等。
- 无私钥，完全由代码逻辑控制。

### 1.2 账户抽象化的优势

账户抽象化将 EOA 和合约账户的特性统一，允许账户既能自主发起交易，又能承载复杂的逻辑。这极大地扩展了区块链账户的应用范围，使得例如智能合约钱包等应用成为可能，同时简化了用户的操作流程和为用户的资金安全提供了更安全的保障。

## 2. zkSync 中的账户抽象

### 2.1 zkSync 与 EIP4337 的区别

zkSync 上的帐户抽象协议与 EIP4337 非常相似，而 zkSync 期望在其链中有着更高的效率和用户体验，zkSync 实现了原生的账户抽象，在关键部分做了不一样的处理：

- **实现层面**：zkSync Era 的账户抽象在协议层面进行集成，EIP4337 则避免了在协议层面的实现。
- **账户类型及 Paymasters 支持**：zkSync Era 中智能合约账户和付款人都是一等公民，提供一个统一的账户模型来实现账户抽象化，所有账户（包括 EOA）都支持 **Paymasters。**
- **交易处理**：
    - 在 EIP4337 的工作流程中，用户发起交易，将交易提交至专用内存池 (UserOperation mempool) 中并由打包者 (Bundlers) 转化为基础交易，然后交由 EntryPoint 负责合约验证和 Paymaster 合约负责为用户操作支付交易费用，最终完成交易操作。
    - 相比之下，在 zkSync Era 上，有一个统一的内存池 (mempool)，用于来自外部拥有账户 (EOA) 和智能合约账户的交易。在 zkSync Era，Operator 承担了捆绑交易的角色，无论账户类型如何，并将它们发送到 Bootloader（类似于 EntryPoint 合约），从而产生单个内存池 (mempool) 和交易流。

### 2.2 智能合约账户接口

每个智能合约账户按照官方建议遵从 [IAccount](https://github.com/matter-labs/era-contracts/blob/main/system-contracts/contracts/interfaces/IAccount.sol) 接口实现，包含以下 5 个关键方法：

- `validateTransaction`（必须）：确认交易逻辑是否满足账户规则，如果错误应回滚，若是成功则继续执行交易流程
- `executeTransaction`（必须）：收取手续费后调用，执行交易内容
- `payForTransaction`（可选）：不使用 Paymaster 将会直接采用正常手续费扣除方案(tx.gasprice * tx.gasLimit)
- `prepareForPaymaster`（可选）：设置支付的方案，如：ERC-20 代币替代 Gas 支付(参考 [官方案例](https://docs.zksync.io/build/tutorials/smart-contract-development/paymasters/custom-paymaster-tutorial.html))
- `executeTransactionFromOutside`（可选）：该函数处理是否从外部发起交易，不是强制实现的，但官方鼓励这样做，因为在优先模式的情况下（例如，如果 Operator 没有响应），则可以考虑从 EOA 帐户开始交易。
    
    ```jsx
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
    

### 2.3 Paymaster：zkSync 中的支付中继

在 zkSync 的账户抽象化框架内，`Paymaster` 起着中心角色，使得交易发起者可以通过第三方支付交易费用，或使用非原生代币（如 ERC-20 代币）支付费用。

#### 2.3.1. 工作原理：
    - 用户发起交易时，可以指定一个 `Paymaster` 合约来负责支付交易费用。
    - `Paymaster` 合约在接到支付请求后，会根据内部逻辑验证请求的有效性，并决定是否支付交易费用。
    - 如果 `Paymaster` 同意支付，它会向网络支付所需的费用，使用户交易得以执行。
#### 2.3.2. 实现方式：
    
    `IPaymaster` 是 Paymaster 的接口合约，主要包含 2 个函数。
    
    1. `validateAndPayForPaymasterTransaction`（必须）：由引导程序调用，以验证支付方是否同意支付交易的费用。如果支付人愿意为交易付款，则此它必须至少发送 `tx.gasprice * tx.gasLimit` 给 Operator。若验证成功，则返回 magic 值 `PAYMASTER_VALIDATION_SUCCESS_MAGIC` 和交易上下文 `context`（最多 1024 字节长度的字节数组，将传递给 `postTransaction` 方法）。
    2. `postTransaction`（可选）：在事务执行后调用。请注意，与 EIP4337 不同，zkSync 抽象账户不能保证一定会调用此方法：比如事务因 out of gas 错误而失败，则不会调用此方法。它的参数分别为：的上下文 `_context`、交易对象 `_transaction`、交易哈希 `_txHash`，由 EOAs 签名的交易哈希 `_suggestedSignedHash`，交易执行的结果 `_txResult`，以及付款人可能收到 Gas 退款的最大值 `_maxRefundedGas`。
    
    ```jsx
    contract MyPaymaster is IPaymaster {
        uint256 constant PRICE_FOR_PAYING_FEES = 1;
    
        address public allowedToken;
    
        modifier onlyBootloader() {
            require(msg.sender == BOOTLOADER_FORMAL_ADDRESS, "Only bootloader can call this method");
            // Continue execution if called from the bootloader.
            _;
        }
    
        constructor(address _erc20) {
            allowedToken = _erc20;
        }
    
        function validateAndPayForPaymasterTransaction  (
            bytes32,
            bytes32,
            Transaction calldata _transaction
        ) external payable onlyBootloader returns (bytes4 magic, bytes memory context) {
            // 自定义处理GAS支付逻辑
        }
    
        function postTransaction (
            bytes calldata _context,
            Transaction calldata _transaction,
            bytes32,
            bytes32,
            ExecutionResult _txResult,
            uint256 _maxRefundedGas
        ) external payable onlyBootloader override {
        }
    
        receive() external payable {}
    }
    ```
    
#### 2.3.3. 应用场景（不仅限于此）：
    - **用户免费交易**：对于希望吸引用户参与的应用，可以通过 `Paymaster` 支付用户交易费用，降低用户参与门槛。
    - **代币支付交易费**：用户可以使用特定的代币支付交易费，而 `Paymaster` 负责将这些代币转换成网络接受的费用形式。
    - NFT 权限给予：想象一下持有某个 NFT 时，执行交易没有手续费的特权，可以参考官方具有想象力的 [Demo](https://docs.zksync.io/build/tutorials/dapp-development/gated-nft-paymaster-tutorial.html)
    - **企业和应用赞助**：企业或应用开发者可以作为 `Paymaster`，为其用户群体支付交易费用，提升用户体验。

## 3. zkSync 账户抽象的应用

### 3.1 简化交易流程

zkSync 的账户抽象化简化了交易流程，用户可以更容易地与智能合约交互，无需担心底层的复杂性。

### 3.2 定制化服务

开发者可以为用户提供定制化服务，如自动交易、资产管理策略等，提升了应用的灵活性和功能性。

### 3.3 增强的安全性

通过支持多种签名方案和支付方式，账户抽象化为用户和应用提供了更强的安全性和更多样的交易支付选项。这不仅使得交易过程更加安全，还能够根据用户的特定需求提供更加灵活的支付解决方案。

### 3.4 探索新的应用场景

账户抽象化为区块链应用开发开辟了新的可能性，比如：

- **智能合约钱包**：结合用户友好的操作界面和后台的智能合约逻辑，提供更智能的资产管理和保护策略。
- **去中心化金融（DeFi）应用**：用户可以直接从其账户中执行复杂的金融操作，如借贷、杠杆交易等，无需转移到外部合约。
- **自动化支付和订阅**：定制智能合约以自动执行定期支付，支持订阅服务和定期费用支付，无需用户手动介入。
- **多签名和安全控制**：实现更复杂的访问和控制逻辑，如多签名验证，为企业和团队管理提供更高级的安全措施。

## 4. 总结

这一讲，我们介绍了zkSync的账户抽象特性。zkSync提供了原生账户抽象，极大地提升了用户体验，简化了交易流程，并为开发者打造用户友好的应用提供了基础。通过探索账户抽象和`Paymaster`的各种应用，zkSync正在推动区块链技术的边界，开拓去中心化世界的新未来。
