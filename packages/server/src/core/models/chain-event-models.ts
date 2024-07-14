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
    orderId: number;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        this.contractEventName = event.eventName ?? "";
        this.contractAddress = event.address;
        this.blockchain = blockchain;
        this.blockNumber = event.blockNumber ?? 0;
        this.orderId = Number(event.parsedArgs?.offerId) ?? 0;
    }
}

export class OrderCreatedEvent extends BaseEventModel {
    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
    }
}

export class FillCreatedEvent extends BaseEventModel {
    fillId: number;
    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.fillId = Number(event.parsedArgs?.fillId) ?? 0;
    }
}

export class OrderFilledEvent extends BaseEventModel {
    fillId: number;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.fillId = Number(event.parsedArgs?.fillId) ?? 0;
    }
}

export class FillDeadlinedEvent extends BaseEventModel {
    fillId: number;
    filler: string;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.fillId = Number(event.parsedArgs?.fillId) ?? 0;
        this.filler = event.parsedArgs?.filler ?? "";
    }
}

export class FillFailedEvent extends BaseEventModel {
    fillId: number;
    filler: string;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.fillId = Number(event.parsedArgs?.fillId) ?? 0;
        this.filler = event.parsedArgs?.filler ?? "";
    }
}

export class FillXFilledEvent extends BaseEventModel {
    fillId: number;
    filler: string;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.fillId = Number(event.parsedArgs?.fillId) ?? 0;
        this.filler = event.parsedArgs?.filler ?? "";
    }
}

export class OfferCancelledEvent extends BaseEventModel {
    creatorWalletAddress: string;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.creatorWalletAddress = event.parsedArgs?.creator ?? "";
    }
}

export class OfferDeadlinedEvent extends BaseEventModel {
    creatorWalletAddress: string;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.creatorWalletAddress = event.parsedArgs?.creator ?? "";
    }
}

export class OfferFilledEvent extends BaseEventModel {
    creatorWalletAddress: string;
    fillId: number;

    constructor(event: EventModel, blockchain: BlockchainNetwork) {
        super(event, blockchain);
        this.creatorWalletAddress = event.parsedArgs?.creator ?? "";
        this.fillId = Number(event.parsedArgs?.fillId) ?? 0;
    }
}
