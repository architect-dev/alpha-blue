import { DatabaseManager } from "src/core/db/db-manager";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import { fillHistoryDbModelToFillHistory } from "src/core/mappers/order-fill-mappers";
import { FillHistoryDbModel } from "src/core/models/db-models";
import { FillHistory } from "src/core/models/domain-models";

const fillHistoryTable = "fill_history";

export async function getFillHistory(
    orderPkId: number
): Promise<FillHistory[]> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbFillHistories = await databaseConnection
        .select<FillHistoryDbModel[]>()
        .from(fillHistoryTable)
        .where("order_pk_id", orderPkId);

    const fillHistories: FillHistory[] = [];

    for (const dbFillHistory of dbFillHistories) {
        const blockchainNetwork = await getBlockchainNetwork(
            dbFillHistory.network_id
        );
        const tokenMetadata = await getTokenMetadata({
            pkId: dbFillHistory.token_pk_id,
        });

        fillHistories.push(
            fillHistoryDbModelToFillHistory(
                dbFillHistory,
                blockchainNetwork,
                tokenMetadata
            )
        );
    }

    return fillHistories;
}
