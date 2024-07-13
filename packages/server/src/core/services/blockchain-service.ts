import { EventLog } from "ethers";
import {
    BaseEventModel,
    EventModel,
    OrderCreatedEvent,
    OrderFilledEvent,
} from "src/core/models/chain-event-models";
import { BlockchainNetwork } from "src/core/models/domain-models";
import { ContractWrapper } from "src/core/services/contract-service";
import { createOrder, fillOrder } from "src/core/services/order-service";

const OfferCreated_EVENT_NAME = "OfferCreated";
const OfferFilled_EVENT_NAME = "OfferFilled";
const FillDeadlined_EVENT_NAME = "FillDeadlined";
const FillFailed_EVENT_NAME = "FillFailed";
const FillXFilled_EVENT_NAME = "FillXFilled";
const OfferCancelled_EVENT_NAME = "OfferCancelled";
const OfferDeadlined_EVENT_NAME = "OfferDeadlined";

const eventNames = [
    OfferCreated_EVENT_NAME,
    OfferFilled_EVENT_NAME,
    FillDeadlined_EVENT_NAME,
    FillFailed_EVENT_NAME,
    FillXFilled_EVENT_NAME,
    OfferCancelled_EVENT_NAME,
    OfferDeadlined_EVENT_NAME,
];

export const eventToModelType: Record<string, typeof BaseEventModel> = {};

eventToModelType[OfferCreated_EVENT_NAME] = OrderCreatedEvent;

export type TransactionResponse = {
    blockNumber: number;
    from: string;
    success: boolean;
    to: string;
};

export type CurrentBlockResponse = {
    result: string;
    id: number;
};

export type ContractLogResponse = {
    message: "string";
    result: EventLog[];
    status: number;
};

export async function getBlockchainTransactionById(
    txId: string,
    blockchainNetwork: BlockchainNetwork
) {
    console.log("Getting transaction by id", txId, blockchainNetwork);

    const callUrl = `${blockchainNetwork.rpcUrl}?module=transaction&action=gettxinfo&txhash=${txId}`;

    const fetchTx = await fetch(callUrl);

    const transactionResponse: TransactionResponse =
        (await fetchTx.json()) as TransactionResponse;

    return transactionResponse;
}

export async function getLastBlockHex(blockchain: BlockchainNetwork) {
    console.log("Getting last block", blockchain);

    const callUrl = `${blockchain.rpcUrl}?module=block&action=getblockinfo`;

    const fetchBlock = await fetch(callUrl);

    const json: CurrentBlockResponse =
        (await fetchBlock.json()) as CurrentBlockResponse;

    const hexBlockNumber: string = json.result;

    return hexBlockNumber;
}

export async function getTopicAddress(blockchain: BlockchainNetwork) {
    console.log("Getting topic addresses", blockchain);

    const contract = new ContractWrapper(blockchain.id, blockchain.rpcUrl);
    const eventTopics: Array<string> = [];
    const eventTopicNameToTopic: Record<string, string> = {};

    for (const eventName of eventNames) {
        const filterFn = contract.contract.filters[eventName];
        if (!filterFn) {
            throw new Error(`Contract is missing ${eventName} event in ABI`);
        }
        const topics = await filterFn().getTopicFilter();
        console.log("🚀 ~ topics:", topics);

        if (topics && topics[0]) {
            let topicAddress: string;

            if (Array.isArray(topics[0])) topicAddress = topics[0].join();
            else topicAddress = topics[0];

            eventTopics.push(topicAddress);
            eventTopicNameToTopic[eventName] = topicAddress;
        }
    }

    const uniqueTopics = [...new Set(eventTopics)];

    return { eventTopics: uniqueTopics, eventTopicNameToTopic };
}

export async function getEventLogs(
    blockchain: BlockchainNetwork,
    contractAddress: string,
    endBlock: number,
    topicAddresses: string[]
) {
    console.log("Getting last block", blockchain);

    const topicList = topicAddresses
        .map((topic, index) => `topic${index}=${topic}`)
        .join("&");

    const callUrl = `${blockchain.rpcUrl}?module=logs&action=getlogs&fromBlock=${blockchain.lastReadEventsBlock}&toBlock=${endBlock}&address=${contractAddress}&${topicList}`;

    const fetchLogs = await fetch(callUrl);

    const json: ContractLogResponse =
        (await fetchLogs.json()) as ContractLogResponse;

    const eventLogs: EventLog[] = json.result;

    return eventLogs;
}

export async function processEventModel(eventModel: BaseEventModel) {
    console.log("Processing event model", JSON.stringify(eventModel));

    switch (eventModel.contractEventName) {
        case "OfferCreated": {
            const event: OrderCreatedEvent = eventModel as OrderCreatedEvent;
            await createOrder(event);

            break;
        }

        case "OfferFilled": {
            const event: OrderFilledEvent = eventModel as OrderFilledEvent;
            await fillOrder(event);

            break;
        }

        default:
            break;
    }
}

export async function readChainEvents(
    blockchain: BlockchainNetwork,
    contractAddress: string
) {
    console.log("Reading chain events", blockchain);

    const lastBlockHex = await getLastBlockHex(blockchain);
    const lastBlock = parseInt(lastBlockHex, 16);

    const { eventTopics, eventTopicNameToTopic } = await getTopicAddress(
        blockchain
    );

    const eventLogs = await getEventLogs(
        blockchain,
        contractAddress,
        lastBlock,
        eventTopics
    );
    const contract = new ContractWrapper(blockchain.id, blockchain.rpcUrl);

    const eventModels: BaseEventModel[] = [];

    for (const eventLog of eventLogs) {
        const eventTopic = eventLog.topics[0];
        const eventName = eventTopicNameToTopic[eventTopic];

        if (
            contract.parseEventLogs(eventLog, blockchain.id) &&
            contract.parseEventLogs(eventLog, blockchain.id)?.args
        ) {
            const EventModelType = eventToModelType[eventName];

            if (!EventModelType) {
                throw new Error(
                    `Model type is not configured for event by name ${eventName}`
                );
            }

            const notificationEvent: EventModel = {
                address: eventLog.address,
                blockNumber: eventLog.blockNumber,
                parsedArgs: contract.parseEventLogs(eventLog, blockchain.id)
                    ?.args,
                eventName,
            };

            const eventModel = new EventModelType(
                notificationEvent,
                blockchain
            );

            await processEventModel(eventModel);
        }
    }

    return {
        eventModels,
    };
}
