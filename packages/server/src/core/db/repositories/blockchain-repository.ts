import { Knex } from "knex";
import { DatabaseManager } from "src/core/db/db-manager";
import { blockchainNetworkDbModelToBlockchainNetwork } from "src/core/mappers/blockchain-token-mappers";
import { BlockchainNetworkDbModel } from "src/core/models/db-models";
import { BlockchainNetwork } from "src/core/models/domain-models";

const blockchainNetworkTable = "blockchain_network";

const withId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        id?: number;
    }
) => {
    if (options.id) {
        void queryBuilder.where(`${blockchainNetworkTable}.id`, options.id);
    }
};
export async function getBlockchainNetworks(options: {
    networkId?: number;
}): Promise<BlockchainNetwork[]> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbBlockchains = await databaseConnection
        .select<BlockchainNetworkDbModel[]>()
        .from(blockchainNetworkTable)
        .modify(withId, {
            id: options?.networkId,
        });

    const dbBlockchain: BlockchainNetwork[] = [];

    for (const chain of dbBlockchains) {
        dbBlockchain.push(blockchainNetworkDbModelToBlockchainNetwork(chain));
    }

    return dbBlockchain;
}

export async function getBlockchainNetwork(options: {
    networkId?: number;
}): Promise<BlockchainNetwork> {
    const chains = await getBlockchainNetworks(options);

    if (chains.length !== 1) {
        throw new Error(`Expected 1 blockchain network, got ${chains.length}`);
    }

    return chains[0];
}

export async function updateBlockchainLastReadEventBlock(
    networkId: number,
    block: number
): Promise<BlockchainNetwork> {
    const databaseConnection = DatabaseManager.getInstance();

    await databaseConnection
        .select<BlockchainNetworkDbModel>()
        .from("blockchain_network")
        .where("id", networkId)
        .update({
            last_read_events_block: block,
        });

    return await getBlockchainNetwork({ networkId });
}
