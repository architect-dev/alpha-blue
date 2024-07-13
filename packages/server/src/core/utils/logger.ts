export enum LogLevel {
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
}

export const log = (obj: any, _level: LogLevel = LogLevel.INFO): void => {
    // tslint:disable-next-line: no-console
    switch (_level) {
        case LogLevel.TRACE:
            console.trace(obj);
            break;
        case LogLevel.DEBUG:
            console.debug(obj);
            break;
        case LogLevel.INFO:
            console.log(obj);
            break;
        case LogLevel.WARN:
            console.warn(obj);
            break;
        case LogLevel.ERROR:
            console.error("Logging original error below");
            console.error(obj);
            break;
        default:
            console.log(obj);
            break;
    }
};
