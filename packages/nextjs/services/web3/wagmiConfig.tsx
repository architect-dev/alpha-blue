import { getOrMapViemChain } from "@dynamic-labs/viem-utils";
import { Chain, createClient, http } from "viem";
import {

  celo,
  celoAlfajores,
  foundry, mainnet, scroll, scrollSepolia, goerli, sepolia, optimism, optimismGoerli, optimismSepolia, arbitrum, arbitrumGoerli, arbitrumSepolia, polygon, polygonMumbai, polygonAmoy, astar, polygonZkEvm, polygonZkEvmTestnet, base, baseGoerli, baseSepolia,
} from "viem/chains";
import { createConfig } from "wagmi";
import { customEvmNetworks } from "~~/lib/networks";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

export const wagmiConfig = createConfig({
  chains: [
    arbitrum as Chain,
    arbitrumSepolia as Chain,
    celo as Chain,
    celoAlfajores as Chain,
    base as Chain,
    baseSepolia as Chain,
    mainnet as Chain,
    polygon as Chain,
    polygonZkEvm as Chain,
    polygonZkEvmTestnet as Chain,
    polygonAmoy as Chain,
    scroll as Chain,
    scrollSepolia as Chain,
    sepolia as Chain,
    foundry as Chain,
    goerli as Chain,
    sepolia as Chain,
    optimism as Chain,
    optimismGoerli as Chain,
    optimismSepolia as Chain,
    arbitrum as Chain,
    arbitrumGoerli as Chain,
    arbitrumSepolia as Chain,
    polygon as Chain,
    polygonMumbai as Chain,
    polygonAmoy as Chain,
    astar as Chain,
    polygonZkEvm as Chain,
    polygonZkEvmTestnet as Chain,
    base as Chain,
    baseGoerli as Chain,
    baseSepolia as Chain,
    ...(customEvmNetworks.map(getOrMapViemChain) as Chain[]),
  ],
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(getAlchemyHttpUrl(chain.id)),
      ...(chain.id !== (foundry as Chain).id
        ? {
          pollingInterval: scaffoldConfig.pollingInterval,
        }
        : {}),
    });
  },
});
