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
    FillStatus,
    NewFillHistory,
    NewOrder,
    NewPotentialFill,
} from "src/core/models/domain-models";
import { currentSeconds } from "src/core/utils/dates";
import { formatContractId } from "src/core/utils/format-tools";

export class ContractWrapper {
    contract: Contract;

    constructor(networkId: number, rpcUrl: string) {
        const provider = new JsonRpcProvider(rpcUrl);

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
        sourceBlockchain.contractRpcUrl
    );

    const rawContractOffer = await contract.contract.getOffer(orderId);

    const contractOffer: ContractOffer = {
        owner: rawContractOffer[0],
        tokenAddress: rawContractOffer[1],
        tokenAmount: rawContractOffer[2],
        nftAddress: rawContractOffer[3],
        nftId: rawContractOffer[4],
        allowPartialFills: rawContractOffer[5],
        expiration: rawContractOffer[7],
        fillOptions: rawContractOffer[8],
        filledBP: rawContractOffer[11],
        pendingBP: rawContractOffer[10],
        status: rawContractOffer[13],
        offerFills: rawContractOffer[14],
    };

    const formattedOrderId = formatContractId(
        sourceBlockchain.name,
        "order",
        orderId
    );

    const sourceTokenMetadata = await getTokenMetadata({
        networkId: sourceBlockchain.id,
        tokenAddress: contractOffer.tokenAddress,
    });

    const potentialFills: NewPotentialFill[] = [];

    for (const fillOption of contractOffer.fillOptions) {
        const destinationBlockchainNetwork = await getBlockchainNetwork({
            networkId: fillOption.chainId,
        });
        const fillTokenMetaData = await getTokenMetadata({
            networkId: fillOption.chainId,
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
        orderStatus: Number(contractOffer.status) + 1,
        orderDate: currentSeconds(),
        blockchainNetwork: sourceBlockchain,
        tokenMetadata: sourceTokenMetadata,
        tokenAmount: contractOffer.tokenAmount?.toString() || "-",
        expirationDate: contractOffer.expiration,
        filledBasisPoints: contractOffer.filledBP,
        pendingBasisPoints: contractOffer.pendingBP,
    };

    return newOrder;
}

export async function getFillFromContract(
    fillBlockchain: BlockchainNetwork,
    fillId: number
): Promise<NewFillHistory> {
    const contract = new ContractWrapper(
        fillBlockchain.id,
        fillBlockchain.contractRpcUrl
    );
    const rawContractFill = await contract.contract.getFill(fillId);
    const contractFill: ContractFill = {
        owner: rawContractFill[0],
        offerChain: rawContractFill[1],
        offerId: rawContractFill[2],
        fillTokenAddress: rawContractFill[3],
        fillTokenAmount: rawContractFill[4],
        deadline: rawContractFill[5],
        status: rawContractFill[8],
    };

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
        fillStatus: FillStatus.Pending,
        expirationDate: contractFill.deadline,
    };

    return newOrder;
}
