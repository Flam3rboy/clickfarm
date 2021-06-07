import { ProxyManager } from "./ProxyManager";
import ProxyPool from "./ProxyPool";

export class ProxyList extends ProxyPool {
	constructor(public list: string[]) {
		super(ProxyManager, list.length);
		this.type = "list";
	}

	async createProxy() {
		const proxy = this.list.pop();
		if (!proxy) throw new Error("no proxy available");
		return new ProxyManager(proxy);
	}
}
