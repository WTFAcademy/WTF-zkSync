---
title: 7. Dapp开发教程
tags:
  - ethereum
  - layer 2
  - rollup
  - zk
  - zksync
  - dapp
---

# WTF zkSync 极简入门: 7. Dapp 开发教程

这个系列教程帮助开发者入门 zkSync 开发。
推特：[@0xAA_Science](https://twitter.com/0xAA_Science)｜[@WTFAcademy_](https://twitter.com/WTFAcademy_)

社区：[Discord](https://discord.gg/5akcruXrsk)｜[微信群](https://docs.google.com/forms/d/e/1FAIpQLSe4KGT8Sh6sJ7hedQRuIYirOoZK_85miz3dw7vA1-YjodgJ-A/viewform?usp=sf_link)｜[官网 wtf.academy](https://wtf.academy)

所有代码和教程开源在 github: [github.com/WTFAcademy/WTF-zkSync](https://github.com/WTFAcademy/WTF-zkSync)

---

在本教程中，我们将会完成：

1. 与已创建的 NFT，TOKEN，TOKENPaymaster 合约进行交互
2. 了解与使用 zkSync 基于 React 技术栈下的开发工具
3. 构建一个集成 Paymaster 支付的 NFT 铸造页面，以允许用户使用 ERC20 代币支付交易费用

![Untitled](img/Untitled.png)

### 先决条件：

1. 获取 zkSync Sepolia 测试网 ETH：[https://learnweb3.io/faucets/zksync_sepolia/](https://learnweb3.io/faucets/zksync_sepolia/)，[https://docs.zksync.io/build/tooling/network-faucets.html](https://docs.zksync.io/build/tooling/network-faucets.html)
2. 了解 Paymaster（可查看前面的教程）

### 相关工具：

1. **nodejs**: 版本v18
2. **nextjs**: 项目使用 React 和 Nextjs 作为前端框架
3. **ethers5**: zkSync 与主网相同，都可采用 ethers 作为主要合约交互工具库使用
4. **zksync-ethers5**: 此库在 ethers 基础上封装/附加功能，本教程将会采用其完成我们的 paymaster 集成到铸造 NFT 中。(注：若不使用 zkSync 独特的功能如抽象账户，Paymaster 等与 ethers 无异,直接使用 ethers 即可，不影响以往主网开发使用工具的流程)
5. **web3modal**: 快捷美观的钱包工具库，提供连接钱包的集成 UI 和相应的逻辑

### 配置项目：

1. 下载基础项目和安装依赖, 代码地址：[模版代码](../Dapp_template/)，[完整代码](../Dapp_complete/)

   ```jsx
   git clone https://github.com/WTFAcademy/WTF-zkSync.git
   cd WTF-zkSync/Dapp_template
   pnpm install // 或 yarn install 或 npm install
   ```

2. 目录结构：

   常见的 nextjs 目录结构，我们主要入口是`(main)/page.tsx` 然后划分两个 step：连接钱包，铸造 NFT，同时将所有合约相关逻辑抽到 hook 中完成。

   ```jsx
   zksync-nft-demo
   ├── app
   │   ├── (main)
   │   │   ├── page.tsx
   │   │   ├── step-connect-wallet.tsx
   │   │   └── step-mint.tsx
   │   ├── globals.css
   │   ├── layout.tsx
   │   └── providers.tsx
   ├── components
   │   ├── checkout.tsx
   │   ├── connect-button.tsx
   │   ├── icons.tsx
   │   ├── mint-nft-modal.tsx
   │   ├── mint-token-modal.tsx
   │   └── ui
   ├── constants
   │   └── contract.ts
   ├── context
   │   └── web3-modal.tsx
   ├── hooks
   │   ├── use-nft.ts
   │   ├── use-paymaster.ts
   │   └── use-token.ts
   ├── lib
   │   └── utils.ts
   ```

### 合约简单介绍：

合约都已开源，可以在[https://sepolia.explorer.zksync.io/](https://sepolia.explorer.zksync.io/)找到

1. [NFT 合约](https://sepolia.explorer.zksync.io/address/0xf599B385E4F1DA0E64b86cf91D51E369bd62b795#contract): 对外暴露 mint 接口给用户执行，无限制

   ```jsx
    function mint(address recipient, string memory stoneName) public {
       require(bytes(stoneName).length > 0, "stoneName must not be empty");
       require(recipient != address(0), "recipient must not be the zero address");

       _safeMint(recipient, tokenId);
       _ownedTokens[recipient].push(tokenId);
       _setTokenURI(tokenId, stoneName);
       tokenId++;
     }
   ```

2. [Token 合约](https://sepolia.explorer.zksync.io/address/0x9Aa5e0Bc9e214050dCaB9510886Ba425c8F2d23e#contract): 普通 ERC20，对外暴露 mint，无限制

   ```solidity
   function mint(address _to, uint256 _amount) public returns (bool) {
      _mint(_to, _amount);
      return true;
   }
   ```

3. [Paymaster 合约](https://sepolia.explorer.zksync.io/address/0x97CB051f8fF92e7936014a29623f8CD5aFA2A825#contract): ERC20 交易支付方案，允许前者 token 的持有者支付 token 作为 gas 手续费支付

### 前端开发

1. 启动项目后，我们会看到一个连接钱包和一个初步完成的铸造界面

   ![Untitled](img/Untitled%201.png)

   ![Untitled](img/Untitled%202.png)

2. **连接钱包**

   每个 Dapp 应用最开始肯定就是连接钱包了，我们这边将采用 web3modal + ethers5 来完成这个步骤：

   - 首先进入`context/web3-modal.tsx` 完成 web3modal 的初步构建，可以参考[链接](https://docs.walletconnect.com/web3modal/nextjs/about?platform=ethers)，注意需要前往[Wallet Connect](https://cloud.walletconnect.com) 注册一个 projectid

     ```jsx
     // Dapp_template/context/web3-modal.tsx
     "use client";
     import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

     // 1. Get projectId at https://cloud.walletconnect.com
     const projectId = ""; // 自行申请一个

     // 2. Set chains
     export const zkSyncSepoliaTestnet = {
       chainId: 300,
       name: "zkSync Sepolia Testnet",
       currency: "ETH",
       explorerUrl: "https://sepolia.explorerzksync.io/",
       rpcUrl: "https://sepolia.era.zksync.dev",
     };

     // 3. Create modal
     const metadata = {
       name: "Web3Modal",
       description: "Web3Modal ZkSync Example",
       url: "https://web3modal.com", // origin must match your domain & subdomain
       icons: ["https://avatars.githubusercontent.com/u/37784886"],
     };

     export const { getWalletProvider } = createWeb3Modal({
       ethersConfig: defaultConfig({ metadata }),
       chains: [zkSyncSepoliaTestnet],
       projectId,
       enableAnalytics: true, // Optional - defaults to your Cloud configuration
     });

     export function Web3ModalProvider({
       children,
     }: {
       children: React.ReactNode,
     }) {
       return children;
     }
     ```

   - 将其引用到在最上层使用，进入`app/providers.tsx`

     ```jsx
     // Dapp_template/app/providers.tsx

     "use client";
     import { Web3ModalProvider } from "@/context/web3-modal";
     import React, { ReactNode } from "react";
     import { QueryClient, QueryClientProvider } from "react-query";

     const queryClient = new QueryClient();

     export default function Providers({ children }: { children: ReactNode }) {
       return (
         <QueryClientProvider client={queryClient}>
           <Web3ModalProvider>{children}</Web3ModalProvider>
         </QueryClientProvider>
       );
     }
     ```

   - 在`app/(main)/step-connect-wallet.tsx`中我们自己定义一下连接按钮样式，使用`useWeb3Modal`的`open`打开连接钱包弹窗进行钱包连接，切换网络等操作，同时使用 `useWeb3ModalAccount` 给出的状态`address`, `isConnected`在 UI 层做出一些交互优化展示

     ```tsx
      // Dapp_template/app/(main)/step-connect-wallet.tsx
      import { Icons } from "@/components/icons";
      import { truncate } from "@/lib/utils";
      import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers5/react";
      import { useEffect } from "react";

      const StepConnectWallet = ({ next }: { next: () => void }) => {
        const { open } = useWeb3Modal();
        const { address, isConnected } = useWeb3ModalAccount();

        const handleClick = () => {
          open().catch(console.error);
        };

        useEffect(() => {
          if (isConnected) {
            next();
          }
        }, [isConnected]);

        return (
          <div className="px-10 py-8 bg-[#ffffff] rounded-lg shadow flex items-center justify-center">
            <button
              className="rounded-lg border-px border-border"
              onClick={handleClick}
            >
              <div className="flex items-center gap-3 justify-center">
                <Icons.wallet className="w-4 h-4" />
                <span>
                  {isConnected ? (
                    <span className="flex items-center gap-2">
                      <span>已连接</span>
                      <span className="text-[#000000] text-sm">
                        {truncate(address!)}
                      </span>
                    </span>
                  ) : (
                    "连接钱包"
                  )}
                </span>
              </div>
            </button>
          </div>
        );
      };

      export default StepConnectWallet;
     ```

3. 此时已经完成了我们钱包的逻辑处理，接下来我们要深入合约交互逻辑处理，我们要做的就是基于合约完成 3 个 hooks：useToken, usePaymaster, useNFT

   - **usePaymaster** (`hooks/use-paymaster.ts`)

     - 我们将会在此 hook 中完成 paymaster 的部分参数组装，以便快速运用到其他的合约调用中，并且获取 paymaster 余额，来告知用户是否仍然可以继续使用 token 替代 gas 支付， 以下关键代码中我们采用 type 为`ApprovalBased` 来完成 Token 的逻辑处理，并且设定`minimalAllowance`为指定值，此处表示支付的 Token 数量用于替换手续费支出，这里实际上会更具具体的需求还给出动态的值，我们为了简单处理每笔交易都只需要支出 1 个 token 即可：
       ```jsx
       const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
         type: "ApprovalBased",
         token: TOKEN_ADDRESS,
         // set minimalAllowance as we defined in the paymaster contract
         minimalAllowance: ethers.utils.parseEther("1"),
         // empty bytes as testnet paymaster does not use innerInput
         innerInput: new Uint8Array(),
       });
       ```
     - 完整代码：

       ```jsx
        // Dapp_template/hooks/use-paymaster.ts
        import { PAYMASTER_ADDRESS, TOKEN_ADDRESS } from "@/constants/contract"
        import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers5/react"
        import { Web3Provider, utils } from "zksync-ethers";
        import { ethers } from "ethers"
        import { useQuery } from "react-query"

        const usePaymaster = () => {
            const { isConnected } = useWeb3ModalAccount()
            const { walletProvider } = useWeb3ModalProvider()

            const {isLoading, data: paymasterBalance} = useQuery("paymaster", async () => {
                const ethersProvider = new Web3Provider(walletProvider!)
                const balance = await ethersProvider.getBalance(PAYMASTER_ADDRESS);
                return ethers.utils.formatEther(balance);
            }, {
                enabled: isConnected,
                refetchInterval: 3000
            })

            const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
                type: "ApprovalBased",
                token: TOKEN_ADDRESS,
                // set minimalAllowance as we defined in the paymaster contract
                minimalAllowance: ethers.utils.parseEther("1"),
                // empty bytes as testnet paymaster does not use innerInput
                innerInput: new Uint8Array(),
            });

            return {
                paymasterBalance,
                isLoading,
                customData: {
                    gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                    paymasterParams,
                }
            }
        }

        export default usePaymaster;
       ```

   - **useToken** (`hooks/use-token.ts`)

     - 该合约我们首先需要完成获取 token 余额，mint 用于支付替代手续费，参考代码内容：

       ```jsx
        // Dapp_template/hooks/use-token.ts

       const useToken = () => {
           const { isConnected, address } = useWeb3ModalAccount()
           const { walletProvider } = useWeb3ModalProvider()

           const { customData } = usePaymaster();

           const contract = useMemo(() => {
               if (!isConnected) return null;
               const ethersProvider = new Web3Provider(walletProvider!)
               const signer = ethersProvider.getSigner();
               return new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
           }, [isConnected, address])

           const { data: tokenBalance, refetch: refetchToken } = useQuery(
               ["token", address],
               async () => {
                   const erc20Contract = contract!;
                   const balance = await erc20Contract.balanceOf(address);
                   return ethers.utils.formatEther(balance).toString();
               },
               {
                   enabled: isConnected,
                   refetchInterval: 0
               }
           )

           const { data: mintTx, isLoading: isMintLoading, mutateAsync: mint } = useMutation(
               ["mint", address],
               async () => {
                   const erc20Contract = contract!;
                   const tx = await erc20Contract.mint(address, ethers.utils.parseEther("1000"), {
                       customData: ethers.utils.parseEther(tokenBalance!) > ethers.utils.parseEther("1") ? customData : undefined
                   });
                   await tx.wait();
                   return tx;
               },
               {
                   onSuccess: () => {
                       refetchToken();
                       toast.success("mint 1000 token success");
                   },
                   onError: (error: any) => {
                       console.log(error);
                       toast.error(error.data.message);
                   }
               }
           )

           return {
               tokenBalance,
               refetchToken,
               mint,
               mintTx,
               isMintLoading,
           }
       }
       ```

     - 在 Paymaster 调用的过程中，是需要用户 token 授权 Paymaster 合约才可调用，我们需要在前面的代码(`use-token`)中完善增加授权逻辑

       ```jsx
       // Dapp_template/hooks/use-token.ts
       // ...其他省略

       const {data: allowance, refetch: refetchAllowance} = useQuery(["tokenAllowance", address], async () => {
           const erc20Contract = contract!;
           const allowance = await erc20Contract.allowance(address, customData.paymasterParams.paymaster);
           return allowance;
       }, {
           enabled: isConnected,
           refetchInterval: 0
       })

       const {
           data: approvePaymasterTx,
           isLoading: isApprovePaymasterLoading,
           mutateAsync: approvePaymaster
       } = useMutation("approve", async () => {
           const erc20Contract = contract!;
           const tx = await erc20Contract.approve(
               PAYMASTER_ADDRESS,
               ethers.constants.MaxUint256
           );
           await tx.wait();
           return tx;
       }, {
           onSuccess: () => {
               toast.success("approve paymaster success");
               refetchAllowance();
           }
       })

       return {
       	// ...省略其他
       	isAllowancePaymaster: allowance?.gte(ethers.utils.parseEther("1")),
         approvePaymaster,
         isApprovePaymasterLoading,
         approvePaymasterTx,
       }
       ```

     - 我们期望页面能够展示 Token Mint 环节产生的 Gas 消耗情况，以及利用余额判断是否满足 paymaster 调用（paymaster 限制了最少需要 1 个 token），我们继续基于前面代码(`use-token`)增加以下两个内容：

       ```jsx
        // Dapp_template/hooks/use-token.ts

        const getTokenMintEstimate = async () => {
            const ethersProvider = new Web3Provider(walletProvider!)
            const erc20Contract = contract!;
            const gasEstimate = await erc20Contract.estimateGas.mint(address, ethers.utils.parseEther("1000"));
            const gasPrice = await ethersProvider.getGasPrice();
            const cost = gasPrice.mul(gasEstimate);

            return {
                gas: ethers.utils.formatEther(gasEstimate).toString(),
                gasPrice: ethers.utils.formatEther(gasPrice).toString(),
                cost: ethers.utils.formatEther(cost).toString()
            }
        }

        return {
          //...
          getTokenMintEstimate,
          canNonGas: tokenBalance ? ethers.utils.parseEther(tokenBalance!) > ethers.utils.parseEther("1") : false
        }
       ```

     - 完整代码 参考[Dapp_complete/hooks/use-token.ts](../Dapp_complete/hooks/use-token.ts)

   - **useNFT** (`hooks/use-nft.ts`)

     - NFT 合约中我们需要完成 NFT 持有数量查询，mint NFT 逻辑，同时 mint 时，我们集成了 paymaster 的支付手段，首先我们需要关注的是我们采用的是 zksync-ethers 的`Contract`和`Web3Provider` 这是官方扩展的类，里面涉及了抽象账户，Paymaster 逻辑等 zksync 独特的功能，我们这边需要用到 paymaster，故我们不能直接采用 ethers 里面构建合约；其次我们在调用合约的时候传入`customData`即可，这里我们在前面`usePaymaster`中已经提及，这是调用 paymaster 的关键：

       ```jsx
       // 伪代码，不可运行，非use-nft.ts中的代码

       import { Contract, Web3Provider } from "zksync-ethers";
       import { ethers } from "ethers";

       const contract = useMemo(() => {
            if (!isConnected) return null;
            const ethersProvider = new Web3Provider(walletProvider!)
            const signer = ethersProvider.getSigner();
            return new Contract(NFT_ADDRESS, NFT_ABI, signer);
       }, [isConnected, address])

       async () => {
         if (!contract) return null;
         const tx = await contract.mint(address, "Space Stone", {
             customData: canNonGas ? customData : undefined
         });
         await tx.wait();
         return tx;
       }
       ```

     - 创建`hooks/use-nft.ts`，根据关键代码写入内容如下：

       ```jsx
        // Dapp_template/hooks/use-nft.ts

       const useNft = () => {
           const { isConnected, address } = useWeb3ModalAccount()
           const { walletProvider } = useWeb3ModalProvider()

           const { canNonGas } = useToken();
           const { customData } = usePaymaster();

           const contract = useMemo(() => {
               if (!isConnected) return null;

               const ethersProvider = new Web3Provider(walletProvider!)
               const signer = ethersProvider.getSigner();
               return new Contract(NFT_ADDRESS, NFT_ABI, signer);
           }, [isConnected, address])

           const { data: nftBalance, refetch } = useQuery(["nftBalance", address], async () => {
               if (!contract) return null;
               const balance = await contract.balanceOf(address);
               return balance.toString();
           }, {
               enabled: isConnected,
               refetchInterval: 0
           })

           const {
               data: mintTx,
               isLoading: isMintLoading,
               mutateAsync: mint
           } = useMutation(["mintNft", address], async () => {
               if (!contract) return null;
               const tx = await contract.mint(address, "Space Stone", {
                   customData: canNonGas ? customData : undefined
               });
               await tx.wait();
               return tx;
           }, {
               onSuccess: () => {
                   toast.success("NFT minted successfully");
                   refetch();
               },
               onError: (err: any) => {
                   toast.error(err.message);
               }
           })

           return {
               nftBalance,
               mintTx,
               isMintLoading,
               mint,
           }
       }
       ```

     - 当然我们也要与 token 类似，为了辅助我们页面展示 mint NFT 消耗 Gas 的情况，我们也加入了 getNFTMintEstimate 计算，在前者代码(`use-nft`)中增加函数

       ```jsx
        // Dapp_template/hooks/use-nft.ts
        
        // ...其他省略

        const getNFTMintEstimate = async () => {
            const ethersProvider = new Web3Provider(walletProvider!)
            const nftContract = contract!;
            const gasEstimate = await nftContract.estimateGas.mint(address, "Space Stone");
            const gasPrice = await ethersProvider.getGasPrice();
            const cost = gasPrice.mul(gasEstimate);

            return {
                gas: ethers.utils.formatEther(gasEstimate).toString(),
                gasPrice: ethers.utils.formatEther(gasPrice).toString(),
                cost: ethers.utils.formatEther(cost).toString()
            }
        }

        return {
            // ...其他省略
            getNFTMintEstimate
        }
       ```

     - 完整代码 参考[Dapp_complete/hooks/use-nft.ts](../Dapp_complete/hooks/use-nft.ts)

4. 前面我们已经完了所有合约交互相关的核心逻辑，接下来我们要把他们运用到页面中，让我们的页面更加完善，我们需完成一下内容，样式部分我已经在模版中完成，只需要使用 hooks 填充数据即可：

   - 打开`app/(main)/step-mint.tsx` 完成初始数据加载

     ```jsx
      // Dapp_template/app/(main)/step-mint.tsx
      const StepMint = () => {
          const { paymasterBalance } = usePaymaster();
          const { tokenBalance } = useToken();

          return (
              <div className="px-10 py-8 bg-[#1E1E1E] rounded-lg shadow text-[#ffffff] flex flex-col gap-4">
                  <div className="text-[#29BC38] font-bold text-xl">
                      WTF zkSync NFT Mint
                  </div>
                  <div className="space-y-3">
                      <div className="space-x-1">
                          <span className="text-gray-400">Paymaster 余额：</span>
                          <span>{paymasterBalance} ETH</span>
                      </div>
                      <div className="space-x-1">
                          <span className="text-gray-400">Paymaster 指定Token余额: </span>
                          <span>{tokenBalance}</span>
                          <MintTokenModal />
                      </div>
                      <div className="space-x-1">
                          <span className="text-gray-400">NFT铸造：</span>
                          <MintNFTModal />
                      </div>
                  </div>
              </div>
          );
      };
     ```

   - 完成`components/mint-token-modal`逻辑，以铸造满足 Paymaster 使用的 token 金额

     ```jsx
     // Dapp_template/components/mint-token-modal.tsx

     // 1. 使用 useToken hook 获取 tokenBalance,mint等执行函数和状态
     // 2. 计算fee, GasPrice, 实际支出
     // 3. 使用Checkout组件展示支付信息
     // 4. 新增执行和授权按钮

     const MintTokenModal = () => {
       const [openModal, setOpenModal] = useState<boolean>(false);
       const {
         tokenBalance,
         getTokenMintEstimate,
         mint,
         isMintLoading,
         canNonGas,
         isAllowancePaymaster,
         approvePaymaster,
         isApprovePaymasterLoading,
       } = useToken();

       const {
         data: tokenMintEstimate,
         isLoading: isTokenMintEstimateLoading,
       } = useQuery("tokenMintEstimate", getTokenMintEstimate, {
         enabled: openModal,
       });

       return (
         <Dialog open={openModal} onOpenChange={setOpenModal}>
           <DialogTrigger>
             <a className="text-blue-600">Mint</a>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>
                 领取支付代币 {canNonGas && "(无GAS版)"}
               </DialogTitle>
               <DialogDescription>用于支付手续费的代币</DialogDescription>
             </DialogHeader>
             <div className="flex flex-col gap-4 mb-4">
               <div className="text-sm">代币合约地址：{TOKEN_ADDRESS}</div>
               <div className="text-sm">
                 当前账户代币余额：{tokenBalance || 0} WTF
               </div>
               <Checkout
                 gas={tokenMintEstimate?.gas}
                 gasPrice={tokenMintEstimate?.gasPrice}
                 cost={tokenMintEstimate?.cost}
                 nonGas={canNonGas}
                 transaction="Mint (amount = 1000 WTF)"
               />
             </div>
             <DialogFooter>
               {isAllowancePaymaster ? (
                 <Button
                   size="sm"
                   className="w-full"
                   disabled={isMintLoading}
                   onClick={() => mint()}
                 >
                   开始执行
                 </Button>
               ) : (
                 <Button
                   size="sm"
                   className="w-full"
                   disabled={isApprovePaymasterLoading}
                   onClick={() => approvePaymaster()}
                 >
                   授权代币作为手续费支付
                 </Button>
               )}
             </DialogFooter>
           </DialogContent>
         </Dialog>
       );
     };
     ```

   - 在 `components/mint-nft-modal` 中使用 useNFT 完成逻辑交互

     ```jsx
      // Dapp_template/components/mint-nft-modal.tsx

      // 1. 使用 useNft hook 获取 nftBalance,mint等执行函数和状态
      // 2. 计算fee, GasPrice, 实际支出
      // 3. 使用Checkout组件展示支付信息
      // 4. 新增执行按钮

      const MintNFTModal = () => {
          const [openModal, setOpenModal] = useState<boolean>(false);
          const { nftBalance, getNFTMintEstimate, mint, isMintLoading } = useNft();

          const { canNonGas } = useToken();

          const { data: nftMintEstimate, isLoading: isTokenMintEstimateLoading } =
              useQuery("nftMintEstimate", getNFTMintEstimate, {
                  enabled: openModal,
              });

          return (
              <Dialog open={openModal} onOpenChange={setOpenModal}>
                  <DialogTrigger>
                      <a className="text-blue-600 cursor-pointer">Mint</a>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>铸造NFT {canNonGas && "(无GAS版)"}</DialogTitle>
                          <DialogDescription>可使用WTF测试币作为手续费</DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-4 mb-4">
                          <div className="text-sm">NFT合约地址：{NFT_ADDRESS}</div>
                          <div className="text-sm">当前账户持有NFT：{nftBalance || 0}</div>
                          <Checkout
                              gas={nftMintEstimate?.gas}
                              gasPrice={nftMintEstimate?.gasPrice}
                              cost={nftMintEstimate?.cost}
                              nonGas={canNonGas}
                              transaction="Mint (amount = 1)"
                          />
                      </div>
                      <DialogFooter>
                          <Button
                              size="sm"
                              className="w-full"
                              disabled={isMintLoading}
                              onClick={() => mint()}
                          >
                              开始执行
                          </Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
          );
      };
     ```

5. 此时我们已完成了前端开发，我们可以去页面中开始尝试 paymaster 的神奇吧！体验无 Gas 铸造 NFT 的过程。
   1. 使用`pnpm dev | yarn dev | npm run dev`导航到  `http://localhost:3000`  并刷新页面。单击“连接钱包”链接您的 MetaMask 帐户。确保你持有 zksync Sepolia 测试网 ETH
   2. 查看 paymaster 余额，如果不够可以捐赠一些以满足正常是的运转
   3. 铸造 Token 用于 NFT 铸造的支付
   4. 开始 NFT 铸造，可以看到右侧一个签名，完成后即可满足最终的交易执行成功
