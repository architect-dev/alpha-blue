import { DatabaseManager } from "src/core/db/db-manager";
import { blockchainNetworkDbModelToBlockchainNetwork } from "src/core/mappers/blockchain-token-mappers";
import { BlockchainNetworkDbModel } from "src/core/models/db-models";
import { BlockchainNetwork } from "src/core/models/domain-models";

const blockchainNetworkTable = "blockchain_network";

export async function getBlockchainNetwork(
    networkId: number
): Promise<BlockchainNetwork> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbBlockchains = await databaseConnection
        .select<BlockchainNetworkDbModel[]>()
        .from(blockchainNetworkTable)
        .where("id", networkId);

    let dbBlockchain: BlockchainNetworkDbModel;

    if (dbBlockchains && dbBlockchains.length == 1)
        dbBlockchain = dbBlockchains[0];
    else throw new Error("Blockchain network not found");

    return blockchainNetworkDbModelToBlockchainNetwork(dbBlockchain);
}
