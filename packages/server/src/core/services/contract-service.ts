import {
    Contract,
    EventLog,
    Interface,
    JsonRpcProvider,
    LogDescription,
} from "ethers";
import deployedContracts from "src/core/contracts/deployedContracts";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { getOrder } from "src/core/db/repositories/order-repository";
import { getTokenMetadata } from "src/core/db/repositories/token-metadata-repository";
import { ContractFill, ContractOffer } from "src/core/models/contract-models";
import {
    BlockchainNetwork,
    NewFillHistory,
    NewOrder,
    NewPotentialFill,
} from "src/core/models/domain-models";
import { currentSeconds } from "src/core/utils/dates";
import { formatContractId } from "src/core/utils/format-tools";

export class ContractWrapper {
    contract: Contract;

    constructor(networkId: number, rpcUrl: string) {
        const provider = new JsonRpcProvider(`${rpcUrl}`);

        this.contract = new Contract(
            this.getAddressAbi(networkId).address,
            this.getAddressAbi(networkId).abi,
            provider
        );
    }
    public getAddressAbi(networkId: number) {
        const normalizedNetworkId =
            networkId == 31337 ? 31337 : networkId == 84532 ? 84532 : 31337;

        const abi = deployedContracts[normalizedNetworkId].alphaBlue.abi;
        const address =
            deployedContracts[normalizedNetworkId].alphaBlue.address;

        return { abi, address };
    }

    public parseEventLogs(
        event: EventLog,
        networkId: number
    ): LogDescription | null {
        const iface = new Interface(this.getAddressAbi(networkId).abi);
        return iface.parseLog({
            topics: event.topics as string[],
            data: event.data,
        });
    }
}

export async function getOfferFromContract(
    sourceBlockchain: BlockchainNetwork,
    orderId: number
): Promise<NewOrder> {
    const contract = new ContractWrapper(
        sourceBlockchain.id,
        sourceBlockchain.rpcUrl
    );
    const contractOffer: ContractOffer = (
        await contract.contract.getOffer(orderId)
    ).offer;

    const formattedOrderId = formatContractId(
        sourceBlockchain.name,
        "order",
        orderId
    );

    const sourceTokenMetadata = await getTokenMetadata({
        networkId: sourceBlockchain.id,
        tokenAddress: contractOffer.depositTokenAddress,
    });

    const potentialFills: NewPotentialFill[] = [];

    for (const fillOption of contractOffer.fillOptions) {
        const destinationBlockchainNetwork = await getBlockchainNetwork({
            networkId: fillOption.chainId,
        });
        const fillTokenMetaData = await getTokenMetadata({
            networkId: destinationBlockchainNetwork.id,
            tokenAddress: fillOption.tokenAddress,
        });

        const walletAddress = fillOption.destAddress;
        const newOption = {
            destinationWalletAddress: walletAddress,
            blockchainNetwork: destinationBlockchainNetwork,
            tokenMetadata: fillTokenMetaData,
            tokenAmount: fillOption.tokenAmount.toString(),
            active: true,
        };

        potentialFills.push(newOption);
    }

    const newOrder: NewOrder = {
        orderId: formattedOrderId,
        newPotentialFills: potentialFills,
        orderWalletAddress: contractOffer.owner,
        allowPartialFill: contractOffer.allowPartialFills,
        orderStatus: contractOffer.status + 1,
        orderDate: currentSeconds(),
        blockchainNetwork: sourceBlockchain,
        tokenMetadata: sourceTokenMetadata,
        tokenAmount: contractOffer.tokenAmount?.toString() || "-",
        expirationDate: contractOffer.expiration,
    };

    return newOrder;
}

export async function getFillFromContract(
    fillBlockchain: BlockchainNetwork,
    fillId: number
): Promise<NewFillHistory> {
    const contract = new ContractWrapper(
        fillBlockchain.id,
        fillBlockchain.rpcUrl
    );
    const contractFill: ContractFill = (await contract.contract.getFill(fillId))
        .fill as ContractFill;

    const fillTokenMetadata = await getTokenMetadata({
        networkId: fillBlockchain.id,
        tokenAddress: contractFill.fillTokenAddress,
    });

    const formattedOrderId = formatContractId(
        fillBlockchain.name,
        "fill",
        contractFill.offerId
    );

    const order = await getOrder({ orderId: formattedOrderId });
    const formatFillId = formatContractId(fillBlockchain.name, "fill", fillId);

    const newOrder: NewFillHistory = {
        orderPkId: order.pkId,
        fillId: formatFillId,
        fillWalletAddress: contractFill.owner,
        blockchainNetwork: fillBlockchain,
        tokenMetadata: fillTokenMetadata,
        tokenAmount: contractFill.fillTokenAmount.toString(),
        fillStatus: contractFill.status + 1,
        expirationDate: contractFill.deadline,
    };

    return newOrder;
}
