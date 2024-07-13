import { Knex } from "knex";
import { DatabaseManager } from "src/core/db/db-manager";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import {
    newPotentialFillToPotentialFillDbModel,
    potentialFillDbModelToPotentialFill,
} from "src/core/mappers/order-fill-mappers";
import { PotentialFillDbModel } from "src/core/models/db-models";
import { NewPotentialFill, PotentialFill } from "src/core/models/domain-models";

const potentialFillTable = "potential_fill";

const withPkId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        pkId?: number;
    }
) => {
    if (options.pkId) {
        void queryBuilder.where(`${potentialFillTable}.pk_id`, options.pkId);
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
            `${potentialFillTable}.order_pk_id`,
            options.orderPkId
        );
    }
};

export async function getPotentialFills(options: {
    orderPkId?: number;
    pkId?: number;
}): Promise<PotentialFill[]> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbPotentialFills = await databaseConnection
        .select<PotentialFillDbModel[]>()
        .from(potentialFillTable)
        .modify(withPkId, {
            pkId: options?.pkId,
        })
        .modify(withOrderPkId, {
            pkId: options?.orderPkId,
        });

    const potentialFills: PotentialFill[] = [];

    for (const dbPotentialFill of dbPotentialFills) {
        const blockchainNetwork = await getBlockchainNetwork(
            dbPotentialFill.network_id
        );
        const tokenMetadata = await getTokenMetadata({
            pkId: dbPotentialFill.token_pk_id,
        });

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

export async function getPotentialFill(pkId: number): Promise<PotentialFill> {
    return (await getPotentialFills({ pkId }))[0];
}

export async function insertPotentialFill(
    newPotentialFill: NewPotentialFill,
    orderPkId: number
): Promise<PotentialFill | undefined> {
    const knex = DatabaseManager.getInstance();

    const dbAttributes = newPotentialFillToPotentialFillDbModel(
        newPotentialFill,
        orderPkId
    );

    const insertedPkId = await knex
        .insert(dbAttributes)
        .into(potentialFillTable);

    return await getPotentialFill(insertedPkId[0]);
}
