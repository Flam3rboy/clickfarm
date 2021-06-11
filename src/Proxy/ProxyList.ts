import { ProxyManager } from "./ProxyManager";
import ProxyPool from "./ProxyPool";

export class ProxyList extends ProxyPool {
	private _list: string[];

	constructor(public list: string[]) {
		super(ProxyManager, list.length);
		this.type = "list";
		this._list = list;
	}

	async createProxy() {
		const entry = this._list.random();
		this._list.remove(entry);
		if (!entry) throw new Error("no proxy available");
		const proxy = new ProxyManager(entry);

		proxy.on("released", async (newProxy: ProxyManager) => {
			this._list.push(entry);
		});

		return proxy;
	}
}
