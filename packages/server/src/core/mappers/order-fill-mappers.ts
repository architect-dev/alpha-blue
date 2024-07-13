import {
    FillHistoryDbModel,
    PotentialFillDbModel,
} from "src/core/models/db-models";
import {
    BlockchainNetwork,
    FillHistory,
    NewFillHistory,
    NewPotentialFill,
    PotentialFill,
    TokenMetadata,
} from "src/core/models/domain-models";
import { dateStringToEpochSeconds } from "src/core/utils/dates";

export function potentialFillDbModelToPotentialFill(
    potentialFillDbModel: PotentialFillDbModel,
    blockchainNetwork: BlockchainNetwork,
    tokenMetadata: TokenMetadata
): PotentialFill {
    return {
        pkId: potentialFillDbModel.pk_id,
        orderPkId: potentialFillDbModel.order_pk_id,
        destinationWalletAddress:
            potentialFillDbModel.destination_wallet_address,
        blockchainNetwork: blockchainNetwork,
        tokenMetadata: tokenMetadata,
        tokenAmount: potentialFillDbModel.token_amount,
        active: potentialFillDbModel.active,
        updatedAt: dateStringToEpochSeconds(potentialFillDbModel.updated_at),
        createdAt: dateStringToEpochSeconds(potentialFillDbModel.created_at),
    };
}

export function newPotentialFillToPotentialFillDbModel(
    newPotentialFill: NewPotentialFill,
    orderPkId: number
): Omit<PotentialFillDbModel, "pk_id" | "updated_at" | "created_at"> {
    return {
        order_pk_id: orderPkId,
        destination_wallet_address: newPotentialFill.destinationWalletAddress,
        network_id: newPotentialFill.blockchainNetwork.id,
        token_pk_id: newPotentialFill.tokenMetadata.pkId,
        token_amount: newPotentialFill.tokenAmount,
        active: newPotentialFill.active,
    };
}

export function fillHistoryDbModelToFillHistory(
    fillHistoryDbModel: FillHistoryDbModel,
    blockchainNetwork: BlockchainNetwork,
    tokenMetadata: TokenMetadata
): FillHistory {
    return {
        pkId: fillHistoryDbModel.pk_id,
        orderPkId: fillHistoryDbModel.order_pk_id,
        fillId: fillHistoryDbModel.fill_id,
        fillWalletAddress: fillHistoryDbModel.fill_wallet_address,
        blockchainNetwork: blockchainNetwork,
        tokenMetadata: tokenMetadata,
        tokenAmount: fillHistoryDbModel.token_amount,
        fillStatus: fillHistoryDbModel.fill_status,
        expirationDate: fillHistoryDbModel.expiration_date,
        updatedAt: dateStringToEpochSeconds(fillHistoryDbModel.updated_at),
        createdAt: dateStringToEpochSeconds(fillHistoryDbModel.created_at),
    };
}

export function newFillHistoryToFillHistoryDbModel(
    newFillHistory: NewFillHistory
): Omit<FillHistoryDbModel, "pk_id" | "updated_at" | "created_at"> {
    return {
        order_pk_id: newFillHistory.orderPkId,
        fill_id: newFillHistory.fillId,
        network_id: newFillHistory.blockchainNetwork.id,
        token_pk_id: newFillHistory.tokenMetadata.pkId,
        token_amount: newFillHistory.tokenAmount,
        fill_status: newFillHistory.fillStatus,
        fill_wallet_address: newFillHistory.fillWalletAddress,
        expiration_date: newFillHistory.expirationDate,
    };
}
