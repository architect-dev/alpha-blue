import { getOrMapViemChain } from "@dynamic-labs/viem-utils";
import { Chain, createClient, http } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  foundry,
  mainnet,
  polygon,
  polygonAmoy,
  scroll,
  scrollSepolia,
  sepolia,
} from "viem/chains";
import { createConfig } from "wagmi";
import { customEvmNetworks } from "~~/lib/networks";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

export const wagmiConfig = createConfig({
  chains: [
    arbitrum as Chain,
    arbitrumSepolia as Chain,
    base as Chain,
    baseSepolia as Chain,
    mainnet as Chain,
    polygon as Chain,
    polygonAmoy as Chain,
    scroll as Chain,
    scrollSepolia as Chain,
    sepolia as Chain,
    foundry as Chain,
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
