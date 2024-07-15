'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TradeOfferCard } from '~~/components/TradeOfferCard';
import { Grid } from 'react-loader-spinner';

type TokenDetails = {
  logoUrl: string;
  symbol: string;
  address: string;
  decimals: string;
  blockChainId: number;
};

type Receive = {
  amount: string;
  token: string;
  decimals: string;
  chain: string;
  tokenDetails: TokenDetails;
};

type Offer = {
  amount: string;
  chain: string;
  tokenDetails: TokenDetails;
};

type Trade = {
  id: number;
  receive: Receive[];
  offer: Offer;
  status: number;
  chain: string[];
  creator: string;
};

const Trades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch('/api/trades');
        const data: Trade[] = await response.json();
        console.log({ data });
        setTrades(data);
      } catch (error) {
        console.error('Failed to fetch trades', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-8">All Trade Offers</h1>
        <Link href="/create">
          <button className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">Create a Trade</button>
        </Link>
      </div>

      {loading &&
        <div className="flex justify-center items-center min-h-96">
          <Grid
            height={80}
            width={80}
            color="rgb(37, 99, 235)"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trades.map(trade => (
          <TradeOfferCard
            key={trade.id}
            id={trade.id.toString()}
            offer={trade.offer}
            receive={trade.receive}
            status={trade.status}
            creator={trade.creator}
          />
        ))}
      </div>
    </div>
  );
};

export default Trades;