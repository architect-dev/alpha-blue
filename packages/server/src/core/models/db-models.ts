export type BlockchainNetworkDbModel = {
    id: number;
    name: string;
    block_explorer_url: string;
    rpc_url: string;
    last_read_events_block: number;

    created_at: string;
    updated_at: string;
};

export type TokenMetadataDbModel = {
    id: number;
    logo_url: string;
    symbol: string;
    address: string;
    decimals: number;
    network_id: number;
};

export type OrderDbModel = {
    pk_id: number;
    order_id: string;
    transaction_id: string;
    order_wallet_address: string;
    allow_partial_fill: boolean;
    fill_ccip_message_id?: string;
    xfill_ccip_message_id?: string;
    order_status: number;
    order_date: number;
    filled_date?: number;
    network_id: number;
    token_pk_id: number;
    token_amount: string;
    expiration_date: number;

    created_at: string;
    updated_at: string;
};

export type PotentialFillDbModel = {
    pk_id: number;
    order_pk_id: number;
    destination_wallet_address: string;
    network_id: number;
    token_pk_id: number;
    token_amount: string;
    active: boolean;

    created_at: string;
    updated_at: string;
};

export type FillHistoryDbModel = {
    pk_id: number;
    order_pk_id: number;
    fill_id: string;
    fill_wallet_address: string;
    network_id: number;
    token_pk_id: number;
    token_amount: string;
    fill_status: number;
    transaction_id: string;

    created_at: string;
    updated_at: string;
};
