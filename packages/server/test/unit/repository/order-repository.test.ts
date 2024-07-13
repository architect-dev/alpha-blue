import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import {
    getOrder,
    insertNewOrder,
} from "src/core/db/repositories/order-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import {
    BlockchainNetwork,
    NewOrder,
    TokenMetadata,
} from "src/core/models/domain-models";

let baseBlockchainNetwork: BlockchainNetwork;
let usdcBaseTokenMetadata: TokenMetadata;

describe("Order Repository", () => {
    beforeAll(async () => {
        baseBlockchainNetwork = await getBlockchainNetwork(84532);
        usdcBaseTokenMetadata = await getTokenMetadata({
            symbol: "USDC",
            networkId: 84532,
        });
    });

    test("should get order by pkId", async () => {
        const newOrder: NewOrder = {
            orderId: "123-2",
            orderWalletAddress: "0x123",
            allowPartialFill: false,
            orderStatus: 1,
            orderDate: 123,
            blockchainNetwork: baseBlockchainNetwork,
            tokenMetadata: usdcBaseTokenMetadata,
            tokenAmount: "123",
            expirationDate: 123,
            newPotentialFills: [],
        };
        const generatedOrder = await insertNewOrder(newOrder);
        const order = await getOrder({ pkId: generatedOrder?.pkId });

        expect(order?.orderId).toBe(newOrder.orderId);
    });
});
