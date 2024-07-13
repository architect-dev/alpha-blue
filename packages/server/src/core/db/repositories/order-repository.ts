import { Knex } from "knex";
import { DatabaseManager } from "src/core/db/db-manager";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { getFillHistory } from "src/core/db/repositories/fill-history-repository";
import {
    getPotentialFills,
    insertPotentialFill,
} from "src/core/db/repositories/potential-fill-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import {
    newOrderToOrderDbModel,
    orderDbModelToOrder,
} from "src/core/mappers/order-mappers";
import { OrderDbModel } from "src/core/models/db-models";
import { NewOrder, Order } from "src/core/models/domain-models";

const orderTable = "order";

const withNetworkId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        networkId?: number;
    }
) => {
    if (options.networkId) {
        void queryBuilder.where(`${orderTable}.network_id`, options.networkId);
    }
};

const withPkId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        pkId?: number;
    }
) => {
    if (options.pkId) {
        void queryBuilder.where(`${orderTable}.pk_id`, options.pkId);
    }
};

const withId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        orderId?: string;
    }
) => {
    if (options.orderId) {
        void queryBuilder.where(`${orderTable}.order_id`, options.orderId);
    }
};

export async function getOrders(options: {
    pkId?: number;
    orderId?: string;
    networkId?: number;
}): Promise<Order[]> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbOrders = await databaseConnection
        .select<OrderDbModel[]>()
        .from(orderTable)
        .modify(withPkId, {
            pkId: options?.pkId,
        })
        .modify(withId, {
            orderId: options?.orderId,
        })
        .modify(withNetworkId, {
            networkId: options?.networkId,
        });

    const orders: Order[] = [];

    for (const dbOrder of dbOrders) {
        const blockchainNetwork = await getBlockchainNetwork(
            dbOrder.network_id
        );
        const tokenMetadata = await getTokenMetadata({
            pkId: dbOrder.token_pk_id,
        });
        const potentialFills = await getPotentialFills({
            pkId: options?.pkId,
        });
        const orderFills = await getFillHistory(options?.pkId || 0);

        orders.push(
            orderDbModelToOrder(
                dbOrder,
                blockchainNetwork,
                tokenMetadata,
                potentialFills,
                orderFills
            )
        );
    }

    return orders;
}

export async function getOrder(options: {
    pkId?: number;
    orderId?: string;
    networkId?: number;
}): Promise<Order> {
    const newOrders = await getOrders(options);

    if (newOrders.length != 1)
        throw new Error(
            `Expected 1 order to be returned, but got ${newOrders.length}`
        );
    else return newOrders[0];
}

export async function fetchOrder(options: {
    orderId?: string;
    networkId?: number;
}): Promise<Order | undefined> {
    const orders = await getOrders(options);

    return orders[0] || undefined;
}

export async function insertNewOrder(newOrder: NewOrder): Promise<Order> {
    const knex = DatabaseManager.getInstance();

    const orderDbAttributes = newOrderToOrderDbModel(newOrder);

    const insertedPkId = await knex.insert(orderDbAttributes).into(orderTable);

    newOrder.newPotentialFills.map(async (newPotentialFill) => {
        await insertPotentialFill(newPotentialFill, insertedPkId[0]);
    });

    return await getOrder({ pkId: insertedPkId[0] });
}
