export type ContractOffer = {
    owner: string;
    tokenAddress?: string;
    tokenAmount?: bigint;
    nftAddress?: string;
    nftId?: string;
    allowPartialFills: boolean;
    expiration: number;
    fillOptions: {
        chainId: number;
        tokenAddress: string;
        tokenAmount: bigint;
        destAddress: string;
    }[];
    status: number;
    offerFills: {
        fillId: number;
        fillChain: number;
        fillTokenAddress: string;
        fillTokenAmount: bigint;
        deadline: number;
        pending: boolean;
    };
    pendingBP: number;
    filledBP: number;
};

export type ContractFill = {
    owner: string;
    offerChain: number;
    offerId: number;
    fillTokenAddress: string;
    fillTokenAmount: bigint;
    deadline: number;
    status: number;
};
