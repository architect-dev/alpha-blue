export type PossibleOrderFill = {
    amount: bigint;
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

export type OfferDetails = {
    amount: bigint;
    chain: string;
    tokenDetails: TokenDetails;
};
export type GetOrderHttpResponse = {
    id: number;
    receive: PossibleOrderFill[];
    offer: OfferDetails;
    status: number;
    chain: string[];
};
