import { ProxyManager } from "./ProxyManager";
import { ChildProcess, spawn } from "child_process";
import { sleep, tempDir } from "../util/Util";

export class Tor extends ProxyManager {
	private process?: ChildProcess;
	private intalized: boolean;

	constructor(port: number) {
		super("socks5", "localhost", port);
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
			this.process?.stdout?.on("data", (log) => {
				log = log.toString().slice(0, -1);
				history += log;
				if (log.includes("100% (done)")) resolve(true);
				if (log.includes("[err]")) reject(history);
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
