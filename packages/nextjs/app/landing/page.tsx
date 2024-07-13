import React from "react";
import TextAnimation from "../../components/TextAnimation"; 

const Landing = () => {
  return (
    <div className="relative min-h-screen w-screen">
      <div className="hero-section flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Peer 2 Peer Cross Chain Orderbook Exchange
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Seamlessly trade across different blockchains with our advanced orderbook exchange.
        </p>
      </div>
      <div className="text-animation-section flex flex-col items-center justify-center h-screen bg-white text-center p-8">
        <TextAnimation />
      </div>
    </div>
  );
};

export default Landing;
