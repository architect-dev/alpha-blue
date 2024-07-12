"use client";

// import { useAccount } from "wagmi";
// import { Address } from "~~/components/scaffold-eth";
import { useEffect, useState } from "react";
import Link from "next/link";

type Trade = {
  id: number;
  offer: string;
  receive: { amount: number; token: string; chain: string }[];
  send: { amount: number; token: string; chain: string }[];
  status: string;
  chain: string;
};

const Home = () => {
  // const { address: connectedAddress } = useAccount();
  const [trades, setTrades] = useState<Trade[]>([]);

  // Placeholder for fetching trade data
  useEffect(() => {
    // Replace this with your actual data fetching logic
    setTrades([
      {
        id: 1,
        offer: "1 ETH",
        receive: [
          { amount: 3012, token: "USDT", chain: "Polygon" },
          { amount: 2975, token: "USDC", chain: "Base" },
        ],
        send: [{ amount: 1, token: "ETH", chain: "Polygon" }],
        status: "Waiting for a Participant",
        chain: "Polygon, Base",
      },
      {
        id: 2,
        offer: "1x NFT",
        receive: [{ amount: 3012, token: "USDT", chain: "Polygon" }],
        send: [{ amount: 1, token: "NFT", chain: "Polygon" }],
        status: "Completed",
        chain: "Polygon",
      },
      {
        id: 3,
        offer: "1 ETH",
        receive: [
          { amount: 3012, token: "USDT", chain: "Polygon" },
          { amount: 2975, token: "USDC", chain: "Base" },
        ],
        send: [{ amount: 1, token: "ETH", chain: "Polygon" }],
        status: "Partially filled",
        chain: "Polygon, Base",
      },
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-8">All Trade Offers</h1>
        <Link href="/create">
          <button className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">Create a Trade</button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trades.map(trade => (
          <div key={trade.id} className="border p-6 rounded-lg shadow-lg bg-white">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">{trade.offer}</h2>
              <div className="mb-2">
                <p className="font-semibold">Receive:</p>
                {trade.receive.map((item, index) => (
                  <p key={index} className="text-gray-700">
                    {item.amount} {item.token} on {item.chain}
                  </p>
                ))}
              </div>
              <div className="mb-2">
                <p className="font-semibold">Send:</p>
                {trade.send.map((item, index) => (
                  <p key={index} className="text-gray-700">
                    {item.amount} {item.token} on {item.chain}
                  </p>
                ))}
              </div>
              <p className="text-gray-600 mb-2">Status: {trade.status}</p>
            </div>
            <div className="flex justify-between items-center">
              {trade.status === "Waiting for a Participant" && (
                <Link href={`/join/${trade.id}`} passHref>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2">Join Swap</button>
                </Link>
              )}
              {trade.status === "Partially filled" && (
                <Link href={`/join/${trade.id}`} passHref>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2">Fill Order</button>
                </Link>
              )}
              <Link href={`/trade/${trade.id}`} passHref>
                <button className="bg-gray-500 text-white px-4 py-2 rounded w-full">View Swap</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
