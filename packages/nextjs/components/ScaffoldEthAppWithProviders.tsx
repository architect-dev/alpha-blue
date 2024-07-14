"use client";

import { useEffect } from "react";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider, mergeNetworks } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { ProgressBar } from "~~/components/scaffold-eth/ProgressBar";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { customEvmNetworks } from "~~/lib/networks";
import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { useTheme } from "next-themes";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, []);

  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const evmNetworks = [
  ...scaffoldConfig.targetNetworks.map(chain => ({
    blockExplorerUrls: chain.blockExplorers
      ? Object.values(chain.blockExplorers as any).map(({ url }: any) => url)
      : [],
    chainId: chain.id,
    name: chain.name,
    rpcUrls: Object.values(chain.rpcUrls).map(({ http }) => http[0]),
    iconUrls: [
      chain.name === "Foundry"
        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz4i1wWF516fnkizp1WSDG5rnG8GfkQAVoVQ&s" : ""
    ],
    nativeCurrency: chain.nativeCurrency,
    networkId: chain.id,
  })),
  ...customEvmNetworks,
];

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "3ce71c13-aa6f-4af5-8449-34a780fd9896",
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: networks => mergeNetworks(evmNetworks, networks),
        },
      }}
      theme={"light"}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ProgressBar />
          <DynamicWagmiConnector>
            <ScaffoldEthApp>{children}</ScaffoldEthApp>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
};
