---
title: 3. 理解抽象账户（AA）
tags:
  - zk
  - zksync
  - AA
---

# WTF zkSync极简入门: 3. 理解抽象账户（AA）

在本章中，我们将理解 zksync 中的账户抽象（Account Abstraction）。

## 1. 什么是账户抽象

在区块链背景下，账户抽象是将账户（地址、余额、状态等）的底层细节与具体的区块链技术解耦，从而提供更高级别的接口和操作方法。这种抽象化可以简化用户与区块链交互的复杂度，提高用户体验，并为开发者提供更灵活的工具来构建应用程序。账户抽象也有助于促进不同区块链技术之间的互操作性和统一性，使得区块链生态更加开放和互联。

### 1.1 账户类型

以太坊有两种帐户类型：

- 外部所有的帐户 (EOA) – 由任何拥有私钥的人控制
- 合约帐户 – 部署到网络上的智能合约，由代码控制

这两种帐户类型都能：

- 接收、持有和发送 ETH 和 token
- 与已部署的智能合约进行交互

主要区别有：

**外部所有的帐户**

- 创建帐户是免费的
- 可以发起交易
- 外部所有的帐户之间只能进行以太币和代币交易
- 由一对加密密钥组成：控制帐户活动的公钥和私钥

**合约账户**

- 创建合约存在成本，因为需要使用网络存储空间
- 只能在收到交易时发送交易
- 从外部帐户向合约帐户发起的交易能触发可执行多种操作的代码，例如转移代币甚至创建新合约
- 合约帐户没有私钥。 相反，它们由智能合约代码逻辑控制

前一种类型是唯一可以发起事务的类型，而后者是唯一可以实现任意逻辑的类型。对于某些使用场景，例如智能合约钱包或隐私协议，这种差异可能会产生很多摩擦。因此，此类应用程序需要 L1 中继器（例如 EOA）来帮助促进智能合约钱包的交易。

zkSync 的账户可以发起交易，如EOA，但也可以在其中实现任意逻辑，如智能合约。此功能称为“帐户抽象”(AA)，旨在解决上述问题。

### 1.2 Account Abstraction 概述

Account Abstraction 的核心概念可以总结为两个关键点：`Signature Abstraction`（签名抽象）和 `Payment Abstraction`（支付抽象）。

`Signature Abstraction` 的目标是使各种账户合约能够使用不同的验证方案。这意味着使用者不受限于只能使用特定曲线的数位签章算法，而可以选择任何他们喜好的验证机制。

而 `Payment Abstraction` 旨在为使用者提供多种交易支付选项。例如，可以使用 ERC-20 代币进行支付，而不是使用原生代币，或者可以由第三方赞助交易，甚至是其他更特别的 payment model。

zkSync 2.0 中的账户可以发起交易，就像 EOA 一样，但也可以在其中利用可编程性实现任意逻辑，如 Contract Account。这就是我们所说的 Account Abstraction，它融合 Ethereum 中两种账户型态的优势，使 AA 账户的使用者体验更加灵活，进而达到上述的两种目标：Signature Abstraction 和 Payment Abstraction。

## 2. AA的机制

ZkSync中账户抽象的机制如下：

1. 账户管理：ZkSync 将以太坊账户抽象化为 ZkSync 账户，包括地址、余额、状态等信息。用户在 ZkSync 链上拥有对应的 ZkSync 账户，通过这些账户进行资产管理和操作。
2. 状态通道：ZkSync 利用状态通道技术实现账户抽象，用户可以在状态通道内进行基于状态的快速交易，而无需每笔交易都上链，提高了交易的效率和成本效益。
3. 零知识证明：账户抽象通过零知识证明技术，验证和保护交易的合法性，确保资产在 ZkSync 链上的转移和操作是安全可靠的，同时保护用户的隐私数据。
4. 互操作性：账户抽象支持以太坊主链与 ZkSync 二层链之间的资产互操作性，用户可以自由转移资产，实现灵活的资产管理和应用开发。

通过这些机制，ZkSync 实现了账户抽象，为用户提供了高效、安全、灵活的资产管理和交易操作，同时促进了不同链之间的互操作性和生态发展。

## 3. 了解 Paymaster

ZkSync 中的 `Paymaster` 是指一个集成了链上支付逻辑的智能合约，它允许应用程序或服务提供商向用户提供免费的交易、支付或其他服务。`Paymaster` 通过为用户支付手续费，简化了用户在 ZkSync上进行交易的过程，提高了用户体验。

`Paymaster` 也可以用于处理 ZkSync 链上的一些特殊操作，比如批量交易、链上支付网关等。通过`Paymaster` 可以为用户提供更加便捷和多样化的支付和交易选项，促进 ZkSync 生态系统的发展和应用场景的拓展。

`Paymaster` 的另一个重要用例是促进以 ERC20 代币支付费用。虽然 ETH 是 ZkSync 中的正式费用代币，但 `Paymaster` 可以提供将 ERC20 代币即时兑换为 ETH 的能力。

ZkSync 的 Paymaster Contract 主要由两个函数构成，分别为： 

- validateAndPayForPaymasterTransaction（required） 
- postTransaction（optional）

两者都只能被 bootloader 调用：

`validateAndPayForPaymasterTransaction` 是整个 Paymaster Contract 中唯一必须实例化的 function，当 `Operator` 收到的交易有附带 paymaster params 时，代表手续费不由 User 的 Account Contract 支付，而是由 Paymaster 支付。此时 Operator 就会调用`validateAndPayForPaymasterTransaction` 来判断这个 `Paymaster` 是否愿意支付这笔交易。如果 Paymaster 愿意，这个函式会 send 至少tx.gasprice * tx.gaslimit 的 ETH 给 bootloader。

`postTransaction` 是一个 optional 的函数，通常用于 refund（将未使用完的 gas 退还给发送者），但当前 zkSync 还不支持此操作。

## 4. Paymaster 如何工作

`Paymaster` 在 ZkSync 中工作的详细过程如下：

1. 用户发起交易请求：用户向 `Paymaster` 智能合约发送交易请求，请求进行特定的支付操作，如转账、支付费用等。
2. `Paymaster` 验证交易：`Paymaster` 将验证用户的交易请求，检查交易的合法性、权限和费用，确保用户的操作满足预设条件。
	- 由 NonceHolder 确认 nonce 是否合法；
	- 调用 Account Contract 上的 validateTransaction 进行验证，确认交易由账户拥有者授权；
	- 调用 Account Contract 上的 prepareForPaymaster，可能会执行例如 approve 一定数量的 ERC-20 Token 给 Paymaster 或不做任何事；
3. 执行支付：如果验证通过，`Paymaster` 会从其预先配置的资金池中扣除足够的资金，以支付用户的交易费用或实际交易金额。
	- 调用 Paymaster Contract 上的 validateAndPayForPaymasterTransaction 方法来确认 Paymaster 愿意支付并且收取手续费，同时 Paymaster 向用户收取一定数量的 ERC-20（前面 approve 的）；
	- 确认 bootloader 收到正确数量（至少 tx.gasprice * tx.gaslimit）的 ETH 手续费；
	- 调用 Account Contract 上的 executeTransaction 执行用户想要的交易；
	- 如果 Paymaster Contract 有 postTransaction 实例且拥有足够 gas 费用（没有 out of gas error），就执行 postTransaction；
4. 完成交易：`Paymaster` 将交易结果返回给用户，完成具体的支付操作。用户可以通过智能合约事件或返回的交易数据来查询交易状态和结果。
	- 即便发生 out of gas error 导致不能执行 postTransaction，这笔 AA 交易也算是成功，只是省略掉呼叫 postTransaction 的动作而已。

通过以上 `Paymaster` 的工作流程可以发现，`Paymaster` 可以帮助用户更加便捷地进行支付操作，而无需担心交易费用或其他细节。这种机制简化了用户对 ZkSync 交易的操作，提高了用户体验，同时也为应用开发者提供了更多的灵活性和创新空间。