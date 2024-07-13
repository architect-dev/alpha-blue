"use client";

// import { useAccount } from "wagmi";
// import { Address } from "~~/components/scaffold-eth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TradeOfferCard } from "~~/components/TradeOfferCard";

// import { Balance } from "~~/components/scaffold-eth";

// Import TradeOfferCard

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
      // Add more trades as needed
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
          <TradeOfferCard
            key={trade.id}
            id={trade.id.toString()} // Ensure id is a string as expected by TradeOfferCardProps
            offer={trade.offer}
            receive={trade.receive.map(item => ({ ...item, amount: item.amount.toString() }))} // Convert amount to string
            send={trade.send.map(item => ({ ...item, amount: item.amount.toString() }))} // Convert amount to string
            status={trade.status}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
