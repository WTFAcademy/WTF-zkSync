#zkSync Dapp Development Tutorial

In this tutorial we will complete:

1. Interact with the created NFT, TOKEN, TOKENPaymaster contract
2. Understand and use zkSync, a development tool based on the React technology stack
3. Build an NFT minting page that integrates Paymaster payments to allow users to pay transaction fees using ERC20 tokens

![Untitled](img/Untitled.png)

### prerequisites:

1. Get the zkSync Sepolia test network ETH: [https://learnweb3.io/faucets/zksync_sepolia/](https://learnweb3.io/faucets/zksync_sepolia/), [https://docs.zksync.io/build /tooling/network-faucets.html](https://docs.zksync.io/build/tooling/network-faucets.html)
2. Understand Paymaster (see the previous tutorial)

### Related tools:

1. **nextjs**: The project uses React and Nextjs as the front-end framework
2. **ethers5**: zkSync is the same as the main network, and can use ethers as the main contract interaction tool library.
3. **zksync-ethers5**: This library encapsulates/additional functions based on ethers. This tutorial will use it to integrate our paymaster into minting NFT. (Note: If you do not use zkSync’s unique features such as abstract accounts, Paymaster, etc., they are no different from ethers. You can just use ethers directly. It will not affect the previous process of mainnet development and use of tools)
4. **web3modal**: A fast and beautiful wallet tool library that provides an integrated UI and corresponding logic to connect to the wallet

### Configuration items:

1. Download basic projects and install dependencies

    ```jsx
    git clone https://github.com/WTFAcademy/WTF-zkSync.git
    cd WTF-zkSync/07_DAPP/template
    pnpm i/yarn/npm install
    ```

2. Directory structure:

    For the common nextjs directory structure, our main entrance is `(main)/page.tsx` and then divide it into two steps: connect the wallet, mint NFT, and extract all contract-related logic into hooks to complete.

    ```jsx
    zksync-nft-demo
    ├── app
    │ ├── (main)
    │ │ ├── page.tsx
    │ │ ├── step-connect-wallet.tsx
    │ │ └── step-mint.tsx
    │ ├── globals.css
    │ ├── layout.tsx
    │ └── providers.tsx
    ├── components
    │ ├── checkout.tsx
    │ ├── connect-button.tsx
    │ ├── icons.tsx
    │ ├── mint-nft-modal.tsx
    │ ├── mint-token-modal.tsx
    │ └── ui
    ├── constants
    │ └── contract.ts
    ├── context
    │ └── web3-modal.tsx
    ├── hooks
    │ ├── use-nft.ts
    │ ├── use-paymaster.ts
    │ └── use-token.ts
    ├──lib
    │ └── utils.ts
    ```

### Brief introduction to the contract:

The contracts are all open source and can be found at [https://sepolia.explorer.zksync.io/](https://sepolia.explorer.zksync.io/)

1. [NFT Contract](https://sepolia.explorer.zksync.io/address/0xf599B385E4F1DA0E64b86cf91D51E369bd62b795#contract): Expose the mint interface to the outside world for user execution, without restrictions

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

2. [Token Contract](https://sepolia.explorer.zksync.io/address/0x9Aa5e0Bc9e214050dCaB9510886Ba425c8F2d23e#contract): Ordinary ERC20, exposed to the outside world mint, no restrictions

    ```solidity
    function mint(address _to, uint256 _amount) public returns (bool) {
       _mint(_to, _amount);
       return true;
    }
    ```

3. [Paymaster Contract](https://sepolia.explorer.zksync.io/address/0x97CB051f8fF92e7936014a29623f8CD5aFA2A825#contract): ERC20 transaction payment scheme, allowing holders of the former token to pay token as gas fee payment

### Front-end development

1. After starting the project, we will see a connected wallet and a preliminary completed casting interface

    ![Untitled](img/Untitled%201.png)

    ![Untitled](img/Untitled%202.png)

2. **Connect Wallet**

    The first step for every Dapp application is to connect to the wallet. We will use web3modal + ethers5 to complete this step:

    - First enter `context/web3-modal.tsx` to complete the preliminary construction of web3modal. You can refer to [link](https://docs.walletconnect.com/web3modal/nextjs/about?platform=ethers). Please note that you need to go to https: //cloud.walletconnect.com registers a projectid

      ```jsx
      "use client";

      import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

      // 1. Get projectId at https://cloud.walletconnect.com
      const projectId = ""; // Apply for one by yourself

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

    - To reference it for use at the top level, enter `app/providers.tsx`

      ```jsx
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

    - At the entrance, we define the connection button style ourselves, and then use `open` of `useWeb3Modal` to open the wallet connection pop-up window for wallet connection, switch network and other operations. At the same time, use the status `address` and `isConnected` given by useWeb3ModalAccount in the UI layer. Make some interactive optimization displays

      ```tsx
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
                      <span>Connected</span>
                      <span className="text-[#000000] text-sm">
                        {truncate(address!)}
                      </span>
                    </span>
                  ) : (
                    "Connect Wallet"
                  )}
                </span>
              </div>
            </button>
          </div>
        );
      };
      ```

3. At this point, the logic processing of our wallet has been completed. Next, we need to delve into the contract interaction logic processing. What we have to do is to complete 3 hooks based on the contract: useToken, usePaymaster, useNFT

4. - **usePaymaster**

      - We will complete the assembly of some parameters of paymaster in this hook so that they can be quickly used in other contract calls, and obtain the balance of paymaster to inform the user whether they can continue to use token instead of gas payment. We use type in the following key code Complete the logical processing of Token for `ApprovalBased`, and set `minimalAllowance` to the specified value. Here it indicates that the number of Tokens paid is used to replace the handling fee expenditure. In fact, there will be more specific requirements and dynamic values ​​​​are given here. , we only need to spend 1 token for each transaction for simple processing:
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
      - Complete code:

        ```jsx
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
        ```

    - **useToken**

      - For this contract, we first need to complete the acquisition of the token balance, mint is used to pay the replacement fee, refer to the code content:

        ```jsx
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
                    RefetchInterval: 0
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
                    returntx;
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
                mintx,
                isMintLoading,
            }
        }
        ```

      - In the process of calling Paymaster, the user token is required to authorize the Paymaster contract before it can be called. We need to improve and add authorization logic.
     ```jsx
        // ...Others are omitted

        const {data: allowance, refetch: refetchAllowance} = useQuery(["tokenAllowance", address], async () => {
            const erc20Contract = contract!;
            const allowance = await erc20Contract.allowance(address, customData.paymasterParams.paymaster);
            return allowance;
        }, {
            enabled: isConnected,
            RefetchInterval: 0
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
            returntx;
        }, {
            onSuccess: () => {
                toast.success("approve paymaster success");
                refetchAllowance();
            }
        })

        return {
        // ...omit others
        isAllowancePaymaster: allowance?.gte(ethers.utils.parseEther("1")),
          approvePaymaster,
          isApprovePaymasterLoading,
          approvePaymasterTx,
        }
        ```

- We hope that the page can display the gas consumption generated by the Token Mint link, and use the balance to determine whether the paymaster call is satisfied (paymaster limits the minimum requirement of 1 token). We add two contents:

        ```jsx
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

    - **useNFT**

      - In the NFT contract, we need to complete the NFT holding quantity query and mint NFT logic. At the same time, when mint, we integrate the payment method of paymaster. The first thing we need to pay attention to is that we use the `Contract` and `Web3Provider` of zksync-ethers. This is an officially extended class, which involves abstract accounts, Paymaster logic and other unique functions of zksync. We need to use paymaster here, so we cannot directly use ethers to build the contract; secondly, we pass in `customData when calling the contract `That’s it, here we have already mentioned it in `usePaymaster`. This is the key to calling paymaster:

        ```jsx
        //Intercept code combination, cannot be run
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
              customData: canNonGas? customData: undefined
          });
          await tx.wait();
          returntx;
        }
     ```

- Improve it into hook:
  ```jsx
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
                RefetchInterval: 0
            })

            const {
                data: mintTx,
                isLoading: isMintLoading,
                mutateAsync: mint
            } = useMutation(["mintNft", address], async () => {
                if (!contract) return null;
                const tx = await contract.mint(address, "Space Stone", {
                    customData: canNonGas? customData: undefined
                });
                await tx.wait();
                returntx;
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
                mintx,
                isMintLoading,
                mint,
            }
        }
        ```

- Of course, we have to be similar to token. In order to help our page display the gas consumption of mint NFT, we also added getNFTMintEstimate calculation and added a function in the hook.

   ```jsx

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
  ```

4. We have completed all the core logic related to contract interaction. Next, we need to apply them to the page to make our page more complete. We need to complete the content. I have already completed the style part in the template. You only need to use Just fill in the data with hooks:

    - Open `app/(main)/step-mint.tsx` to complete the initial data loading

      ```jsx
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
                <span className="text-gray-400">Paymaster balance:</span>
                <span>{paymasterBalance} ETH</span>
              </div>
              <div className="space-x-1">
                <span className="text-gray-400">Paymaster specifies Token balance: </span>
                <span>{tokenBalance}</span>
                <MintTokenModal />
              </div>
              <div className="space-x-1">
                <span className="text-gray-400">NFT casting:</span>
                <MintNFTModal />
              </div>
            </div>
          </div>
        );
      };
      ```
 - Complete the `components/mint-token-modal` logic to mint the token amount required by Paymaster

      ```jsx
      // 1. Use useToken hook to obtain tokenBalance, mint and other execution functions and status
      // 2. Calculate fee, GasPrice, actual expenditure
      // 3. Use the Checkout component to display payment information
      // 4. Add execution and authorization buttons

      const MintTokenModal = () => {
        const [openModal, setOpenModal] = useState < boolean > false;
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
                  Receive payment token {canNonGas && "(GAS-free version)"}
                </DialogTitle>
                <DialogDescription>Token used to pay handling fees</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mb-4">
                <div className="text-sm">Token contract address: {TOKEN_ADDRESS}</div>
                <div className="text-sm">
                  Current account token balance: {tokenBalance || 0} WTF
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
                    Begin execution
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={isApprovePaymasterLoading}
                    onClick={() => approvePaymaster()}
                  >
                    Authorize tokens to be paid as fees
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      };
   ```

- Use useNFT in `components/mint-nft-modal` to complete logical interaction

  ```jsx
      // 1. Use useNft hook to obtain nftBalance, mint and other execution functions and status
      // 2. Calculate fee, GasPrice, actual expenditure
      // 3. Use the Checkout component to display payment information
      // 4. Add execution button

      const MintNFTModal = () => {
        const [openModal, setOpenModal] = useState < boolean > false;
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
                <DialogTitle>Casting NFT {canNonGas && "(No GAS version)"}</DialogTitle>
                <DialogDescription>WTF test coins can be used as handling fees</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mb-4">
                <div className="text-sm">NFT contract address: {NFT_ADDRESS}</div>
                <div className="text-sm">The current account holds NFT: {nftBalance || 0}</div>
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
                  Begin execution
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      };
  ```
5. At this point we have completed the front-end development, we can go to the page and start trying the magic of paymaster! Experience the process of minting NFTs without gas.
    1. Navigate to `http://localhost:3000` and refresh the page. Click "Connect Wallet" to link your MetaMask account. Make sure you hold zksync Sepolia testnet ETH
    2. Check the paymaster balance. If it is not enough, you can donate some to meet the normal operation.
    3. Minting Token is used for payment of NFT minting
    4. Start NFT casting. You can see a signature on the right. Once completed, the final transaction execution is successful.
