// app/join/page.tsx
import React from "react";

const JoinSwap = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Join Trade</h1>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">You Receive</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3"
            type="text"
            placeholder="2.5123 BTC"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Select Chain</label>
          <select className="shadow appearance-none border rounded w-full py-2 px-3">
            <option>Polygon</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">You Send</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3"
            type="text"
            placeholder="10,523 USDT"
          />
        </div>
        <button className="bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
    </div>
  );
};

export default JoinSwap;
