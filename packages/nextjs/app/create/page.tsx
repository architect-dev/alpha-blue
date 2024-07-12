// app/create/page.tsx
import React from "react";

const CreateTrade = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Trade</h1>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Your Offer</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3"
            type="text"
            placeholder="2.5123 BTC"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Requesting</label>
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

export default CreateTrade;
