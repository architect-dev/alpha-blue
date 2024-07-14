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
          Trade tokens and NFTs directly with your community
        </p>
      </div>

      {/* Middle Section */}
      <div className="middle-section flex flex-col items-center justify-center h-screen bg-blue-800 text-white text-center p-8">
        <div className="max-w-5xl p-20 bg-transparent text-lg md:text-xl font-sans font-semibold leading-relaxed text-white">
          Alpha Blue is a decentralized orderbook exchange that allows two parties to place and fill offers for tokens and NFTs. The protocol leverages Chainlink CCIP for cross-chain interoperability which allows for reliable and secure message transfers. This makes Alpha Blue a superior option for users looking trade and even bridge assets across blockchains. Alpha Blue addresses the gap in the market by providing a user-friendly and secure solution for peer to peer market activity.
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
