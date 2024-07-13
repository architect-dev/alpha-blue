import { Knex } from "knex";
import {
    createdAtUpdatedAtRows,
    createForeignKey,
    createTableIfNotFound,
} from "../knex/utils";

const blockchainNetworkTable = "blockchain_network";
const tokenMetadataTable = "token_metadata";
const orderTable = "order";
const potentialFillTable = "potential_fill";
const fillHistoryTable = "fill_history";

const blockChainData = [
    {
        id: 84532,
        name: "Base Sepolia",
        block_explorer_url: "https://base-sepolia.blockscout.com",
        rpc_url: "https://base-sepolia.blockscout.com/api",
        chain_image_url: "https://icons.llamao.fi/icons/chains/rsz_base.jpg",
    },
    {
        id: 44787,
        name: "Celo Alfajores",
        block_explorer_url: "https://celo-alfajores.blockscout.com",
        rpc_url: "https://celo-alfajores.blockscout.com/api",
        chain_image_url: "https://cryptologos.cc/logos/celo-celo-logo.png",
    },
    {
        id: 421614,
        name: "Arbitrum Sepolia",
        block_explorer_url: "https://sepolia-explorer.arbitrum.io",
        rpc_url:
            "https://tiniest-serene-waterfall.arbitrum-sepolia.quiknode.pro/0d6e219b77ded0fdbfbd9f64e8a54f92c8989aa2/",
        chain_image_url: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    },
];

const USDC_LOGO = "https://cryptologos.cc/logos/usd-coin-usdc-logo.png";
const WETH_LOGO =
    "https://assets.coingecko.com/coins/images/32882/large/WETH_%281%29.png";
const WBTC_LOGO = "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png";
const BNB_LOGO = "https://cryptologos.cc/logos/bnb-bnb-logo.png";

const tokenMetadata = [
    {
        symbol: "WETH",
        address: "0x4134b91C1A8e7cb778b89938e1910E5C2e4CDF66",
        decimals: "18",
        logo_url: WETH_LOGO,
        network_id: 84532,
    },
    {
        symbol: "WBTC",
        address: "0x1Ab43ddF4DD48696C48A34c5359324A24e14cC13",
        decimals: "18",
        logo_url: WBTC_LOGO,
        network_id: 84532,
    },
    {
        symbol: "USDC",
        address: "0x2474396A9f5c2d068794727EE0A5D2e0eC46A613",
        decimals: "6",
        logo_url: USDC_LOGO,
        network_id: 84532,
    },
    {
        symbol: "BNB",
        address: "0x046381E3750f367540d046075C4dB392D3F48569",
        decimals: "8",
        logo_url: BNB_LOGO,
        network_id: 84532,
    },
];

export async function up(knex: Knex) {
    await createTableIfNotFound(knex, blockchainNetworkTable, (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table.string("block_explorer_url", 100).notNullable();
        table.string("rpc_url", 150).notNullable();
        table.string("chain_image_url", 300).notNullable();
        table.integer("last_read_events_block").notNullable().defaultTo(0);
        createdAtUpdatedAtRows(table, knex);
    });

    await knex.batchInsert(blockchainNetworkTable, blockChainData);

    await createTableIfNotFound(knex, tokenMetadataTable, (table) => {
        table.increments("pk_id").primary();
        table.string("symbol", 120).notNullable();
        table.string("address", 100).notNullable();
        table.string("decimals", 100).notNullable();
        table.string("logo_url", 300).nullable();

        createForeignKey(table, "network_id", "id", blockchainNetworkTable, {
            createForeignKeyRow: true,
        });

        createdAtUpdatedAtRows(table, knex);
    });

    await knex.batchInsert(tokenMetadataTable, tokenMetadata);

    await createTableIfNotFound(knex, orderTable, (table) => {
        table.increments("pk_id").primary();
        table.string("order_id", 100).notNullable();
        table.string("order_wallet_address", 100).notNullable();
        table.boolean("allow_partial_fill").notNullable();
        table.string("deposit_token_address", 100).nullable();
        table.string("depsoite_amount", 100).nullable();
        table.string("fill_ccip_message_id", 100).nullable();
        table.string("xfill_ccip_message_id", 100).nullable();
        table.string("nft_address", 100).nullable();
        table.string("nft_id", 100).nullable();
        table.integer("order_date").notNullable();
        table.integer("filled_date").nullable();
        table.integer("filled_basis_points").notNullable().defaultTo(0);
        table.integer("pending_basis_points").notNullable().defaultTo(0);

        createForeignKey(table, "network_id", "id", blockchainNetworkTable, {
            createForeignKeyRow: true,
        });

        createForeignKey(table, "token_pk_id", "pk_id", tokenMetadataTable, {
            createForeignKeyRow: true,
        });

        table.string("token_amount", 100).nullable();
        table.integer("expiration_date").notNullable();
        table.integer("order_status").notNullable();

        createdAtUpdatedAtRows(table, knex);
    });

    await createTableIfNotFound(knex, potentialFillTable, (table) => {
        table.increments("pk_id").primary();
        table.string("destination_wallet_address", 100).notNullable();

        createForeignKey(table, "order_pk_id", "pk_id", orderTable, {
            createForeignKeyRow: true,
        });

        createForeignKey(table, "network_id", "id", blockchainNetworkTable, {
            createForeignKeyRow: true,
        });

        createForeignKey(table, "token_pk_id", "pk_id", tokenMetadataTable, {
            createForeignKeyRow: true,
        });

        table.string("token_amount", 100).notNullable();
        table.boolean("active").notNullable().defaultTo(true);

        createdAtUpdatedAtRows(table, knex);
    });

    await createTableIfNotFound(knex, fillHistoryTable, (table) => {
        table.increments("pk_id").primary();
        table.string("fill_id", 100).notNullable();
        table.string("fill_wallet_address", 100).notNullable();

        createForeignKey(table, "order_pk_id", "pk_id", orderTable, {
            createForeignKeyRow: true,
        });

        createForeignKey(table, "network_id", "id", blockchainNetworkTable, {
            createForeignKeyRow: true,
        });

        createForeignKey(table, "token_pk_id", "pk_id", tokenMetadataTable, {
            createForeignKeyRow: true,
        });

        table.string("token_amount", 100).notNullable();
        table.integer("fill_status").notNullable();
        table.integer("expiration_date").notNullable();
        createdAtUpdatedAtRows(table, knex);
    });
}

export async function down(knex: Knex) {
    await knex.schema.dropTable(potentialFillTable);
    await knex.schema.dropTable(fillHistoryTable);
    await knex.schema.dropTable(orderTable);
    await knex.schema.dropTable(tokenMetadataTable);
    await knex.schema.dropTable(blockchainNetworkTable);
}
