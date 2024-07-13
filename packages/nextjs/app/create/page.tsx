"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import Moralis from 'moralis';

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

const tokenMetadata = [
  {
    symbol: "USDC",
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    decimals: "6",
    name: "Base Sepolia",
    logo_url: "USDC_LOGO",
    network_id: 84532,
  },
  {
    symbol: "USDC",
    address: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
    decimals: "6",
    name: "Celo Alfajores",
    logo_url: "USDC_LOGO",
    network_id: 44787,
  },
  {
    symbol: "USDC",
    name: "Arbitrum Sepolia",
    address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    decimals: "6",
    logo_url: "USDC_LOGO",
    network_id: 421614,
  },
];

// Initialize Moralis
Moralis.start({
  apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYyMDU5ZTQzLWZmOTgtNGI5OC1hZTMyLWQyOGJiYjY1ZjdkYSIsIm9yZ0lkIjoiMTQwMDQ3IiwidXNlcklkIjoiMTM5NjkyIiwidHlwZUlkIjoiOGJkZDVkZDAtMjIyMS00Nzg0LWEyZDMtYzU1NGJjZDM4ZGU2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjA4NjY4MjcsImV4cCI6NDg3NjYyNjgyN30.MgxL1ea2gQEAJ-nsaJt3CeQpTa-UJXrEqL-91qH88Xk" // Use environment variable
});

const useUserNFTs = (address: string | undefined, chain: string | undefined) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !chain) {
        setIsLoading(false);
        return;
      }

      try {
        console.log({ chain })
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
          chain,
          format: "decimal",
          mediaItems: false,
          address: address
        });

        const fetchedNFTs: NFT[] = response.result.map((nft: any) => ({
          tokenId: nft.tokenId.toString(),
          name: nft.name || "",
          symbol: nft.symbol || "",
          tokenAddress: nft.tokenAddress.toLowerCase(),
          tokenUri: nft.tokenUri || "",
          metadata: nft.metadata
        }));

        console.log({ fetchedNFTs })
        setNfts(fetchedNFTs);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to fetch NFTs");
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address, chain]);

  return { nfts, isLoading, error };
};

const CreateTrade = () => {
  const [offerType, setOfferType] = useState<"Token" | "NFT">("Token");
  const [tradeType, setTradeType] = useState<"full" | "partial">("full");
  const [tradeOptions, setTradeOptions] = useState<TradeOption[]>([{ chain: "", token: "", amount: "" }]);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("USDC");
  const [selectedNftChain, setSelectedNftChain] = useState<string>("");
  const { address } = useAccount();
  const { nfts, isLoading: nftsLoading, error: nftsError } = useUserNFTs(address, tokenMetadata.find(token => token.name === selectedNftChain)?.network_id.toString());

  const selectedTokenMetadata = tokenMetadata.find(token => token.name === selectedChain);

  const { data: balance, isError, isLoading } = useBalance({
    address: address,
    token: selectedTokenMetadata?.address,
    chainId: selectedTokenMetadata?.network_id,
  });

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
    setSelectedNftChain(chain);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tradeForm = {
      offerType,
      tradeType,
      offer: offerType === "Token"
        ? { chain: selectedChain, token: selectedToken, amount: "" }
        : { nft: selectedNft },
      requesting: tradeOptions,
    };
    console.log("Trade Form:", tradeForm);
    // Here you would typically send this data to your backend or smart contract
  };

  return (
    <div className="container mx-auto p-4 min-h-screen mt-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Create a New Trade</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-200 p-6 rounded-lg shadow-md">
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
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedChain}
                  onChange={(e) => handleChainSelect(e.target.value)}
                >
                  <option value="">Select chain</option>
                  <option value="Base Sepolia">Base Sepolia</option>
                  <option value="Celo Alfajores">Celo Alfajores</option>
                  <option value="Arbitrum Sepolia">Arbitrum Sepolia</option>
                </select>
              </div>
              {selectedChain && (
                <div className="mb-4">
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                  >
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              )}
              <div className="bg-white p-4 rounded-md mb-4">
                <label className="block text-sm font-bold mb-1">Your Balance</label>
                {isLoading && <div>Loading balance...</div>}
                {isError && <div>Error fetching balance</div>}
                {balance && (
                  <div>
                    <div className="text-xl font-bold">{balance.formatted} {balance.symbol}</div>
                    <div className="text-sm text-gray-500">on {selectedChain}</div>
                  </div>
                )}
              </div>
            </>
          )}
          {offerType === "NFT" && (
            <>
              <div className="mb-4">
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedNftChain}
                  onChange={(e) => handleNftChainSelect(e.target.value)}
                >
                  <option value="">Select chain</option>
                  <option value="Base Sepolia">Base Sepolia</option>
                  <option value="Celo Alfajores">Celo Alfajores</option>
                  <option value="Arbitrum Sepolia">Arbitrum Sepolia</option>
                </select>
              </div>
              {selectedNftChain && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">Select NFT</label>
                  {nftsLoading && <div>Loading your NFTs...</div>}
                  {nftsError && <div>Error loading NFTs: {nftsError}</div>}
                  <div className="grid grid-cols-2 gap-2">
                    {nfts.map((nft) => (
                      <div
                        key={`${nft.tokenAddress}-${nft.tokenId}`}
                        className={`border p-2 rounded-md ${selectedNft?.tokenId === nft.tokenId ? "border-blue-500" : "border-gray-300"}`}
                        onClick={() => handleNftSelect(nft)}
                      >
                        <img src={nft.metadata?.image || '/placeholder-image.png'} alt={nft.name} className="w-full h-auto" />
                        <p className="text-sm mt-1">{nft.name || `NFT #${nft.tokenId}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <div key={index} className="bg-white p-4 rounded-md mb-4">
              <select
                className="w-full p-2 border rounded-md mb-2"
                value={option.chain}
                onChange={e => handleOptionChange(index, "chain", e.target.value)}
              >
                <option value="">Select Chain</option>
                <option value="Base Sepolia">Base Sepolia</option>
                <option value="Celo Alfajores">Celo Alfajores</option>
                <option value="Arbitrum Sepolia">Arbitrum Sepolia</option>
              </select>
              <select
                className="w-full p-2 border rounded-md mb-2"
                value={option.token}
                onChange={e => handleOptionChange(index, "token", e.target.value)}
              >
                <option value="USDC">USDC</option>
              </select>
              <div className="flex items-center">
                <label className="block text-sm font-bold mr-2">Amount</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={option.amount}
                  onChange={e => handleOptionChange(index, "amount", e.target.value)}
                />
              </div>
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
        <button type="submit" className="w-full bg-black text-white py-2 rounded-md">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateTrade;
