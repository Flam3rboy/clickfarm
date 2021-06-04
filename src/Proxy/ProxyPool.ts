import { EventEmitter } from "events";
import { ProxyManager } from "./ProxyManager";

export class ProxyPool extends EventEmitter {
	private used: ProxyManager[] = [];
	private free: ProxyManager[] = [];
	private portCounter = 9000;

	constructor(private holds: typeof ProxyManager, private poolSize: number = 1) {
		super();
		this.poolSize = Math.min(holds.available, poolSize);
	}

	async init() {
		this.holds;
		let promises = [];
		for (let i = 0; i < this.poolSize; i++) {
			promises.push(this.createProxy());
		}
		this.free = await Promise.all(promises);
	}

	async createProxy() {
		// @ts-ignore
		const proxy = new this.holds(this.portCounter++);
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
}
