import { EventLog } from "ethers";
import { BlockchainNetwork } from "src/core/models/domain-models";
import { ContractWrapper } from "src/core/services/contract-service";

export const ORDER_CREATED_EVENT_NAME = "OrderCreated";
export const ORDER_FILLED_EVENT_NAME = "OrderFilled";

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

export async function getEventLogs(
    blockchain: BlockchainNetwork,
    contractAddress: string,
    endBlock: number,
    topicAddress: string
) {
    console.log("Getting last block", blockchain);

    const callUrl = `${blockchain.rpcUrl}?module=logs&action=getlogs&fromBlock=${blockchain.lastReadEventsBlock}&toBlock=${endBlock}&address=${contractAddress}&topic0=${topicAddress}`;

    const fetchLogs = await fetch(callUrl);

    const json: ContractLogResponse =
        (await fetchLogs.json()) as ContractLogResponse;

    const eventLogs: EventLog[] = json.result;

    return eventLogs;
}

export async function readChainEvents(
    blockchain: BlockchainNetwork,
    contractAddress: string
) {
    console.log("Reading chain events", blockchain);

    const lastBlockHex = await getLastBlockHex(blockchain);
    const lastBlock = parseInt(lastBlockHex, 16);

    const eventLogs = await getEventLogs(
        blockchain,
        contractAddress,
        lastBlock,
        ORDER_CREATED_EVENT_NAME
    );
    const contract = new ContractWrapper(contractAddress, contractAddress);

    const parsedLogs = eventLogs.map(
        (eventLog) => contract.parseEventLogs(eventLog)?.args
    );

    console.log(parsedLogs);
}
