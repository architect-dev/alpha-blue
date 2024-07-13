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
    },
    {
        id: 44787,
        name: "Celo Alfajores",
        block_explorer_url: "https://celo-alfajores.blockscout.com",
        rpc_url: "https://celo-alfajores.blockscout.com/api",
    },
    {
        id: 421614,
        name: "Arbitrum Sepolia",
        block_explorer_url: "https://sepolia-explorer.arbitrum.io",
        rpc_url: "https://sepolia-explorer.arbitrum.io/api",
    },
];

export async function up(knex: Knex) {
    await createTableIfNotFound(knex, blockchainNetworkTable, (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table.string("block_explorer_url", 100).notNullable();
        table.string("rpc_url", 100).notNullable();
        table.integer("last_read_events_block").notNullable().defaultTo(0);
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

    await createTableIfNotFound(knex, orderTable, (table) => {
        table.increments("pk_id").primary();
        table.string("order_id", 100).notNullable();
        table.string("order_wallet_address", 100).notNullable();
        table.boolean("allow_partial_fill").notNullable();
        table.string("fill_ccip_message_id", 100).nullable();
        table.string("xfill_ccip_message_id", 100).nullable();
        table.integer("order_date").notNullable();
        table.string("transaction_id").notNullable();
        table.integer("filled_date").nullable();

        createForeignKey(table, "network_id", "id", blockchainNetworkTable, {
            createForeignKeyRow: true,
        });

        createForeignKey(table, "token_pk_id", "pk_id", tokenMetadataTable, {
            createForeignKeyRow: true,
        });

        table.string("token_amount", 100).notNullable();
        table.integer("expirationDate").notNullable();
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
        table.string("transaction_id").notNullable();
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
