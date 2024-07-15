import React from "react";
// import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

// const TextAnimation = dynamic(() => import("../components/TextAnimation"), { ssr: false });

const Home = () => {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden">
      {/* Hero */}
      <div className="hero-section flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-6 md:px-8 pb-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Peer 2 Peer Cross Chain Orderbook Exchange
        </h1>
        <Link href="/trades">
        <div className="mt-10 px-6 py-3 bg-blue-400 text-white font-semibold text-lg rounded-full hover:bg-blue-500 transition duration-300">
            View Open Orders
          </div>
        </Link>
      </div>

      {/* About */}
      <div className="middle-section flex flex-col items-center justify-center h-screen bg-blue-800 text-white text-center px-6 py-12">
        <div className="max-w-3xl md:max-w-5xl p-8 md:p-20 bg-transparent text-lg md:text-xl font-sans font-semibold leading-relaxed text-white">
          Alpha Blue is a decentralized orderbook exchange that allows two parties to place and fill offers for tokens and NFTs. The protocol leverages Chainlink CCIP for cross-chain interoperability which allows for reliable and secure message transfers between chains. This makes Alpha Blue a superior option for users looking to trade or even bridge assets across blockchains. Alpha Blue addresses the gap in the market by providing a user-friendly and secure solution for peer to peer market activity.
        </div>
      </div>

      {/* Animation */}
      {/* <div className="text-animation-section flex flex-col items-center justify-center h-screen bg-white text-center p-8">
        <TextAnimation />
      </div> */}
      <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-8 mt-20">
        <Image
          src="/Alpha-Blue.png"
          alt="Alpha Blue Logo"
          width={700}
          height={700}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
};

export default Home;
