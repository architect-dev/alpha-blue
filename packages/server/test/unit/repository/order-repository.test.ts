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
import { currentSeconds } from "src/core/utils/dates";
import { formatContractId } from "src/core/utils/format-tools";
import { randomNumber } from "src/core/utils/random-number";
import { generateWalletAddress } from "src/core/utils/wallet-generator";

let baseBlockchainNetwork: BlockchainNetwork;
let usdcBaseTokenMetadata: TokenMetadata;
let bnbBaseTokenMetadata: TokenMetadata;
let wbtcBaseTokenMetadata: TokenMetadata;

describe("Order Repository", () => {
    test("should get order by pkId", async () => {
        baseBlockchainNetwork = await getBlockchainNetwork({
            networkId: 84532,
        });
        usdcBaseTokenMetadata = await getTokenMetadata({
            symbol: "USDC",
            networkId: 84532,
        });

        bnbBaseTokenMetadata = await getTokenMetadata({
            symbol: "BNB",
            networkId: 84532,
        });

        wbtcBaseTokenMetadata = await getTokenMetadata({
            symbol: "WBTC",
            networkId: 84532,
        });

        const walletAddress = generateWalletAddress();
        const orderNumber = randomNumber();
        const newOrder: NewOrder = {
            orderId: formatContractId(
                baseBlockchainNetwork.name,
                "order",
                orderNumber
            ),
            orderWalletAddress: walletAddress,
            allowPartialFill: false,
            orderStatus: 1,
            orderDate: currentSeconds(),
            blockchainNetwork: baseBlockchainNetwork,
            tokenMetadata: usdcBaseTokenMetadata,
            tokenAmount: "10000000",
            expirationDate: currentSeconds() + 100000,
            newPotentialFills: [
                {
                    destinationWalletAddress: walletAddress,
                    blockchainNetwork: baseBlockchainNetwork,
                    tokenMetadata: bnbBaseTokenMetadata,
                    tokenAmount: "300000000",
                    active: true,
                },
                {
                    destinationWalletAddress: walletAddress,
                    blockchainNetwork: baseBlockchainNetwork,
                    tokenMetadata: wbtcBaseTokenMetadata,
                    tokenAmount: "20000000",
                    active: true,
                },
            ],
            pendingBasisPoints: 0,
            filledBasisPoints: 0,
        };
        const generatedOrder = await insertNewOrder(newOrder);
        const order = await getOrder({ pkId: generatedOrder?.pkId });

        expect(order?.orderId).toBe(newOrder.orderId);
    });
});
