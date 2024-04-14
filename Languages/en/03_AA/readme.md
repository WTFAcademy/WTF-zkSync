---
title: 3. Account Abstraction (AA)
tags:
   - zksync
   - AA
---

# WTF zkSync minimalist introduction: 3. Account abstraction (AA)

In this lecture, we will delve into the account abstraction (AA) feature implemented in zkSync.

## 1. Account abstraction

Account Abstraction (AA) is a design idea that separates the operations and characteristics of user accounts from the specific implementation of the underlying blockchain platform. In this way, users and developers can interact with the blockchain in a simpler and more intuitive way, while enjoying customized services and more user-friendly operations.

### 1.1 Account classification

In the traditional Ethereum network, there are two main types of accounts:

- **Externally Owned Account (EOA)**: Controlled by a private key, transactions can be initiated directly.
- **Contract Account**: controlled by smart contract code deployed on the blockchain, capable of performing more complex operations.

Although both types of accounts can hold and transfer assets, their features and limitations vary. Here's how they compare.

**EOA**:

- Free to create.
- Ability to initiate transactions directly.
- Mainly performs ETH and token transfers.
- Controlled by a pair of keys.

**Contract Account**:

- Deployment consumes gas.
- Transactions can only be initiated when a transaction is received.
- Can execute diverse logic, such as multi-signature wallet, social recovery, gas payment, etc.
- No private keys, completely controlled by code logic.

### 1.2 Advantages of account abstraction

Account abstraction unifies the characteristics of EOA and contract accounts, allowing accounts to both initiate transactions independently and carry complex logic. This greatly expands the application scope of blockchain accounts, making applications such as smart contract wallets possible, while simplifying the user's operation process and providing a safer guarantee for the user's financial security.

## 2. Account abstraction in zkSync

### 2.1 The difference between zkSync and EIP4337

The account abstraction protocol on zkSync is very similar to EIP4337, and zkSync hopes to have higher efficiency and user experience in its chain. zkSync implements native account abstraction and does different processing in key parts:

- **Implementation level**: zkSync Era's account abstraction is integrated at the protocol level, while EIP4337 avoids implementation at the protocol level.
- **Account type and Paymasters support**: Smart contract accounts and payers in zkSync Era are first-class citizens, providing a unified account model to achieve account abstraction, and all accounts (including EOA) support **Paymasters. **
- **Transaction Processing**:
   - In the workflow of EIP4337, the user initiates a transaction, submits the transaction to the dedicated memory pool (UserOperation mempool) and converts it into a basic transaction by the bundlers (Bundlers), which is then handed over to EntryPoint for contract verification and the Paymaster contract for user operations Pay the transaction fee and finally complete the transaction operation.
   - In contrast, on zkSync Era, there is a unified memory pool (mempool) for transactions from externally owned accounts (EOA) and smart contract accounts. In the zkSync Era, the Operator takes on the role of bundling transactions regardless of account type and sends them to the Bootloader (similar to the EntryPoint contract), resulting in a single mempool and transaction stream.

### 2.2 Smart contract account interface

Each smart contract account follows the official recommendations and implements the [IAccount](https://github.com/matter-labs/era-contracts/blob/main/system-contracts/contracts/interfaces/IAccount.sol) interface, including the following 5 key methods:

- `validateTransaction` (required): Confirm whether the transaction logic meets the account rules. If there is an error, it should be rolled back. If it is successful, continue to execute the transaction process.
- `executeTransaction` (required): called after collecting the handling fee to execute the transaction content
- `payForTransaction` (optional): If you do not use Paymaster, the normal fee deduction scheme will be used directly (tx.gasprice \* tx.gasLimit)
- `prepareForPaymaster` (optional): Set the payment scheme, such as: ERC-20 token instead of Gas payment (refer to [Official Case](https://docs.zksync.io/build/tutorials/smart-contract-development /paymasters/custom-paymaster-tutorial.html))
- `executeTransactionFromOutside` (optional): This function handles whether to initiate a transaction from outside. It is not mandatory, but it is officially encouraged to do so, because in the case of priority mode (for example, if the Operator does not respond), you can consider starting from EOA The account starts trading.

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

   ### 2.3 Paymaster: payment relay in zkSync

Within zkSync's account abstraction framework, `Paymaster` plays a central role, allowing transaction initiators to pay transaction fees through a third party, or pay fees using non-native tokens such as ERC-20 tokens.

#### 2.3.1. Working principle:

- When users initiate a transaction, they can specify a `Paymaster` contract to be responsible for paying transaction fees.
- After receiving a payment request, the `Paymaster` contract will verify the validity of the request based on internal logic and decide whether to pay the transaction fee.
- If the `Paymaster` agrees to pay, it pays the network the required fees to allow the user transaction to be executed.

#### 2.3.2. Implementation method:

`IPaymaster` is the interface contract of Paymaster and mainly contains 2 functions.

1. `validateAndPayForPaymasterTransaction` (required): Called by the bootstrap to verify whether the payer agrees to pay for the transaction. If the payer is willing to pay for the transaction, it must send at least `tx.gasprice * tx.gasLimit` to the Operator. If the verification is successful, the magic value `PAYMASTER_VALIDATION_SUCCESS_MAGIC` and the transaction context `context` (a byte array of up to 1024 bytes in length, will be passed to the `postTransaction` method) are returned.
2. `postTransaction` (optional): called after the transaction is executed. Note that unlike EIP4337, the zkSync abstract account does not guarantee that this method will be called: if the transaction fails with an out of gas error, this method will not be called. Its parameters are: context `_context`, transaction object `_transaction`, transaction hash `_txHash`, transaction hash `_suggestedSignedHash` signed by EOAs, transaction execution result `_txResult`, and the payer may receive The maximum value of Gas refund `_maxRefundedGas`.

     ```solidity
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

         function validateAndPayForPaymasterTransaction (
             bytes32,
             bytes32,
             Transaction calldata _transaction
         ) external payable onlyBootloader returns (bytes4 magic, bytes memory context) {
             // Customize processing GAS payment logic
         }

         function postTransaction (
             bytes calldata _context,
             Transaction calldata _transaction,
             bytes32,
             bytes32,
             ExecutionResult_txResult,
             uint256 _maxRefundedGas
         ) external payable onlyBootloader override {
         }

         receive() external payable {}
     }
     ```

#### 2.3.3. Application scenarios (not limited to this):

- **Free transactions for users**: For applications that want to attract user participation, you can pay user transaction fees through `Paymaster` to lower the threshold for user participation.
- **Token Pay Transaction Fees**: Users can pay transaction fees using specific tokens, and the `Paymaster` is responsible for converting these tokens into fee forms accepted by the network.
- NFT permission granting: Imagine holding an NFT and having the privilege of executing transactions without handling fees. You can refer to the official imaginative [Demo](https://docs.zksync.io/build/tutorials/dapp-development /gated-nft-paymaster-tutorial.html)
- **Enterprise and Application Sponsorship**: Enterprises or application developers can act as `Paymaster` to pay transaction fees for their user groups to enhance user experience.

## 3. Application of zkSync account abstraction

### 3.1 Simplify transaction process

zkSync's account abstraction simplifies the transaction process, and users can interact with smart contracts more easily without worrying about the underlying complexity.

### 3.2 Customized services

Developers can provide users with customized services, such as automated trading, asset management strategies, etc., improving the flexibility and functionality of applications.

### 3.3 Enhanced security

By supporting multiple signature schemes and payment methods, account abstraction provides users and applications with stronger security and more diverse transaction payment options. This not only makes the transaction process more secure, but also provides more flexible payment solutions based on the specific needs of users.

### 3.4 Explore new application scenarios

Account abstraction opens up new possibilities for blockchain application development, such as:

- **Smart Contract Wallet**: Combines user-friendly operation interface and backend smart contract logic to provide smarter asset management and protection strategies.
- **Decentralized Finance (DeFi) Applications**: Users can perform complex financial operations such as lending, borrowing, and margin trading directly from their accounts without transferring to external contracts.
- **Automated Payments and Subscriptions**: Customize smart contracts to automatically execute regular payments, supporting subscription services and regular fee payments without manual intervention by users.
- **Multi-signature and security control**: Implement more complex access and control logic, such as multi-signature verification, to provide more advanced security measures for enterprise and team management.

## 4. Summary

In this lecture, we introduced the account abstraction feature of zkSync. zkSync provides a native account abstraction, greatly improving the user experience, simplifying the transaction process, and providing a foundation for developers to build user-friendly applications. By exploring various applications of account abstraction and `Paymaster`, zkSync is pushing the boundaries of blockchain technology and opening up a new future in the decentralized world.
