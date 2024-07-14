import {
    BlockchainNetworkDbModel,
    TokenMetadataDbModel,
} from "src/core/models/db-models";
import {
    BlockchainNetwork,
    TokenMetadata,
} from "src/core/models/domain-models";
import { dateStringToEpochSeconds } from "src/core/utils/dates";

export function blockchainNetworkDbModelToBlockchainNetwork(
    blockchainNetworkDbModel: BlockchainNetworkDbModel
): BlockchainNetwork {
    return {
        id: blockchainNetworkDbModel.id,
        name: blockchainNetworkDbModel.name,
        blockExplorerUrl: blockchainNetworkDbModel.block_explorer_url,
        rpcUrl: blockchainNetworkDbModel.rpc_url,
        contractRpcUrl: blockchainNetworkDbModel.contract_rpc_url,
        lastReadEventsBlock: blockchainNetworkDbModel.last_read_events_block,
        chainImageUrl: blockchainNetworkDbModel.chain_image_url,
        updatedAt: dateStringToEpochSeconds(
            blockchainNetworkDbModel.updated_at
        ),
        createdAt: dateStringToEpochSeconds(
            blockchainNetworkDbModel.created_at
        ),
    };
}

export function tokenMetadataDbModelToTokenMetadata(
    tokenMetadataDbModel: TokenMetadataDbModel,
    blockchainNetwork: BlockchainNetwork
): TokenMetadata {
    return {
        pkId: tokenMetadataDbModel.pk_id,
        logoUrl: tokenMetadataDbModel.logo_url,
        symbol: tokenMetadataDbModel.symbol,
        address: tokenMetadataDbModel.address,
        decimals: tokenMetadataDbModel.decimals,
        blockchainNetwork: blockchainNetwork,
    };
}
