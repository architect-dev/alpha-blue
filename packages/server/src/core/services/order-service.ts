import {
    fetchFillHistory,
    insertNewFill,
} from "src/core/db/repositories/fill-history-repository";
import {
    fetchOrder,
    insertNewOrder,
} from "src/core/db/repositories/order-repository";
import {
    OrderCreatedEvent,
    OrderFilledEvent,
} from "src/core/models/chain-event-models";
import {
    getFillFromContract,
    getOfferFromContract,
} from "src/core/services/contract-service";

export async function createOrder(event: OrderCreatedEvent) {
    console.log("Creating order", JSON.stringify(event));
    const possibleNewOrder = await getOfferFromContract(
        event.blockchain,
        event.orderId
    );

    const existingOrder = await fetchOrder({
        orderId: possibleNewOrder?.orderId,
        networkId: possibleNewOrder?.blockchainNetwork.id,
    });

    if (!existingOrder && possibleNewOrder)
        await insertNewOrder(possibleNewOrder);
}

export async function fillOrder(event: OrderFilledEvent) {
    console.log("Filling order", JSON.stringify(event));
    const possibleNewFill = await getFillFromContract(
        event.blockchain,
        event.fillId
    );

    const existingFill = await fetchFillHistory({
        fillId: possibleNewFill?.fillId,
    });

    if (!existingFill && possibleNewFill) await insertNewFill(possibleNewFill);
}
