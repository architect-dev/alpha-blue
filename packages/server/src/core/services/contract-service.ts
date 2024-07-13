import {
    Contract,
    EventLog,
    Interface,
    JsonRpcProvider,
    LogDescription,
} from "ethers";

export class ContractWrapper {
    contract: Contract;

    constructor(address: string, rpcUrl: string) {
        const provider = new JsonRpcProvider(`${rpcUrl}`);
        const contractAbi = "contractAbi"; ///////
        this.contract = new Contract(address, contractAbi, provider);
    }

    public parseEventLogs(event: EventLog): LogDescription | null {
        const iface = new Interface(contractAbi);
        return iface.parseLog({
            topics: event.topics as string[],
            data: event.data,
        });
    }
}
