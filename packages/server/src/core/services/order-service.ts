import {
    fetchFillHistory,
    insertNewFill,
    updateFillHistory,
} from "src/core/db/repositories/fill-history-repository";
import {
    fetchOrder,
    insertNewOrder,
} from "src/core/db/repositories/order-repository";
import {
    FillDeadlinedEvent,
    FillFailedEvent,
    FillXFilledEvent,
    OrderCreatedEvent,
    OrderFilledEvent,
} from "src/core/models/chain-event-models";
import { FillStatus } from "src/core/models/domain-models";
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

export async function updateFillStatus(
    event: FillDeadlinedEvent | FillFailedEvent | FillXFilledEvent
) {
    let newStatus: FillStatus | undefined;

    switch (event.contractEventName) {
        case "FillDeadlined":
            newStatus = FillStatus.Expired;
            break;

        case "FillFailed":
            newStatus = FillStatus.FillFailed;
            break;

        case "FillXFilledEvent":
            newStatus = FillStatus.XFillFailed;
            break;

        default:
            break;
    }

    if (newStatus) await updateFillHistory(event.fillId, newStatus);
}
