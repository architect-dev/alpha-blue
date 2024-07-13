import { Order } from "src/core/models/domain-models";
import { GetOrderHttpResponse } from "src/core/models/response-models";
import { stripContractId } from "src/core/utils/format-tools";

export function toGetOrdersHttpResponse(order: Order): GetOrderHttpResponse {
    const strippedId = stripContractId(order.orderId);

    const potentialFillsResponse = order.potentialFills.map((fill) => {
        const { tokenMetadata, tokenAmount } = fill;

        return {
            amount: tokenAmount,
            token: tokenMetadata.address,
            chain: tokenMetadata.blockchainNetwork.name,
            tokenDetails: {
                logoUrl: tokenMetadata.logoUrl,
                symbol: tokenMetadata.symbol,
                address: tokenMetadata.address,
                decimals: tokenMetadata.decimals,
                blockChainId: tokenMetadata.blockchainNetwork.id,
            },
        };
    });

    const offer = {
        amount: order.tokenAmount,
        chain: order.blockchainNetwork.name,
        tokenDetails: {
            logoUrl: order.tokenMetadata.logoUrl,
            symbol: order.tokenMetadata.symbol,
            address: order.tokenMetadata.address,
            decimals: order.tokenMetadata.decimals,
            blockChainId: order.tokenMetadata.blockchainNetwork.id,
        },
    };

    return {
        id: strippedId,
        receive: potentialFillsResponse,
        creator: order.orderWalletAddress,
        offer,
        status: order.orderStatus,
        chain: order.potentialFills.map((fill) => fill.blockchainNetwork.name),
    };
}
