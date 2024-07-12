import { DatabaseManager } from "src/core/db/db-manager";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import { potentialFillDbModelToPotentialFill } from "src/core/mappers/order-fill-mappers";
import { PotentialFillDbModel } from "src/core/models/db-models";
import { PotentialFill } from "src/core/models/domain-models";

const potentialFillTable = "potential_fill";

export async function getPotentialFills(
    orderPkId: number
): Promise<PotentialFill[]> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbPotentialFills = await databaseConnection
        .select<PotentialFillDbModel[]>()
        .from(potentialFillTable)
        .where("order_pk_id", orderPkId);

    const potentialFills: PotentialFill[] = [];

    for (const dbPotentialFill of dbPotentialFills) {
        const blockchainNetwork = await getBlockchainNetwork(
            dbPotentialFill.network_id
        );
        const tokenMetadata = await getTokenMetadata(
            dbPotentialFill.token_pk_id
        );

        potentialFills.push(
            potentialFillDbModelToPotentialFill(
                dbPotentialFill,
                blockchainNetwork,
                tokenMetadata
            )
        );
    }

    return potentialFills;
}
