import React from "react";
import TextAnimation from "../../components/TextAnimation";
import Image from "next/image";

const Landing = () => {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden">
      {/* Hero Section */}
      <div className="hero-section flex flex-col items-center justify-center h-screen bg-gray-100 text-center pb-14">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Peer 2 Peer Cross Chain Orderbook Exchange
        </h1>
        <Image
          src="/Emoji.png"
          alt="Counterclockwise emoji"
          width={75}
          height={75}
          style={{ objectFit: 'contain', margin: 40 }}
        />
        <p className="text-lg md:text-xl mb-6">
          Trade across blockchains directly with the community
        </p>
      </div>

      {/* Middle Section */}
      <div className="middle-section flex flex-col items-center justify-center h-screen bg-blue-800 text-white text-center p-8">
        <div className="max-w-3xl p-6 bg-transparent text-lg md:text-xl font-sans font-semibold leading-relaxed text-white">
          Alpha Blue is a decentralized, trustless platform that doesn’t require liquidity on both sides for swaps. With Chainlink CCIP, our cross-chain transactions are fast and reliable, making Alpha Blue a superior option for users looking to bridge assets across multiple blockchains. Alpha Blue addresses the gap in the market by providing a user-friendly and secure solution for truly decentralized asset bridging.
        </div>
      </div>

      {/* Text Animation Section */}
      <div className="text-animation-section flex flex-col items-center justify-center h-screen bg-white text-center p-8">
        <TextAnimation />
      </div>
    </div>
  );
};

export default Landing;
