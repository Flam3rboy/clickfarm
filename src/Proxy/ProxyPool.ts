import { EventEmitter } from "events";
import { ProxyManager } from "./ProxyManager";
import { Tor } from "./Tor";
import { MobileProxy } from "./MobileProxy";
import { makeid } from "../util/Util";
import { ProxyConfig, ProxyType } from "../types/Proxy";

export default class ProxyPool extends EventEmitter {
	private used: ProxyManager[] = [];
	private free: ProxyManager[] = [];
	public uuid: string;
	public type: ProxyType;

	constructor(private holds: typeof ProxyManager, private poolSize: number = 1) {
		super();
		if (!this.uuid) this.uuid = makeid();
		this.poolSize = Math.min(holds.available, poolSize);
		this.type = this.holds.type;
	}

	async init() {
		let promises = [];
		for (let i = 0; i < this.poolSize; i++) {
			promises.push(this.createProxy());
		}
		this.free = await Promise.all(promises);
	}

	async createProxy() {
		// @ts-ignore
		const proxy = new this.holds();
		return await this.handleProxy(proxy);
	}

	async handleProxy(proxy: ProxyManager) {
		await proxy.init();
		const self = this;
		proxy.on("released", async (newProxy: ProxyManager) => {
			self.used.remove(proxy);
			if (newProxy !== proxy) await self.handleProxy(newProxy);
			self.free.push(newProxy);
			self.emit("released", newProxy);
		});

		return proxy;
	}

	async getProxy() {
		let proxy = <ProxyManager>this.free.pop();
		// @ts-ignore
		if (!proxy && proxy?.constructor?.available) proxy = await this.createProxy();

		this.used.push(proxy);
		return proxy;
	}

	getConfig(): ProxyConfig {
		return {
			type: this.type,
			uuid: this.uuid,
			poolSize: this.poolSize,
			// @ts-ignore
			entries: this.list || [],
		};
	}

	static fromConfig(config: ProxyConfig): ProxyPool {
		var pool;
		// @ts-ignore
		if (config.type === "list") {
			const provider = require("./ProxyList").ProxyList;
			pool = new provider(config.entries || []);
		} else if (config.type === "tor") pool = new ProxyPool(Tor, config.poolSize);
		else if (config.type === "huawei-lte") pool = new ProxyPool(MobileProxy, config.poolSize);
		else throw new Error("invalid type");

		if (config.uuid) pool.uuid = config.uuid;

		return pool;
	}
}
