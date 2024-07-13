import {
    fetchFillHistory,
    insertNewFill,
    updateFillHistory,
} from "src/core/db/repositories/fill-history-repository";
import {
    fetchOrder,
    insertNewOrder,
    updateOrderStatus,
} from "src/core/db/repositories/order-repository";
import { cancelPotentialFills } from "src/core/db/repositories/potential-fill-repository";
import {
    FillDeadlinedEvent,
    FillFailedEvent,
    FillXFilledEvent,
    OfferCancelledEvent,
    OfferDeadlinedEvent,
    OrderCreatedEvent,
    OrderFilledEvent,
} from "src/core/models/chain-event-models";
import { FillStatus, OrderStatus } from "src/core/models/domain-models";
import {
    getFillFromContract,
    getOfferFromContract,
} from "src/core/services/contract-service";
import { formatContractId } from "src/core/utils/format-tools";

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

export async function updateOffer(
    event: OfferCancelledEvent | OfferDeadlinedEvent
) {
    const offerStatus =
        event.contractEventName === "OfferCancelled"
            ? OrderStatus.Canceled
            : OrderStatus.Expired;

    const formattedOrderId = formatContractId(
        event.blockchain.name,
        "order",
        event.orderId
    );
    const order = await updateOrderStatus(formattedOrderId, offerStatus);

    await cancelPotentialFills(order.pkId);
}
