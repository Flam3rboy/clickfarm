import ProxyAgent from "proxy-agent";
import { EventEmitter } from "events";
import { ProxyType } from "../types/Proxy";
import { Agent, AgentOptions } from "agent-base";

export interface ProxyAgent extends Agent {
	url?: string;
}

export class ProxyManager extends EventEmitter {
	public readonly agent: ProxyAgent;
	public static type: ProxyType;

	constructor(public url: string) {
		super();
		this.agent = new ProxyAgent(url);
		this.agent.url = url;
	}

	public static get available() {
		return 0;
	}

	async init(): Promise<any> {}

	async release(): Promise<ProxyManager> {
		this.emit("released", this);
		return this;
	}

	async close() {}
}
