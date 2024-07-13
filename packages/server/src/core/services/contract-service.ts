import {
    Contract,
    EventLog,
    Interface,
    JsonRpcProvider,
    LogDescription,
} from "ethers";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import {
    BlockchainNetwork,
    NewOrder,
    OrderStatus,
} from "src/core/models/domain-models";
import { currentSeconds } from "src/core/utils/dates";
import { generateWalletAddress } from "src/core/utils/wallet-generator";
import AlphaBlue from "../../../../nextjs/contracts/AlphaBlue.json";

export class ContractWrapper {
    contract: Contract;

    constructor(address: string, rpcUrl: string) {
        const provider = new JsonRpcProvider(`${rpcUrl}`);
        this.contract = new Contract(address, AlphaBlue, provider);
    }

    public parseEventLogs(event: EventLog): LogDescription | null {
        const iface = new Interface(AlphaBlue);
        return iface.parseLog({
            topics: event.topics as string[],
            data: event.data,
        });
    }
}

export async function getOfferFromContract(
    sourceBlockchainNetwork: BlockchainNetwork,
    orderId: string
): Promise<NewOrder | undefined> {
    const sourceTokenMetadata = await getTokenMetadata({
        networkId: sourceBlockchainNetwork.id,
        tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    });

    const destinationBlockchainNetwork = await getBlockchainNetwork(421614);
    const fillTokenMetaData = await getTokenMetadata({
        networkId: 421614,
        tokenAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    });

    const walletAddress = generateWalletAddress();

    const newOrder: NewOrder = {
        orderId,
        newPotentialFills: [
            {
                destinationWalletAddress: walletAddress,
                blockchainNetwork: destinationBlockchainNetwork,
                tokenMetadata: fillTokenMetaData,
                tokenAmount: "1000000",
                active: true,
            },
        ],
        orderWalletAddress: generateWalletAddress(),
        allowPartialFill: true,
        orderStatus: OrderStatus.Active,
        orderDate: currentSeconds(),
        blockchainNetwork: sourceBlockchainNetwork,
        tokenMetadata: sourceTokenMetadata,
        tokenAmount: "1000000",
        expirationDate: currentSeconds() + 7 * 86400,
        transactionId: generateWalletAddress(),
    };

    return newOrder;
}
