export type PossibleOrderFill = {
    amount: string;
    token: string;
    chain: string;
};

export type TokenDetails = {
    logoUrl: string;
    symbol: string;
    address: string;
    decimals: number;
    blockChainId: number;
};

export type OrderFillHistory = {
    fillId: string;
    fillWalletAddress: string;
    amount: string;
    chain: string;
    tokenDetails: TokenDetails;
    fillStatus: number;
    expirationDate: number;
};

export type OfferDetails = {
    amount: string;
    chain: string;
    tokenDetails: TokenDetails;
    pendingBasisPoints: number;
    filledBasisPoints: number;
    orderStatus: number;
};
export type GetOrderHttpResponse = {
    id: number;
    receive: PossibleOrderFill[];
    fillHistory: OrderFillHistory[];
    offer: OfferDetails;
    status: number;
    chain: string[];
    creator: string;
};
