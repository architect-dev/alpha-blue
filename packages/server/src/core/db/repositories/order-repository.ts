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

export async function getOrder(orderPkId: number): Promise<Order | undefined> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbOrders = await databaseConnection
        .select<OrderDbModel[]>()
        .from(orderTable)
        .where("pk_id", orderPkId);

    let dbOrder: OrderDbModel;

    if (dbOrders && dbOrders.length == 1) dbOrder = dbOrders[0];
    else return undefined;

    const blockchainNetwork = await getBlockchainNetwork(dbOrder.network_id);
    const tokenMetadata = await getTokenMetadata({
        pkId: dbOrder.token_pk_id,
    });
    const potentialFills = await getPotentialFills({ pkId: orderPkId });
    const orderFills = await getFillHistory(orderPkId);

    return orderDbModelToOrder(
        dbOrder,
        blockchainNetwork,
        tokenMetadata,
        potentialFills,
        orderFills
    );
}

export async function insertNewOrder(
    newOrder: NewOrder
): Promise<Order | undefined> {
    const knex = DatabaseManager.getInstance();

    const orderDbAttributes = newOrderToOrderDbModel(newOrder);

    const insertedPkId = await knex.insert(orderDbAttributes).into(orderTable);

    newOrder.newPotentialFills.map(async (newPotentialFill) => {
        await insertPotentialFill(newPotentialFill, insertedPkId[0]);
    });

    return await getOrder(insertedPkId[0]);
}
