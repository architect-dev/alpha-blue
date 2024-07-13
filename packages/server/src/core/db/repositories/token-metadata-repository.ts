import { DatabaseManager } from "src/core/db/db-manager";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { tokenMetadataDbModelToTokenMetadata } from "src/core/mappers/blockchain-token-mappers";
import { TokenMetadataDbModel } from "src/core/models/db-models";
import { TokenMetadata } from "src/core/models/domain-models";

const tokenMetadataTable = "token_metadata";

export async function getTokenMetadata(
    tokenPkId: number
): Promise<TokenMetadata> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbTokenMetadatas = await databaseConnection
        .select<TokenMetadataDbModel[]>()
        .from(tokenMetadataTable)
        .where("pk_id", tokenPkId);

    let dbTokenMetadata: TokenMetadataDbModel;

    if (dbTokenMetadatas && dbTokenMetadatas.length == 1)
        dbTokenMetadata = dbTokenMetadatas[0];
    else throw new Error("Token metadata not found");

    const blockchainNetwork = await getBlockchainNetwork(
        dbTokenMetadata.network_id
    );

    return tokenMetadataDbModelToTokenMetadata(
        dbTokenMetadata,
        blockchainNetwork
    );
}
