export function dateStringToEpochSeconds(dateString: string) {
    return Math.floor(new Date(dateString).getTime() / 1000);
}
