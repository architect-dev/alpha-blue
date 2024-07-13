// app/offers/page.tsx
import React from "react";

const Offers = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Trade Offers</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Example Trade Card */}
        <div className="border p-4 rounded shadow">
          <h2>1 ETH</h2>
          <p>Send: 3,012 USDT</p>
          <p>Received: 2,975 USDC</p>
          <p>Status: Waiting for a Participant</p>
          <button className="bg-blue-500 text-white p-2 rounded">Join Swap</button>
        </div>
        {/* Repeat for other trades */}
      </div>
    </div>
  );
};

export default Offers;
