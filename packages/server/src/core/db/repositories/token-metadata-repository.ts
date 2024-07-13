import { Knex } from "knex";
import { DatabaseManager } from "src/core/db/db-manager";
import { getBlockchainNetwork } from "src/core/db/repositories/blockchain-repository";
import { tokenMetadataDbModelToTokenMetadata } from "src/core/mappers/blockchain-token-mappers";
import { TokenMetadataDbModel } from "src/core/models/db-models";
import { TokenMetadata } from "src/core/models/domain-models";

const tokenMetadataTable = "token_metadata";

const withPkId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        pkId?: number;
    }
) => {
    if (options.pkId) {
        void queryBuilder.where(`${tokenMetadataTable}.pk_id`, options.pkId);
    }
};

const withSymbol = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        symbol?: string;
    }
) => {
    if (options.symbol) {
        void queryBuilder.where(`${tokenMetadataTable}.symbol`, options.symbol);
    }
};

const withNetworkId = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        networkId?: number;
    }
) => {
    if (options.networkId) {
        void queryBuilder.where(
            `${tokenMetadataTable}.network_id`,
            options.networkId
        );
    }
};

const withAddress = (
    queryBuilder: Knex.QueryBuilder,
    options: {
        address?: number;
    }
) => {
    if (options.address) {
        void queryBuilder.where(
            `${tokenMetadataTable}.token_address`,
            options.address
        );
    }
};

export async function getTokenMetadata(options: {
    pkId?: number;
    symbol?: string;
    networkId?: number;
    tokenAddress?: string;
}): Promise<TokenMetadata> {
    const databaseConnection = DatabaseManager.getInstance();

    const dbTokenMetadatas = await databaseConnection
        .select<TokenMetadataDbModel[]>()
        .from(tokenMetadataTable)
        .modify(withPkId, {
            pkId: options?.pkId,
        })
        .modify(withNetworkId, {
            networkId: options?.networkId,
        })
        .modify(withSymbol, {
            symbol: options?.symbol,
        })
        .modify(withAddress, {
            symbol: options?.tokenAddress,
        });

    let dbTokenMetadata: TokenMetadataDbModel;

    if (dbTokenMetadatas && dbTokenMetadatas.length == 1)
        dbTokenMetadata = dbTokenMetadatas[0];
    else throw new Error("Token metadata not found");

    const blockchainNetwork = await getBlockchainNetwork({
        networkId: dbTokenMetadata.network_id,
    });

    return tokenMetadataDbModelToTokenMetadata(
        dbTokenMetadata,
        blockchainNetwork
    );
}
