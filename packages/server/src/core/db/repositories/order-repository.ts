import { Knex } from "knex";
import { DatabaseManager } from "src/core/db/db-manager";
import { getFillHistories } from "src/core/db/repositories/fill-history-repository";
import {
    getPotentialFills,
    insertPotentialFill,
} from "src/core/db/repositories/potential-fill-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import {
    newOrderToOrderDbModel,
    orderDbModelToOrder,
} from "src/core/mappers/order-mappers";
import {
    BlockchainNetworkDbModel,
    OrderDbModel,
} from "src/core/models/db-models";
import { NewOrder, Order, OrderStatus } from "src/core/models/domain-models";

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
        const tokenMetadata = await getTokenMetadata({
            pkId: dbOrder.token_pk_id,
        });

        const potentialFills = await getPotentialFills({
            orderPkId: dbOrder.pk_id,
        });
        const orderFills = await getFillHistories({ orderPkId: dbOrder.pk_id });

        orders.push(
            orderDbModelToOrder(
                dbOrder,
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

export async function updateOrderStatus(
    orderId: string,
    orderStatus: OrderStatus
): Promise<Order> {
    const databaseConnection = DatabaseManager.getInstance();

    await databaseConnection
        .select<BlockchainNetworkDbModel>()
        .from(orderTable)
        .where("order_id", orderId)
        .update({
            order_status: orderStatus,
        });

    return await getOrder({ orderId });
}

export async function updateOrderBasisPoints(
    orderPkId: number,
    basisPoints: {
        pendingBasisPoints: number;
        remainingBasisPoints: number;
    }
): Promise<Order> {
    const databaseConnection = DatabaseManager.getInstance();

    await databaseConnection
        .select<BlockchainNetworkDbModel>()
        .from(orderTable)
        .where("pk_id", orderPkId)
        .update({
            pending_basis_points: basisPoints.pendingBasisPoints,
            remaining_basis_points: basisPoints.remainingBasisPoints,
        });

    return await getOrder({ pkId: orderPkId });
}
