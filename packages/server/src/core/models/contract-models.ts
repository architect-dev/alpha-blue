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
    depositTokenAddress: string;
    depositAmount: bigint;
    status: number;
    offerFills: {
        fillId: number;
        fillChain: number;
        fillTokenAddress: string;
        fillTokenAmount: bigint;
        deadline: number;
        pending: boolean;
    };
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
