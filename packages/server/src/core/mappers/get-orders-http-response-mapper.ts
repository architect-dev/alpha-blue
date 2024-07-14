import { Order, TokenMetadata } from "src/core/models/domain-models";
import { GetOrderHttpResponse } from "src/core/models/response-models";

function formatTokenDetails(tokenMetadata: TokenMetadata) {
    return {
        logoUrl: tokenMetadata.logoUrl,
        symbol: tokenMetadata.symbol,
        address: tokenMetadata.address,
        decimals: tokenMetadata.decimals,
        blockChainId: tokenMetadata.blockchainNetwork.id,
    };
}

export function toGetOrdersHttpResponse(order: Order): GetOrderHttpResponse {
    const potentialFillsResponse = order.potentialFills.map((fill) => {
        const { tokenMetadata, tokenAmount } = fill;

        return {
            amount: tokenAmount,
            token: tokenMetadata.address,
            chain: tokenMetadata.blockchainNetwork.name,
            tokenDetails: formatTokenDetails(tokenMetadata),
        };
    });

    const offer = {
        amount: order.tokenAmount,
        chain: order.blockchainNetwork.name,
        tokenDetails: formatTokenDetails(order.tokenMetadata),
        pendingBasisPoints: order.pendingBasisPoints,
        filledBasisPoints: order.filledBasisPoints,
        orderStatus: order.orderStatus,
        partialFill: order.allowPartialFill,
    };

    const fills = order.orderFills;
    const swapHistory = [];

    for (const fill of fills) {
        const { tokenMetadata, tokenAmount } = fill;

        swapHistory.push({
            fillId: fill.fillId,
            fillWalletAddress: fill.fillWalletAddress,
            amount: tokenAmount,
            chain: tokenMetadata.blockchainNetwork.name,
            tokenDetails: formatTokenDetails(tokenMetadata),
            fillStatus: fill.fillStatus,
            expirationDate: fill.expirationDate,
        });
    }

    return {
        id: order.orderId,
        receive: potentialFillsResponse,
        fillHistory: swapHistory,
        creator: order.orderWalletAddress,
        offer,
        status: order.orderStatus,
        chain: order.potentialFills.map((fill) => fill.blockchainNetwork.name),
    };
}
