"use client";

import { useState } from "react";

interface TradeOption {
  chain: string;
  token: string;
  amount: string;
}

const CreateTrade = () => {
  const [offerType, setOfferType] = useState<"Token" | "NFT">("Token");
  const [tradeType, setTradeType] = useState<"full" | "partial">("full");
  const [tradeOptions, setTradeOptions] = useState<TradeOption[]>([{ chain: "", token: "", amount: "" }]);
  const [nftCollection, setNftCollection] = useState<string[]>(["/path/to/nft1.png", "/path/to/nft2.png"]);
  const [selectedNft, setSelectedNft] = useState<string>("");

  const handleAddOption = () => {
    setTradeOptions([...tradeOptions, { chain: "", token: "", amount: "" }]);
  };

  const handleOptionChange = (index: number, field: keyof TradeOption, value: string) => {
    const newTradeOptions = [...tradeOptions];
    newTradeOptions[index][field] = value;
    setTradeOptions(newTradeOptions);
  };

  const handleNftSelect = (nft: string) => {
    setSelectedNft(nft);
    setNftCollection(nftCollection); //templine to fix errors
  };

  return (
    <div className="container mx-auto p-4 min-h-screen mt-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Create a New Trade</h1>
      <form className="w-full max-w-md bg-gray-200 p-6 rounded-lg shadow-md">
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
                <select className="w-full p-2 border rounded-md">
                  <option>Select token & chain</option>
                  {/* Add options here */}
                </select>
              </div>
              <div className="bg-white p-4 rounded-md mb-4">
                <label className="block text-sm font-bold mb-1">You Send</label>
                <div className="text-xl font-bold">2.5123 BTC</div>
                <div className="text-sm text-gray-500">on Polygon</div>
              </div>
            </>
          )}
          {offerType === "NFT" && (
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Select NFT</label>
              <div className="grid grid-cols-2 gap-2">
                {nftCollection.map((nft, index) => (
                  <div
                    key={index}
                    className={`border p-2 rounded-md ${selectedNft === nft ? "border-blue-500" : "border-gray-300"}`}
                    onClick={() => handleNftSelect(nft)}
                  >
                    <img src={nft} alt={`NFT ${index + 1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>
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
                <option>Select Chain</option>
                {/* Add options here */}
              </select>
              <select
                className="w-full p-2 border rounded-md mb-2"
                value={option.token}
                onChange={e => handleOptionChange(index, "token", e.target.value)}
              >
                <option>Select Token</option>
                {/* Add options here */}
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
