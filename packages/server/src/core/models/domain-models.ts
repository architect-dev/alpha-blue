export enum OrderStatus {
    "Active" = 1,
    "Filled" = 2,
    "Canceled" = 3,
    "Expired" = 4,
}
export enum FillStatus {
    "Filled" = 1,
    "FillSendFail" = 2,
    "PendingWaitingFunds" = 3,
    "Invalid" = 4,
    "Expired" = 5,
    "Withdrawn" = 6,
    "XFillSendFail" = 7,
    "Complete" = 8,
}

export type BlockchainNetwork = {
    id: number;
    name: string;
    blockExplorerUrl: string;
    rpcUrl: string;
    lastReadEventsBlock: number;

    updatedAt: number;
    createdAt: number;
};

export type TokenMetadata = {
    pkId: number;
    logoUrl: string;
    symbol: string;
    address: string;
    decimals: number;
    blockchainNetwork: BlockchainNetwork;
};

export type Order = {
    pkId: number;
    orderId: string;
    potentialFills: PotentialFill[];
    orderFills: FillHistory[];
    orderWalletAddress: string;
    allowPartialFill: boolean;
    fillCcipMessageId?: string;
    xfillCcipMessageId?: string;
    orderStatus: OrderStatus;
    orderDate: number;
    filledDate?: number;
    blockchainNetwork: BlockchainNetwork;
    tokenMetadata: TokenMetadata;
    tokenAmount: string;
    expirationDate: number;
    transactionId: string;

    updatedAt: number;
    createdAt: number;
};

export type NewOrder = Omit<
    Order,
    "pkId" | "potentialFills" | "orderFills" | "updatedAt" | "createdAt"
> & {
    newPotentialFills: NewPotentialFill[];
};

export type PotentialFill = {
    pkId: number;
    orderPkId: number;
    destinationWalletAddress: string;
    blockchainNetwork: BlockchainNetwork;
    tokenMetadata: TokenMetadata;
    tokenAmount: string;
    active: boolean;

    updatedAt: number;
    createdAt: number;
};

export type NewPotentialFill = Omit<
    PotentialFill,
    "pkId" | "updatedAt" | "createdAt"
>;

export type FillHistory = {
    pkId: number;
    orderPkId: number;
    fillId: string;
    fillWalletAddress: string;
    blockchainNetwork: BlockchainNetwork;
    tokenMetadata: TokenMetadata;
    tokenAmount: string;
    fillStatus: FillStatus;
    transactionId: string;

    updatedAt: number;
    createdAt: number;
};

export type NewFillHistory = Omit<
    FillHistory,
    "pkId" | "updatedAt" | "createdAt"
>;
