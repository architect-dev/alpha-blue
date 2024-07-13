import { getOrders } from "src/core/db/repositories/order-repository";
import { toGetOrdersHttpResponse } from "src/core/mappers/get-orders-http-response-mapper";

export async function getHttpOrders(req: any) {
    console.log("Getting Orders ");

    const orders = await getOrders({});

    const ordersResponse = orders.map((order) => {
        toGetOrdersHttpResponse(order);
    });

    return ordersResponse;
}
