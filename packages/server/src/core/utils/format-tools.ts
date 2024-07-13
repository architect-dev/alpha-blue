export function formatContractId(blockchainName: string, offerId: number) {
    return `${blockchainName.replace(" ", "-")}-${offerId}`;
}

export function stripContractId(id: string) {
    const orderNumber = id.substring(id.lastIndexOf("-") + 1);

    return parseInt(orderNumber);
}
