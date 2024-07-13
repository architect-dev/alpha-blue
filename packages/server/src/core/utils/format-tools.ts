export function formatContractId(blockchainName: string, offerId: number) {
    return `${blockchainName.replace(" ", "-")}-${offerId}`;
}
