import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import {
    getBlockchainTransactionById,
    readChainEvents,
} from "src/core/services/blockchain-service";

export async function createOrder(req: any) {
    console.log("Creating order", req.body);
    const txId: string = req.body?.txId || "";
    const networkId: number = req.body?.networkId || 0;
    const blockchainNetwork = await getBlockchainNetwork(networkId);

    const chainTransactionDetails = await getBlockchainTransactionById(
        txId,
        blockchainNetwork
    );

    await readChainEvents(blockchainNetwork, chainTransactionDetails.to);

    return Promise.resolve({
        status: "success",
        message: "Order created successfully",
    });
}
