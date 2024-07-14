import { getOrders } from "src/core/db/repositories/order-repository";
import { toGetOrdersHttpResponse } from "src/core/mappers/get-orders-http-response-mapper";

export async function getHttpOrders(req: any) {
    console.log("Getting Orders ", JSON.stringify(req));
    const possibleOrderId = req?.pathParameters?.orderId;

    const orders = await getOrders({ orderId: possibleOrderId });

    const ordersResponse = orders.map((order) => {
        return toGetOrdersHttpResponse(order);
    });

    if (possibleOrderId) return ordersResponse[0];
    else return ordersResponse;
}
