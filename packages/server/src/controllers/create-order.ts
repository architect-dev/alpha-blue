export async function createOrder(req: any) {
    console.log("Creating order", req.body);

    return Promise.resolve({
        status: "success",
        message: "Order created successfully",
    });
}
