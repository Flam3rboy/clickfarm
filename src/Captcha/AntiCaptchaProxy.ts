import { CaptchaConfig, CaptchaSolveOptions } from "../types/Captcha";
import httpProxy from "http-proxy";
import { makeid } from "../util/Util";
import fetch from "node-fetch";
import net, { Server } from "net";
import { Agent } from "agent-base";

var AntiCaptcha;
try {
	AntiCaptcha = require("./AntiCaptchaTrial").AntiCaptchaTrial;
} catch (error) {
	AntiCaptcha = require("./AntiCaptcha").AntiCaptcha;
}

export class AntiCaptchaProxy extends AntiCaptcha {
	password: string = makeid(20);
	proxy: httpProxy;
	server: Server;
	port = 5823;
	proxyAddress: string;
	agent?: Agent;

	constructor(key: string) {
		super(key);
		const self = this;
		this.service = "anti-captcha-proxy";

		this.server = net
			.createServer((socket) => {
				var start = true;
				const con = new net.Socket();

				socket.on("data", (buffer) => {
					try {
						if (start) {
							start = false;

							const data = buffer.toString();
							const lines = data.split("\r\n");
							const CONNECT = lines.find((x) => x.startsWith("CONNECT"));
							const auth = lines.find((x) => x.toLowerCase().startsWith("proxy-authorization"));
							socket.on("error", (e) => console.error("socket error", e));
							console.log({ connect: lines[0], auth });

							if (
								!auth ||
								auth.split(":")[1].slice(1).split(" ")[1] !==
									Buffer.from(`admin:${this.password}`).toString("base64")
							) {
								socket.write(
									`HTTP/1.1 407 Proxy Authorization Required\r\nProxy-Authenticate: Basic realm="test"\r\n\r\n`
								);
								socket.end();
								return;
							}

							const opts = {
								port: 8080,
								host: "localhost",
							};

							console.log(opts);

							con.connect(opts);
							// con.connect({ port: this.agent.options.port, host: this.agent?.options.host });

							con.once("connect", () => {
								con.write(buffer);
							});

							socket.pipe(con);

							con.on("error", socket.end).once("end", socket.end).pipe(socket);
						}
					} catch (error) {
						socket.end();
					}
				});
			})
			.listen(this.port, () => {
				console.log("Captcha reverse proxy started on 0.0.0.0:" + this.port, "password: " + this.password);
			});
	}

	async init() {
		this.proxyAddress = await (await fetch("https://api.my-ip.io/ip")).text();

		return super.init();
	}

	async solve(opts: CaptchaSolveOptions) {
		if (!opts.task) opts.task = {};
		var type = opts.task?.type;

		switch (opts.task?.type) {
			case "recaptcha2":
				type = "RecaptchaV2Task";
				break;
			case "hcaptcha":
				type = "HCaptchaTask";
				break;
		}
		// this.agent = opts.agent;

		opts.task = {
			...opts.task,
			type,
			proxyType: "http",
			proxyAddress: this.proxyAddress,
			proxyPort: this.port,
			proxyLogin: "admin",
			proxyPassword: this.password,
			userAgent: opts.userAgent,
		};
		console.log(opts.task);
		return super.solve(opts);
	}

	async close() {
		this.server.close();
	}
}
