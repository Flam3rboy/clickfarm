import ProxyAgent from "proxy-agent";
import { Agent, AgentOptions } from "agent-base";
import { EventEmitter } from "events";

export class ProxyManager extends EventEmitter {
	public readonly agent: Agent;
	public url: string;

	constructor(public readonly protocol: string, public readonly ip: string, public readonly port: number) {
		super();
		this.url = `${protocol}://${ip}:${port}`;
		this.agent = new ProxyAgent(this.url);
	}

	public static get available() {
		return 0;
	}

	async init(): Promise<any> {}

	async release(): Promise<ProxyManager> {
		throw new Error("not implemented");
	}

	async close() {}
}
