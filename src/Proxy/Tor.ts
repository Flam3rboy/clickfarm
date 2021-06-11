import { ProxyManager } from "./ProxyManager";
import { ChildProcess, spawn } from "child_process";
import { sleep, tempDir } from "../util/Util";
import { ProxyType } from "../types/Proxy";
import { db } from "../util";

export class Tor extends ProxyManager {
	private process?: ChildProcess;
	private intalized: boolean;
	public static type: ProxyType = "tor";
	static counter = 0;
	public port: number;
	private id: number;

	constructor() {
		const port = Tor.counter + 9000;
		super("socks5://localhost:" + port);
		this.id = Tor.counter;
		this.port = port;
		Tor.counter++;
	}

	public static get available() {
		return 100000;
	}

	async init() {
		if (this.intalized) return;
		this.intalized = true;

		const dir = await tempDir();
		this.process = spawn("tor", `--SocksPort ${this.port} --DataDirectory ${dir}`.split(" "));

		await new Promise((resolve, reject) => {
			let history = "";
			this.process?.on("error", () => {
				reject("You need to install TOR and add it to your PATH");
			});
			this.process?.stdout?.on("data", (log) => {
				log = log.toString();
				console.log(log);
				if (log.includes("[warn]")) history += log;
				if (log.includes("100% (done)")) {
					db.events.emit("event", { message: `TOR ${this.port} started` });
					resolve(true);
				}
				if (log.includes("[err]")) reject(history + log);
			});
		});
	}

	async release() {
		this.process?.kill("SIGHUP");
		await sleep(500);
		this.emit("released", this);
		return this;
	}
}
