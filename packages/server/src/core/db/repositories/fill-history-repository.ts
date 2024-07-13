import { Knex } from "knex";
import { DatabaseManager } from "src/core/db/db-manager";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import {
    fillHistoryDbModelToFillHistory,
    newFillHistoryToFillHistoryDbModel,
} from "src/core/mappers/order-fill-mappers";
import {
    BlockchainNetworkDbModel,
    FillHistoryDbModel,
} from "src/core/models/db-models";
import {
    FillHistory,
    FillStatus,
    NewFillHistory,
} from "src/core/models/domain-models";

const fillHistoryTable = "fill_history";

const withPkId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        pkId?: number;
    }
) => {
    if (options.pkId) {
        void queryBuilder.where(`${fillHistoryTable}.pk_id`, options.pkId);
    }
};

const withFillId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        fillId?: string;
    }
) => {
    if (options.fillId) {
        void queryBuilder.where(`${fillHistoryTable}.fill_id`, options.fillId);
    }
};

const withOrderPkId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        orderPkId?: number;
    }
) => {
    if (options.orderPkId) {
        void queryBuilder.where(
            `${fillHistoryTable}.order_pk_id`,
            options.orderPkId
        );
    }
};

export async function getFillHistories(options: {
    orderPkId?: number;
    pkId?: number;
    fillId?: string;
}): Promise<FillHistory[]> {
    const databaseConnection = DatabaseManager.getInstance();
    const { orderPkId, fillId, pkId } = options;

    const dbFillHistories = await databaseConnection
        .select<FillHistoryDbModel[]>()
        .from(fillHistoryTable)
        .modify(withPkId, {
            pkId,
        })
        .modify(withFillId, {
            fillId,
        })
        .modify(withOrderPkId, {
            orderPkId,
        });

    const fillHistories: FillHistory[] = [];

    for (const dbFillHistory of dbFillHistories) {
        const blockchainNetwork = await getBlockchainNetwork({
            networkId: dbFillHistory.network_id,
        });
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

export async function getFillHistory(options: {
    orderPkId?: number;
    pkId?: number;
    fillId?: string;
}): Promise<FillHistory> {
    const fills = await getFillHistories(options);

    if (fills.length != 1) {
        throw new Error(`Fills has length ${fills.length}. Expected 1`);
    }

    return fills[0];
}

export async function fetchFillHistory(options: {
    orderPkId?: number;
    pkId?: number;
    fillId?: string;
}): Promise<FillHistory | undefined> {
    const fills = await getFillHistories(options);

    if (fills.length == 0) return undefined;
    else return fills[0];
}

export async function insertNewFill(
    newFill: NewFillHistory
): Promise<FillHistory> {
    const knex = DatabaseManager.getInstance();

    const fillDbAttributes = newFillHistoryToFillHistoryDbModel(newFill);

    const insertedPkId = await knex
        .insert(fillDbAttributes)
        .into(fillHistoryTable);

    return await getFillHistory({ pkId: insertedPkId[0] });
}

export async function updateFillHistory(
    fillId: string,
    status: FillStatus
): Promise<FillHistory> {
    const databaseConnection = DatabaseManager.getInstance();

    await databaseConnection
        .select<BlockchainNetworkDbModel>()
        .from(fillHistoryTable)
        .where("fill_Id", fillId)
        .update({
            fill_status: status,
        });

    return await getFillHistory({ fillId });
}
