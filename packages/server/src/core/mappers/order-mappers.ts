import { OrderDbModel } from "src/core/models/db-models";
import {
    BlockchainNetwork,
    FillHistory,
    NewOrder,
    Order,
    PotentialFill,
    TokenMetadata,
} from "src/core/models/domain-models";
import { dateStringToEpochSeconds } from "src/core/utils/dates";

export function orderDbModelToOrder(
    orderDbModel: OrderDbModel,
    blockchainNetwork: BlockchainNetwork,
    tokenMetadata: TokenMetadata,
    potentialFills: PotentialFill[],
    fillHistory: FillHistory[]
): Order {
    return {
        pkId: orderDbModel.pk_id,
        orderId: orderDbModel.order_id,
        potentialFills: potentialFills,
        orderFills: fillHistory,
        orderWalletAddress: orderDbModel.order_wallet_address,
        allowPartialFill: orderDbModel.allow_partial_fill,
        fillCcipMessageId: orderDbModel.fill_ccip_message_id,
        xfillCcipMessageId: orderDbModel.xfill_ccip_message_id,
        orderStatus: orderDbModel.order_status,
        orderDate: orderDbModel.order_date,
        filledDate: orderDbModel.filled_date,
        blockchainNetwork: blockchainNetwork,
        tokenMetadata: tokenMetadata,
        tokenAmount: orderDbModel.token_amount,
        expirationDate: orderDbModel.expiration_date,
        updatedAt: dateStringToEpochSeconds(orderDbModel.updated_at),
        createdAt: dateStringToEpochSeconds(orderDbModel.created_at),
    };
}

export function newOrderToOrderDbModel(
    orderDbModel: NewOrder
): Omit<OrderDbModel, "pk_id" | "updated_at" | "created_at"> {
    return {
        order_id: orderDbModel.orderId,
        order_wallet_address: orderDbModel.orderWalletAddress,
        allow_partial_fill: orderDbModel.allowPartialFill,
        fill_ccip_message_id: orderDbModel.fillCcipMessageId,
        xfill_ccip_message_id: orderDbModel.xfillCcipMessageId,
        order_status: orderDbModel.orderStatus,
        order_date: orderDbModel.orderDate,
        filled_date: orderDbModel.filledDate,
        network_id: orderDbModel.blockchainNetwork.id,
        token_pk_id: orderDbModel.tokenMetadata.pkId,
        token_amount: orderDbModel.tokenAmount,
        expiration_date: orderDbModel.expirationDate,
    };
}
