"use client";

import { useEffect, useRef, useState } from "react";
import { parseUnits, zeroAddress } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { getParsedError } from "~~/utils/scaffold-eth";

enum FillStatus {
  "Pending" = 1,
  "Invalid" = 2,
  "Succeeded" = 3,
  "Expired" = 4,
  "FillFailed" = 5,
  "XFillFailed" = 6,
}

interface TradeOption {
  chain: string;
  token: string;
  amount: string;
}

interface NFT {
  tokenId: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  tokenUri: string;
  metadata?: any;
}

const chainMetadata = [
  {
    symbol: "USDC",
    address: "0x046381E3750f367540d046075C4dB392D3F48569",
    decimals: 6,
    name: "Polygon Amoy",
    logo_url: "/path/to/USDC_LOGO.png",
    network_id: 80002,
  },
  {
    symbol: "USDC",
    address: "0x4Cef8bdCbDac0849cAEAD241339a2C91EecAF965",
    decimals: 6,
    name: "Base Sepolia",
    logo_url: "/path/to/USDC_LOGO.png",
    network_id: 84532,
  },
  {
    symbol: "USDC",
    name: "Arbitrum Sepolia",
    address: "0x490da4aA8D854620F9C3f249Dc00f4Be1A64D499",
    decimals: 6,
    logo_url: "/path/to/USDC_LOGO.png",
    network_id: 421614,
  },
];

const tokenMetadata = [
  {
    symbol: "USDC",
    address: "0x046381E3750f367540d046075C4dB392D3F48569",
    decimals: 6,
    name: "Polygon Amoy",
    logo_url: "/path/to/USDC_LOGO.png",
    network_id: 80002,
  },
  {
    symbol: "USDC",
    address: "0x4Cef8bdCbDac0849cAEAD241339a2C91EecAF965",
    decimals: 6,
    name: "Base Sepolia",
    logo_url: "/path/to/USDC_LOGO.png",
    network_id: 84532,
  },
  {
    symbol: "USDC",
    name: "Arbitrum Sepolia",
    address: "0x490da4aA8D854620F9C3f249Dc00f4Be1A64D499",
    decimals: 6,
    logo_url: "/path/to/USDC_LOGO.png",
    network_id: 421614,
  },

  {
    symbol: "WETH",
    address: "0x1Ab43ddF4DD48696C48A34c5359324A24e14cC13",
    decimals: 18,
    name: "Polygon Amoy",
    logo_url: "/path/to/WETH_LOGO.png",
    network_id: 80002,
  },
  {
    symbol: "WETH",
    address: "0x479635DDF8ea6886c5AeD2599146E643F60e8A2B",
    decimals: 18,
    name: "Base Sepolia",
    logo_url: "/path/to/WETH_LOGO.png",
    network_id: 84532,
  },
  {
    symbol: "WETH",
    name: "Arbitrum Sepolia",
    address: "0x27ef087EB034E71AC2D89266299588fa1AeB1893",
    decimals: 18,
    logo_url: "/path/to/WETH_LOGO.png",
    network_id: 421614,
  },

  {
    symbol: "WBTC",
    address: "0x2474396A9f5c2d068794727EE0A5D2e0eC46A613",
    decimals: 8,
    name: "Polygon Amoy",
    logo_url: "/path/to/WBTC_LOGO.png",
    network_id: 80002,
  },
  {
    symbol: "WBTC",
    address: "0xe6923DFa9105b3443C265E865e15078546273551",
    decimals: 8,
    name: "Base Sepolia",
    logo_url: "/path/to/WBTC_LOGO.png",
    network_id: 84532,
  },
  {
    symbol: "WBTC",
    name: "Arbitrum Sepolia",
    address: "0x490da4aA8D854620F9C3f249Dc00f4Be1A64D499",
    decimals: 8,
    logo_url: "/path/to/WBTC_LOGO.png",
    network_id: 421614,
  },

  {
    symbol: "BNB",
    address: "0xB8d92A8b9dF0Ef3a7b14dFAdCC07175820dd841A",
    decimals: 18,
    name: "Polygon Amoy",
    logo_url: "/path/to/BNB_LOGO.png",
    network_id: 80002,
  },
  {
    symbol: "BNB",
    address: "0x37BF9515C97F93774Dc46416D8058Bd8F2B7b6e6",
    decimals: 18,
    name: "Base Sepolia",
    logo_url: "/path/to/BNB_LOGO.png",
    network_id: 84532,
  },
  {
    symbol: "BNB",
    name: "Arbitrum Sepolia",
    address: "0x490da4aA8D854620F9C3f249Dc00f4Be1A64D499",
    decimals: 18,
    logo_url: "/path/to/BNB_LOGO.png",
    network_id: 421614,
  },
];

const useUserNFTs = (address: string | undefined, chainIds: number[] | undefined, limit = 10, offset = 0) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false); // Step 2: Create a ref to track if fetchNFTs has been called

  useEffect(() => {
    const fetchNFTs = async () => {
      if (hasFetched.current) return; // Step 3: Check if fetchNFTs has already been called
      if (!address || !chainIds || chainIds.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      hasFetched.current = true; // Step 4: Mark as fetched

      try {
        const response = await fetch("/api/fetchnfts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, chainIds, limit, offset }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const fetchedNFTs = await response.json();
        console.log({ fetchedNFTs });
        setNfts(fetchedNFTs.assets || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to fetch NFTs");
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address, chainIds, limit, offset]); // Dependencies remain the same

  return { nfts, isLoading, error };
};

const CreateTrade = () => {
  const [offerType, setOfferType] = useState<"Token" | "NFT">("Token");
  const [tradeType, setTradeType] = useState<"full" | "partial">("full");
  const [tradeOptions, setTradeOptions] = useState<TradeOption[]>([{ chain: "", token: "", amount: "" }]);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("USDC");
  const [selectedTokenAmount, setSelectedTokenAmount] = useState<string>("");
  const [selectedNftChains, setSelectedNftChains] = useState<string[]>([]);
  const [isCreateOfferLoading, setIsCreateOfferLoading] = useState(false);
  const { address } = useAccount();

  const selectedTokenMetadata = tokenMetadata.find(token => token.name === selectedChain);
  const chainIds = tokenMetadata.filter(token => selectedNftChains.includes(token.name)).map(token => token.network_id);
  const { nfts, isLoading: nftsLoading, error: nftsError } = useUserNFTs(address, chainIds);

  const {
    data: balance,
    isError,
    isLoading,
  } = useBalance({
    address: address,
    token: selectedTokenMetadata?.address,
    chainId: selectedTokenMetadata?.network_id,
  });

  const { writeContractAsync: createOfferWrite } = useScaffoldWriteContract("alphaBlue");

  const handleAddOption = () => {
    setTradeOptions([...tradeOptions, { chain: "", token: "", amount: "" }]);
  };

  const handleOptionChange = (index: number, field: keyof TradeOption, value: string) => {
    const newTradeOptions = [...tradeOptions];
    newTradeOptions[index][field] = value;
    setTradeOptions(newTradeOptions);
  };

  const handleNftSelect = (nft: NFT) => {
    setSelectedNft(nft);
  };

  const handleChainSelect = (chain: string) => {
    setSelectedChain(chain);
    setSelectedToken("USDC");
  };

  const handleNftChainSelect = (chain: string) => {
    setSelectedNftChains(prevChains => {
      if (prevChains.includes(chain)) {
        return prevChains.filter(c => c !== chain);
      } else {
        return [...prevChains, chain];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const oneWeekFromNow = currentTimestamp + BigInt(7 * 24 * 60 * 60); // 1 week expiration

    let offerData = {
      owner: zeroAddress,
      tokenAddress: offerType === "Token" ? selectedTokenMetadata?.address || zeroAddress : zeroAddress,
      tokenAmount:
        offerType === "Token" ? parseUnits(selectedTokenAmount, selectedTokenMetadata?.decimals || 18) : BigInt(0),
      nftAddress: offerType === "NFT" ? selectedNft?.tokenAddress || zeroAddress : zeroAddress,
      nftId: offerType === "NFT" ? BigInt(selectedNft?.tokenId || "0") : BigInt(0),
      allowPartialFills: tradeType === "partial",
      created: currentTimestamp,
      expiration: oneWeekFromNow,
      fillOptions: tradeOptions.map(option => ({
        chainId: BigInt(tokenMetadata.find(token => token.name === option.chain)?.network_id || 0),
        tokenAddress: tokenMetadata.find(token => token.name === option.chain)?.address || zeroAddress,
        tokenAmount: parseUnits(option.amount, 6), // Assuming USDC with 6 decimals
        destAddress: zeroAddress, // Assuming the address to be the current user's address
      })),
      status: FillStatus.Pending,
      offerFills: [],
      depositTokenAddress: zeroAddress,
      depositAmount: BigInt(0),
      filledBP: BigInt(0),
      pendingBP: BigInt(0),
    };

    try {
      console.log({ offerData });
      await createOfferWrite({
        functionName: "createOffer",
        args: [offerData],
      });
      console.log("Offer created successfully");
      // Reset form or navigate to a success page
    } catch (error) {
      console.error("Error creating offer:", getParsedError(error));
    }
  };

  return (
    <div className="container mx-auto p-4 mt-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Create a New Trade</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label className="block text-xl font-bold mb-2">Your Offer</label>
          <div className="flex items-center mb-4">
            <label className="flex items-center mr-4">
              <input
                type="radio"
                name="offerType"
                value="Token"
                checked={offerType === "Token"}
                onChange={() => setOfferType("Token")}
                className="mr-2"
              />
              <span>Token</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="offerType"
                value="NFT"
                checked={offerType === "NFT"}
                onChange={() => setOfferType("NFT")}
                className="mr-2"
              />
              <span>NFT</span>
            </label>
          </div>
          {offerType === "Token" && (
            <>
              <div className="mb-4">
                <div className="text-sm text-neutral-600 mb-1">Blockchain:</div>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedChain}
                  onChange={e => handleChainSelect(e.target.value)}
                >
                  <option value="">Select chain</option>
                  {chainMetadata.map((token, i) => (
                    <option key={i} value={token.name}>
                      {token.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedChain && (
                <>
                  <div className="mb-4">
                    <div className="text-sm text-neutral-600 mb-1">Select token:</div>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedToken}
                      onChange={e => setSelectedToken(e.target.value)}
                    >
                      {
                        tokenMetadata.map((c) => c.name === selectedChain ? c : null).filter((e) => e).map((token, i) => (
                          <option key={i} value={token?.symbol}>
                            {token?.symbol}
                          </option>
                        ))
                      }
                      <option value="USDC">USDC</option>
                    </select>
                  </div>

                  {balance && selectedChain && (
                    <div className="bg-gray-100 p-3 py-2 rounded-md mb-4">
                      <label className="block text-sm font-bold">Your Balance</label>
                      {isLoading && <div>Loading balance...</div>}
                      {isError && <div>Error fetching balance</div>}
                      {!isLoading && !isError && (
                        <div className="flex justify-between items-center">
                          <div className="text-xl font-bold">
                            {balance.formatted} {balance.symbol}
                          </div>
                          <div className="text-sm text-gray-500">on {selectedChain}</div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="text-sm text-neutral-600 mb-1">
                      Amount of {balance?.symbol || "token"} to add to trade:
                    </div>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={selectedTokenAmount}
                      onChange={e => setSelectedTokenAmount(e.target.value)}
                    />
                  </div>
                </>
              )}
            </>
          )}
          {offerType === "NFT" && (
            <>
              <div className="mb-4">
                <div className="text-sm text-neutral-600 mb-1">Blockchain:</div>
                <select
                  className="w-full p-2 border rounded-md"
                  value=""
                  onChange={e => handleNftChainSelect(e.target.value)}
                >
                  <option value="">Select chain</option>
                  {tokenMetadata.map((token, i) => (
                    <option key={i} value={token.name}>
                      {token.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedNftChains.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">Select NFT</label>
                  {nftsLoading && <div>Loading your NFTs...</div>}
                  {nftsError && <div>Error loading NFTs: {nftsError}</div>}
                  {!nftsLoading && !nftsError && nfts.length === 0 && (
                    <div>You don't have any NFTs on the selected chains</div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {nfts.map(nft => (
                      <div
                        key={`${nft.tokenAddress}-${nft.tokenId}`}
                        className={`border p-2 rounded-md cursor-pointer ${selectedNft?.tokenId === nft.tokenId ? "border-blue-500" : "border-gray-300"
                          }`}
                        onClick={() => handleNftSelect(nft)}
                      >
                        <img
                          src={nft.metadata?.image || "/placeholder-image.png"}
                          alt={nft.name}
                          className="w-full h-auto"
                        />
                        <p className="text-sm mt-1">{nft.name || `NFT #${nft.tokenId}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              o.yYrt.é
            </>
          )}
        </div>
        <div className="flex justify-center mb-4">
          <div className="text-xl">⇅</div>
        </div>
        <div className="mb-6">
          <label className="block text-xl font-bold mb-2">Requesting</label>
          <div className="flex items-center mb-4">
            <label className="flex items-center mr-4">
              <input
                type="radio"
                name="tradeType"
                value="full"
                checked={tradeType === "full"}
                onChange={() => setTradeType("full")}
                className="mr-2"
              />
              <span>Only allow full trades</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="tradeType"
                value="partial"
                checked={tradeType === "partial"}
                onChange={() => setTradeType("partial")}
                className="mr-2"
              />
              <span>Partially fillable trade</span>
            </label>
          </div>
          {tradeOptions.map((option, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-md mb-4">
              <label className="block text-sm font-bold mb-2">Blockchain</label>
              <select
                className="w-full p-2 border rounded-md mb-2"
                value={option.chain}
                onChange={e => handleOptionChange(index, "chain", e.target.value)}
              >
                <option value="">Select Chain</option>
                {tokenMetadata.map((token, i) => (
                  <option key={i} value={token.name}>
                    {token.name}
                  </option>
                ))}
              </select>
              {option.chain && (
                <>
                  <label className="block text-sm font-bold mb-2">Token</label>
                  <select
                    className="w-full p-2 border rounded-md mb-2"
                    value={option.token}
                    onChange={e => handleOptionChange(index, "token", e.target.value)}
                  >
                    <option value="USDC">USDC</option>
                  </select>
                  <label className="block text-sm font-bold mb-2">Amount</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    value={option.amount}
                    onChange={e => handleOptionChange(index, "amount", e.target.value)}
                  />
                </>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="w-full bg-gray-300 text-center py-2 rounded-md mb-4"
          >
            + Add Another Option
          </button>
        </div>
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-md" disabled={isCreateOfferLoading}>
          {isCreateOfferLoading ? "Creating offer..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default CreateTrade;
