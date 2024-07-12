import React, { FC } from "react";
import Link from "next/link";

interface TradeItem {
  amount: string;
  token: string;
  chain: string;
}

interface TradeOfferCardProps {
  id: string;
  offer: string;
  receive: TradeItem[];
  send: TradeItem[];
  status: string;
}

const networkImages: { [key: string]: string } = {
  Polygon:
    "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/icon/matic.png",
  BNB: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/icon/bnb.png",
  ETH: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/icon/eth.png",
  Base: "https://moonpay-marketing-c337344.payloadcms.app/media/base%20logo.webp",
};

export const TradeOfferCard: FC<TradeOfferCardProps> = ({ id, offer, receive, send, status }) => {
  const getNetworkImage = (chain: string) => networkImages[chain] || "";

  return (
    <div className="border p-4 rounded-lg shadow-lg bg-gray-200">
      <div className="mb-4">
        <div className="bg-white p-4 rounded-md shadow-sm mb-2">
          <div className="text-gray-600 text-sm">Receive from 0x1234567890...</div>
          <div className="text-gray-700 text-lg font-semibold">
            {offer} <span className="text-sm font-normal text-gray-500">on {receive[0].chain}</span>
            <img src={getNetworkImage(receive[0].chain)} alt={receive[0].chain} className="inline-block h-6 ml-2" />
          </div>
        </div>
        <div className="flex justify-center mb-2">
          <div className="text-xl">⇅</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="font-semibold text-sm text-gray-500">Send</div>
          {send.map((item, index) => (
            <div key={index} className="text-gray-700 text-lg font-semibold">
              {item.amount} {item.token} <span className="text-sm font-normal text-gray-500">on {item.chain}</span>
              <img src={getNetworkImage(item.chain)} alt={item.chain} className="inline-block h-6 ml-2" />
            </div>
          ))}
          {receive.length > 1 && <div className="text-sm text-gray-500">or</div>}
          {receive.length > 1 &&
            receive.slice(1).map((item, index) => (
              <div key={index} className="text-gray-700 text-lg font-semibold">
                {item.amount} {item.token} <span className="text-sm font-normal text-gray-500">on {item.chain}</span>
                <img src={getNetworkImage(item.chain)} alt={item.chain} className="inline-block h-6 ml-2" />
              </div>
            ))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-md shadow-sm mb-2">
        <div className="text-gray-600 text-sm">Trade status</div>
        <div className="text-lg font-semibold">{status}</div>
        <div className="flex mt-4 w-full">
          <div
            className={`h-2 w-1/4 ${status === "Waiting for a Participant" ? "bg-green-500" : "bg-gray-300"} rounded-full mr-1`}
          ></div>
          <div
            className={`h-2 w-1/4 ${status === "Partially filled" ? "bg-orange-500" : "bg-gray-300"} rounded-full mr-1`}
          ></div>
          <div className="h-2 w-1/4 bg-gray-300 rounded-full mr-1"></div>
          <div className="h-2 w-1/4 bg-gray-300 rounded-full mr-1"></div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-5">
        {status === "Waiting for a Participant" && (
          <Link href={`/join/${id}`} passHref>
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Join Trade</button>
          </Link>
        )}
        {status === "Partially filled" && (
          <Link href={`/join/${id}`} passHref>
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Fill Order</button>
          </Link>
        )}
        <Link href={`/trade/${id}`} passHref>
          <button className="bg-gray-600 text-white px-4 py-2 rounded w-full">View Trade</button>
        </Link>
      </div>
    </div>
  );
};
