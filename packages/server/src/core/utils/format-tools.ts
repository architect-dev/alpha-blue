export function formatContractId(
    blockchainName: string,
    source: string,
    offerId: number
) {
    return `${blockchainName.replace(" ", "-")}-${source}-${offerId}`;
}

export function stripContractIdPrefix(id: string) {
    const orderNumber = id.substring(id.lastIndexOf("-") + 1);

    return parseInt(orderNumber);
}
