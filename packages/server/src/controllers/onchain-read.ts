import { getBlockchainNetworks } from "src/core/db/repositories/blockchain-repository";
import { readChainEvents } from "src/core/services/blockchain-service";

export async function chainReader(req: any) {
    console.log("Reading from chain");

    const blockchainNetworks = await getBlockchainNetworks({
        networkId: 421614,
    });

    for (const network of blockchainNetworks) {
        await readChainEvents(network);
    }

    return;
}
