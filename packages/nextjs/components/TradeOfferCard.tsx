import React, { FC } from 'react';
import Link from 'next/link';
import { Address } from '~~/components/scaffold-eth';
import { formatUnits } from 'viem'; // adjust this import according to your setup

interface TokenDetails {
  logoUrl: string;
  symbol: string;
  address: string;
  decimals: string;
  blockChainId: number;
}

interface TradeItem {
  amount: string;
  token: string;
  chain: string;
  tokenDetails: TokenDetails;
}

interface Offer {
  amount: string;
  chain: string;
  tokenDetails: TokenDetails;
}

interface TradeOfferCardProps {
  id: string;
  offer: Offer;
  receive: TradeItem[];
  status: number;
  creator: string;
}

const formatAmount = (amount: any, decimals: string) => {
  return formatUnits(amount, parseInt(decimals));
};

export enum OrderStatus {
  Active = 1,
  Expired = 2,
  Canceled = 3,
  Filled = 4,
}

export enum FillStatus {
  Pending = 1,
  Invalid = 2,
  Succeeded = 3,
  Expired = 4,
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

const getCTAButtonText = (status: number): string => {
  switch (status) {
    case OrderStatus.Active:
      return 'Join Trade';
    case OrderStatus.Filled:
      return 'Fill Order';
    default:
      return 'View Trade';
  }
};

export const TradeOfferCard: FC<TradeOfferCardProps> = ({ id, receive, offer, status, creator }) => {
  return (
    <Link href={`/trade/${id}`} passHref>
      <div className="border p-4 rounded-lg shadow-lg bg-gray-200 transition-all hover:opacity-95 hover:scale-105 hover:shadow-2xl hover:cursor-pointer">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="flex items-center mb-3 w-full text-gray-600 text-sm">
            Receive from <div className="ml-2"><Address address={creator} size="sm" /></div>
          </div>
          <div className="flex items-center text-gray-700 text-lg font-semibold justify-between">
            <div>
              {formatAmount(offer.amount, offer.tokenDetails.decimals)} {offer.tokenDetails.symbol}
              <img src={offer.tokenDetails.logoUrl} alt={offer.chain} className="inline-block h-5 ml-2" />
            </div>
            <span className="text-sm font-normal text-gray-500">on {offer.chain}</span>
          </div>
        </div>
        <div className="flex justify-center my-2">
          <div className="text-xl">⇅</div>
        </div>
        <div className="mb-4">
          <div className="bg-white p-4 rounded-md shadow-sm mb-2">
            <div className="flex items-center mb-2 w-full text-gray-600 text-sm">
              You send
            </div>
            {receive.map((item, index) => (
              <>
                <div key={index} className="flex items-center text-gray-700 text-lg font-semibold justify-between">
                  <div>
                    {formatAmount(item.amount, item.tokenDetails.decimals)} {item.tokenDetails.symbol}
                    <img src={item.tokenDetails.logoUrl} alt={item.chain} className="inline-block h-5 ml-2" />
                  </div>
                  <span className="text-sm text-right font-normal text-gray-500 ml-3">on {item.chain}</span>
                </div>
                {index < receive.length - 1 && <div className="text-gray-600 text-xs my-2">OR</div>}</>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm mb-2">
          <div className="text-gray-600 text-sm">Trade status</div>
          <div className="text-lg font-semibold">{getStatusText(status)}</div>
          <div className="flex mt-4 w-full">
            <div className={`h-2 w-1/4 ${status === OrderStatus.Active ? 'bg-green-500' : 'bg-gray-300'} rounded-full mr-1`}></div>
            <div className={`h-2 w-1/4 ${status === OrderStatus.Canceled ? 'bg-red-500' : 'bg-gray-300'} rounded-full mr-1`}></div>
            <div className={`h-2 w-1/4 ${status === OrderStatus.Filled ? 'bg-blue-500' : 'bg-gray-300'} rounded-full mr-1`}></div>
            <div className="h-2 w-1/4 bg-gray-300 rounded-full mr-1"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          <button className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded w-full">{getCTAButtonText(status)}</button>
        </div>
      </div>
    </Link>
  );
};
