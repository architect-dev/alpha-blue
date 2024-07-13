export function dateStringToEpochSeconds(dateString: string) {
    return Math.floor(new Date(dateString).getTime() / 1000);
}

export const currentSeconds = () => Math.floor(Date.now() / 1000);
