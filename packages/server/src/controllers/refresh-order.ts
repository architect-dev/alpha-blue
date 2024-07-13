import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { getOrders } from "src/core/db/repositories/order-repository";
import { toGetOrdersHttpResponse } from "src/core/mappers/get-orders-http-response-mapper";
import {
    readChainEvents,
    readChainEvents,
} from "src/core/services/blockchain-service";

export async function refreshOrder(req: any) {
    console.log("Refreshing order with ", req.body);
    const networkId: number = req.body?.networkId || 0;
    const blockchainNetwork = await getBlockchainNetwork({ networkId });

    await readChainEvents(blockchainNetwork);

    const orders = await getOrders({});

    const ordersResponse = orders.map((order) => {
        return toGetOrdersHttpResponse(order);
    });

    return ordersResponse;
}
