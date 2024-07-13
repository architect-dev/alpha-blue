"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatUnits } from 'viem';
import { Address } from '~~/components/scaffold-eth';
import { Grid } from 'react-loader-spinner';

interface TokenDetails {
  logoUrl: string;
  symbol: string;
  address: string;
  decimals: string;
  blockChainId: number;
}

interface SendOption {
  amount: string;
  token: string;
  chain: string;
  tokenDetails: TokenDetails;
}

interface Offer {
  amount: string;
  chain: string;
  tokenDetails: TokenDetails;
  partialFill: boolean;
}

interface Trade {
  id: number;
  receive: SendOption[];
  offer: Offer;
  status: number;
  chain: string[];
  creator: string;
}

enum OrderStatus {
  Active = 1,
  Expired = 2,
  Canceled = 3,
  Filled = 4,
}

const getStatusText = (status: number): string => {
  switch (status) {
    case OrderStatus.Active:
      return 'Active';
    case OrderStatus.Expired:
      return 'Expired';
    case OrderStatus.Canceled:
      return 'Canceled';
    case OrderStatus.Filled:
      return 'Filled';
    default:
      return 'Unknown Status';
  }
};

const JoinTrade = () => {
  const params = useParams();
  const tradeid = params.id as string;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [tradeAmount, setTradeAmount] = useState(100);
  const [selectedSendOption, setSelectedSendOption] = useState<SendOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTradeData = async () => {
      if (!tradeid) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/trade/${tradeid}`);
        if (!response.ok) throw new Error('Failed to fetch trade data');
        const data: Trade = await response.json();
        setTrade(data);
        if (data.receive.length === 1) {
          setSelectedSendOption(data.receive[0]);
        }
      } catch (err) {
        setError('Failed to load trade data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradeData();
  }, [tradeid]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTradeAmount(parseInt(e.target.value));
  };

  const handleSendOptionSelect = (option: SendOption) => {
    setSelectedSendOption(option);
  };

  const formatAmount = (amount: any, decimals: string) => {
    return formatUnits(amount, parseInt(decimals));
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-96">
      <Grid
        height={80}
        width={80}
        color="rgb(37, 99, 235)"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>)
  if (error) return <div>Error: {error}</div>;
  if (!trade) return <div>No trade data available</div>;

  const receiveAmount = selectedSendOption
    ? (parseFloat(trade.offer.amount) * tradeAmount) / 100
    : 0;
  const sendAmount = selectedSendOption
    ? (parseFloat(selectedSendOption.amount) * tradeAmount) / 100
    : 0;

  return (
    <div className="container max-w-lg mx-auto p-4 flex flex-col items-center">
      <div className="text-sm mb-6 mt-3 text-neutral-500">{trade.id}</div>

      <div className="bg-white p-6 py-4 pt-3 rounded-md shadow-sm mb-6 w-full">
        <div className="text-gray-600 text-sm">Trade status</div>
        <div className="text-lg font-semibold">{getStatusText(trade.status)}</div>
        <div className="flex mt-4 w-full">
          <div className={`h-2 w-1/4 ${trade.status === OrderStatus.Active ? 'bg-green-500' : 'bg-gray-300'} rounded-full mr-1`}></div>
          <div className={`h-2 w-1/4 ${trade.status === OrderStatus.Canceled ? 'bg-red-500' : 'bg-gray-300'} rounded-full mr-1`}></div>
          <div className={`h-2 w-1/4 ${trade.status === OrderStatus.Filled ? 'bg-blue-500' : 'bg-gray-300'} rounded-full mr-1`}></div>
          <div className="h-2 w-1/4 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div className="mb-6 w-full bg-white p-6 py-4 rounded-lg shadow-md">
        <label className="block text-lg font-bold mb-1">You Receive</label>
        <div className="flex items-center mb-4 w-full text-gray-600 text-sm">
          From <div className="ml-2"><Address address={trade.creator} size="sm" /></div>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mb-1">
          <div className="flex items-center text-2xl font-bold">
            {formatAmount(receiveAmount.toString(), trade.offer.tokenDetails.decimals)} {trade.offer.tokenDetails.symbol}
            <img src={trade.offer.tokenDetails.logoUrl} alt={trade.offer.chain} className="inline-block h-5 ml-2" />
          </div>
          <div className="text-sm text-gray-500">on {trade.offer.chain}</div>
        </div>
      </div>

      <div className="mb-6 w-full bg-white p-6 rounded-lg shadow-md">
        <label className="block text-xl font-bold">You send</label>
        <div className="text-sm text-gray-500 mb-3">Select the option you'd like to send</div>
        {trade.receive.map((option, index) => (
          <div key={index} onClick={() => handleSendOptionSelect(option)}>
            <div className={`bg-neutral-100 p-4 rounded-md shadow-sm mb-2 cursor-pointer transition-all hover:shadow-lg  ${selectedSendOption === option ? 'border-2 border-blue-500' : 'border-2 border-neutral-200'}`}>
              <div className="flex items-center text-gray-700 text-lg font-semibold justify-between">
                <div>
                  {formatAmount(option.amount, option.tokenDetails.decimals)} {option.tokenDetails.symbol}
                  <img src={option.tokenDetails.logoUrl} alt={option.chain} className="inline-block h-5 ml-2" />
                </div>
                <span className="text-sm font-normal text-gray-500 ml-3">on {option.chain}</span>
              </div>
            </div>
            {index < trade.receive.length - 1 && <div className="text-gray-600 text-sm text-center my-2">OR</div>}
          </div>
        ))}

        {selectedSendOption && trade.offer.partialFill ? (

          <>
            <div className="my-6">
              <div className=" font-bold">Partial fill on this trade is permitted</div>
              <div className="text-sm text-gray-500 mb-3">Use the slider to choose how much you'd like to trade</div>
              <div className="relative w-full">
                <div className="text-xs font-bold w-full">{tradeAmount}%</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tradeAmount}
                  onChange={handleSliderChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="">
              <div className="text-center rounded-md">
                <div className="flex items-center justify-center text-2xl font-bold">
                  {formatAmount(sendAmount.toString(), selectedSendOption.tokenDetails.decimals)} {selectedSendOption.tokenDetails.symbol}
                  <img src={selectedSendOption.tokenDetails.logoUrl} alt={selectedSendOption.chain} className="inline-block h-5 ml-2" />
                </div>
                <div className="text-sm text-gray-500">on {selectedSendOption.chain}</div>
              </div>
            </div>
          </>
        ) : <div></div>}
      </div>
      <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-md">
        Submit
      </button>

    </div>
  );
};

export default JoinTrade;
