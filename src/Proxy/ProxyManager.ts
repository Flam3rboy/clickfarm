import ProxyAgent from "proxy-agent";
import { Agent, AgentOptions } from "agent-base";
import { EventEmitter } from "events";
import { ProxyType } from "../types/Proxy";

export class ProxyManager extends EventEmitter {
	public readonly agent: Agent;
	public static type: ProxyType;

	constructor(public url: string) {
		super();
		this.agent = new ProxyAgent(this.url);
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
