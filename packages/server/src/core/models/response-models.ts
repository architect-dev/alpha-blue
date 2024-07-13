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

export type OfferDetails = {
    amount: string;
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
