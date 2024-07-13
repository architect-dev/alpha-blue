import { Result } from "ethers";
import { BlockchainNetwork } from "src/core/models/domain-models";

export interface EventModel {
    address: string;
    blockNumber: number;
    parsedArgs?: Result;
    eventName: string;
}

export class BaseEventModel {
    contractEventName: string;
    contractAddress: string;
    blockchain: BlockchainNetwork;
    blockNumber: number;
    orderId: string;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        this.contractEventName = event.eventName ?? "";
        this.contractAddress = event.address;
        this.blockchain = blockchain;
        this.blockNumber = event.blockNumber ?? 0;
        this.orderId = event.parsedArgs?.orderId ?? "";
    }
}

export class OrderCreatedEvent extends BaseEventModel {
    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
    }
}

export class OrderFilledEvent extends BaseEventModel {
    fillId: string;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.fillId = event.parsedArgs?.fillId ?? "";
    }
}
