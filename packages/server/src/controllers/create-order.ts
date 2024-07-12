export function createOrder(req: any) {
    console.log("Creating order", req.body);

    return {
        status: "success",
        message: "Order created successfully",
    };
}
